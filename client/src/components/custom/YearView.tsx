import React, {useState} from 'react';
import {format, startOfMonth, isSameMonth, isWithinInterval, isSameDay, isAfter} from 'date-fns';
import {useGoals} from "@/components/contexts/GoalContext.tsx";
import {DateRange, Goal} from "@/types/goal.ts";

interface YearCalendarProps {
    goals?: Goal[];
    currentYear: number;
    onRangeSelected: (range: DateRange) => void;
    onYearChange: (year: number) => void;
    onGoalClick?: (goal: Goal) => void;
}

const YearView: React.FC<YearCalendarProps> = ({
                                                   goals = [],
                                                   currentYear,
                                                   onRangeSelected,
                                                   onGoalClick
                                               }) => {
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        start: null,
        end: null
    });
    const [isSelecting, setIsSelecting] = useState(false);
    const {hasOverlap} = useGoals();

    const months = Array.from({length: 12}, (_, i) => startOfMonth(new Date(currentYear, i)));

    const getDateGoals = (date: Date) => {
        return goals.filter(goal =>
            isWithinInterval(date, {start: goal.startDate, end: goal.endDate})
        );
    };

    const isDateInGoal = (date: Date) => {
        return getDateGoals(date).length > 0;
    };

    const isDateInRange = (date: Date) => {
        if (!selectedRange.start) return false;
        if (!selectedRange.end) return isSameDay(date, selectedRange.start);
        return (
            isWithinInterval(date, {
                start: selectedRange.start,
                end: selectedRange.end
            })
        );
    };

    const handleDateClick = (date: Date) => {
        if (isDateInGoal(date)) return;

        if (!isSelecting) {
            setSelectedRange({start: date, end: null});
            setIsSelecting(true);
        } else {
            const start = selectedRange.start!;
            const end = isAfter(date, start) ? date : start;
            const newStart = isAfter(date, start) ? start : date;

            if (hasOverlap(newStart, end)) {
                setSelectedRange({start: null, end: null});
                setIsSelecting(false);
                return;
            }

            const range = {start: newStart, end};
            setSelectedRange(range);
            setIsSelecting(false);
            onRangeSelected(range);

            setTimeout(() => {
                setSelectedRange({start: null, end: null});
            }, 100);
        }
    };

    const renderMonth = (monthDate: Date) => {
        const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const firstDayWeekday = firstDayOfMonth.getDay();

        // Calculate remaining days to complete the grid
        const totalDays = 42; // 6 rows × 7 days

        const days = Array.from({length: totalDays}, (_, i) => {
            const dayNumber = i - firstDayWeekday + 1;
            const currentDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber);
            const isValidDate = isSameMonth(currentDate, monthDate);
            const dateGoals = isValidDate ? getDateGoals(currentDate) : [];
            const isUnavailable = dateGoals.length > 0;

            const isInRange = isDateInRange(currentDate);
            const isStart = selectedRange.start && isSameDay(currentDate, selectedRange.start);
            const isEnd = selectedRange.end && isSameDay(currentDate, selectedRange.end);

            const goalColor = dateGoals[0]?.color;

            return (
                <div
                    key={i}
                    onClick={() => isValidDate ? handleDateClick(currentDate) : null}
                    className={`
                        w-full flex items-center justify-center relative group rounded-md
                        ${isValidDate ? 'cursor-pointer hover:bg-gray-100' : 'text-gray-300 cursor-default'}
                        ${isValidDate && !isUnavailable && isInRange ? 'bg-indigo-100' : ''}
                        ${isValidDate && !isUnavailable && isStart ? 'bg-indigo-500 text-white' : ''}
                        ${isValidDate && !isUnavailable && isEnd ? 'bg-indigo-500 text-white' : ''}
                        ${isValidDate && !isUnavailable && isInRange && !isStart && !isEnd ? 'bg-indigo-100' : ''}
                        text-sm
                    `}
                    style={{
                        ...(isValidDate && isUnavailable && {
                            backgroundColor: goalColor,
                            opacity: 0.9,
                        })
                    }}
                >
                    {isValidDate ? dayNumber : ''}
                    {isValidDate && dateGoals.length > 0 && (
                        <div
                            className="absolute inset-0 group-hover:bg-black/10 transition-colors"
                            onClick={(e) => {
                                if (onGoalClick && dateGoals.length === 1) {
                                    e.stopPropagation();
                                    onGoalClick(dateGoals[0]);
                                }
                            }}
                            title={dateGoals.map(g => g.title).join('\n')}
                        />
                    )}
                    {isValidDate && dateGoals.length > 1 && (
                        <div
                            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-white"
                            title={`${dateGoals.length} goals on this day`}
                        />
                    )}
                </div>
            );
        });

        return (
            <div className="rounded-xl pb-2 bg-white flex flex-col h-full">
                <div className="font-bold rounded-t-xl py-2 text-center bg-black text-white">
                    {format(monthDate, 'MMMM')}
                </div>

                {/* Weekday headers with fixed height */}
                <div className="px-2 grid grid-cols-7 gap-1 divide-black/2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1 border-b border-black/2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid that takes all remaining space */}
                <div className="px-2 grid grid-cols-7 grid-rows-6 gap-1 flex-1 divide-y divide-black/2">
                    {days}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-1 items-center w-full">
            <div className="grid grid-cols-4 gap-4 w-full">
                {months.map((month, index) => (
                    <div key={index} className="flex flex-col h-full">
                        {renderMonth(month)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YearView;