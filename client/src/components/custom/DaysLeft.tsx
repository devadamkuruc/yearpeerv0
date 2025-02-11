
const DaysLeft = () => {
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((endOfYear.getTime() - today.getTime()) / msPerDay);

    return (
        <div className="flex flex-col my-9">
            <div className="text-white text-sm font-medium">{daysLeft} days left in {today.getFullYear()}</div>
            <div
                className="w-full border-solid border border-white border-opacity-50 bg-transparent h-3 mt-2 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{width: `${(365 - daysLeft) / 365 * 100}%`}}></div>
            </div>
        </div>
    );
};

export default DaysLeft;