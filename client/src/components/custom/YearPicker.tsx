import React from 'react';

interface YearPickerProps {
    year: number;
    onYearChange: (year: number) => void;
}

const YearPicker: React.FC<YearPickerProps> = ({ year, onYearChange }) => {
    const handlePreviousYear = () => {
        onYearChange(year - 1);
    };

    const handleNextYear = () => {
        onYearChange(year + 1);
    };

    return (
        <div className="flex items-center justify-center bg-white rounded-lg border border-black/20">
            <button
                onClick={handlePreviousYear}
                className="mr-2 pl-1.5 py-1 pr-2 flex items-center"
                aria-label="Previous year"
            >
                <i className="icon icon-caret-left flex" />
            </button>
            <span className="py-1">{year}</span>
            <button
                onClick={handleNextYear}
                className="ml-2 pl-2 py-1 pr-1.5 flex items-center"
                aria-label="Next year"
            >
                <i className="icon icon-caret-right flex" />
            </button>
        </div>
    );
};

export default YearPicker;