import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { Goal } from '@/types/goal.ts';
import { Task, TaskDTO } from '@/types/task.ts';
import { useTasks } from "@/components/contexts/TaskContext.tsx";
import TaskModal from "@/components/custom/TaskModal.tsx";

interface MonthViewProps {
    year: number;
    month: number;
    goals: Goal[];
}

const MonthView: React.FC<MonthViewProps> = ({ year, month, goals }) => {
    const {
        getTasksForDate,
        updateTask,
    } = useTasks();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Calendar setup
    const currentDate = new Date(year, month);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startingDayOfWeek = monthStart.getDay();

    // Calculate remaining days to complete the last week
    const usedDays = startingDayOfWeek + daysInMonth.length;
    const remainingDays = usedDays % 7 === 0 ? 0 : 7 - (usedDays % 7);

    const getDateGoals = (date: Date) => {
        return goals.filter(goal =>
            isWithinInterval(date, { start: goal.startDate, end: goal.endDate })
        );
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setShowTaskModal(true);
    };

    const handleCloseTaskModal = () => {
        setShowTaskModal(false);
        setSelectedDate(null);
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<TaskDTO>) => {
        await updateTask(taskId, updates);
    };

    const renderDayTasks = (tasks: Task[]) => {
        return tasks.map((task) => (
            <div
                key={task.id}
                className={`text-xs px-1 py-0.5 mb-0.5 bg-white rounded flex items-center gap-1 hover:bg-gray-50
                    ${task.completed ? 'line-through text-gray-400' : ''}`}
                title={task.title}
            >
                <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-3 h-3"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTask(task.id, {
                            title: task.title,
                            description: task.description,
                            date: task.date,
                            goalId: task.goalId,
                            completed: !task.completed
                        });
                    }}
                />
                <span className="truncate flex-1">
                    {task.title}
                </span>
            </div>
        ));
    };

    return (
        <>
            <div className="rounded-xl overflow-hidden bg-gray-50 flex-1 flex flex-col my-5">
                <div className="font-bold py-2 text-center bg-black text-white rounded-t-xl">
                    {format(currentDate, 'MMMM')}
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 divide-x divide-gray-200">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} className="text-center font-medium text-gray-500 border-b border-gray-200 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 flex-1">
                    {/* Empty cells for start of month */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                        <div key={`empty-start-${index}`} className="bg-gray-50"/>
                    ))}

                    {/* Days of the month */}
                    {daysInMonth.map(day => {
                        const dateGoals = getDateGoals(day);
                        const dateTasks = getTasksForDate(day);

                        return (
                            <div
                                key={format(day, 'yyyy-MM-dd')}
                                onClick={() => handleDateClick(day)}
                                className="group cursor-pointer p-2 flex flex-col"
                            >
                                <div className="flex gap-1 justify-between">
                                    {/* Date number */}
                                    <div className="font-medium flex-shrink-0">
                                        {format(day, 'd')}
                                    </div>

                                    {/* Goals section */}
                                    <div className="truncate mt-1">
                                        {dateGoals.map(goal => (
                                            <div
                                                key={goal.id}
                                                className="text-xs py-0.5 px-1 rounded mb-0.5 truncate"
                                                style={{
                                                    backgroundColor: goal.color,
                                                    opacity: 0.7
                                                }}
                                                title={goal.title}
                                            >
                                                {goal.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tasks section */}
                                <div className="mt-1 flex-1 min-h-0 flex flex-col relative">
                                    <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        <div className="space-y-0.5">
                                            {renderDayTasks(dateTasks)}
                                        </div>
                                        {dateTasks.length === 0 && (
                                            <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Click to add tasks
                                            </div>
                                        )}
                                        {dateTasks.length >= 5 && (
                                            <div className="text-xs text-yellow-600 mt-1">
                                                Max tasks reached
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty cells for end of month */}
                    {Array.from({ length: remainingDays }).map((_, index) => (
                        <div key={`empty-end-${index}`} className="bg-gray-50"/>
                    ))}
                </div>
            </div>

            {selectedDate && (
                <TaskModal
                    isOpen={showTaskModal}
                    onClose={handleCloseTaskModal}
                    date={selectedDate}
                    tasks={selectedDate ? getTasksForDate(selectedDate) : []}
                />
            )}
        </>
    );
};

export default MonthView;