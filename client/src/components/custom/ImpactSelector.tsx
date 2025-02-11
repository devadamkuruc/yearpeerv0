import React, {useState} from 'react';

interface ImpactSelectorProps {
    impact?: number,
    setImpact: (impact: number) => void
}

const ImpactSelector: React.FC<ImpactSelectorProps> = ({ setImpact}) => {
    const [stateImpact, setStateImpact] = useState<number>(1)
    const [hoverLevel, setHoverLevel] = useState<number>(0);

    const handleSetImpact = (level: number) => {
        setImpact(level);
        setStateImpact(level);
    };

    const handleMouseEnter = (level: number) => {
        setHoverLevel(level);
    };

    const handleMouseLeave = () => {
        setHoverLevel(0);  // Reset hover state when mouse leaves
    };

    return (
        <div className="flex items-center bg-white border border-black/20 h-10 px-4 py-2 rounded-md">
            <div className="flex w-full justify-between"
                 onMouseLeave={handleMouseLeave}>
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        onClick={() => handleSetImpact(level)}
                        onMouseEnter={() => handleMouseEnter(level)}
                        className={`w-4 h-4 rounded-full cursor-pointer
                                    ${level <= stateImpact ? 'bg-black' : level <= hoverLevel ? 'bg-gray-1' : 'bg-transparent border border-solid border-gray-1'}`}
                        aria-label={`Set impact to ${level}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImpactSelector;
