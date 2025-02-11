// components/custom/MonthTabs.tsx
import React from 'react';
import {CalendarView} from '@/types/viewTypes';

interface MonthTabsProps {
    currentYear: number;
    currentMonth: number;
    onViewChange: (view: CalendarView, month?: number) => void;
}

const MonthTabs: React.FC<MonthTabsProps> = ({currentMonth, onViewChange}) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
    ];

    return (
        <div className="w-full">
            <div className="flex gap-x-2 overflow-x-auto">
                <button
                    onClick={() => onViewChange('year')}
                    className={`
                        px-3 py-1 text-sm font-medium min-w-20 rounded-full border border-black/20 cursor-pointer
                        ${currentMonth === -1 && 'bg-black/20'}
                    `}
                >
                    Full Year
                </button>
                {months.map((month, index) => (
                    <button
                        key={month}
                        onClick={() => onViewChange('month', index)}
                        className={`
                            px-3 py-1 text-sm font-medium rounded-full border border-black/20 cursor-pointer hover:bg-black/20
                            ${currentMonth === index && 'bg-black/20'}
                        `}
                    >
                        {month}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MonthTabs;