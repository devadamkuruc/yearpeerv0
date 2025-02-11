import { useState } from 'react';

const ColorPicker = ({
                         color,
                         setColor,
                         className,
                     }: {
    color: string;
    setColor: (color: string) => void;
    className?: string;
}) => {
    const [activeTab, setActiveTab] = useState('solid');

    const solids = [
        '#E2E2E2',
        '#ff75c3',
        '#ffa647',
        '#ffe83f',
        '#9fff5b',
        '#70e2ff',
        '#cd93ff',
        '#09203f',
    ];

    return (
        <div className="dropdown w-full">
            <div
                tabIndex={0}
                role="button"
                className={`btn w-full justify-start normal-case border-black/20 ${className}`}
            >
                <div className="w-full flex items-center gap-2">
                    {color ? (
                        <div
                            className="h-4 w-4 rounded-full"
                            style={{ background: color }}
                        ></div>
                    ) : (
                        <i className="icon icon-fill" />
                    )}
                    <div className="truncate flex-1">
                        {color ? color : 'Pick a color'}
                    </div>
                </div>
            </div>

            <div tabIndex={0} className="dropdown-content bg-base-100 p-4 shadow-lg rounded-box mt-2 w-64 z-50">
                {/* Tabs */}
                <div className="tabs tabs-boxed w-full mb-4">
                    <a
                        className={`tab flex-1 rounded-md ${activeTab === 'solid' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('solid')}
                    >
                        Solid
                    </a>
                </div>

                {/* Color grid */}
                {activeTab === 'solid' && (
                    <div className="flex flex-wrap gap-1">
                        {solids.map((s) => (
                            <div
                                key={s}
                                style={{ background: s }}
                                className="rounded-md h-6 w-6 cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setColor(s)}
                            />
                        ))}
                    </div>
                )}

                {/* Color input */}
                <input
                    type="text"
                    value={color}
                    className="input input-bordered w-full h-8 mt-4"
                    onChange={(e) => setColor(e.currentTarget.value)}
                />
            </div>
        </div>
    );
};

export default ColorPicker;