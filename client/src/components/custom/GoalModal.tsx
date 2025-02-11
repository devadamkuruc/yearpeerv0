import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DateRange, Goal, GoalDTO } from "@/types/goal.ts";
import { useGoals } from "@/components/contexts/GoalContext.tsx";
import ColorPicker from "@/components/custom/ColorPicker.tsx";
import ImpactSelector from "@/components/custom/ImpactSelector.tsx";

const GOAL_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#E67E22'
];

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: GoalDTO & { id?: string }) => Promise<void>;
    onDelete?: (goalId: string) => Promise<void>;
    initialDateRange?: DateRange;
    editingGoal?: Goal;
}

const GoalModal: React.FC<GoalModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 onSave,
                                                 onDelete,
                                                 initialDateRange,
                                                 editingGoal
                                             }) => {
    // Form state
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        dateRange: { start: null, end: null } as DateRange,
        color: GOAL_COLORS[0],
        impact: 3
    });

    // UI state
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { hasOverlap } = useGoals();

    const resetForm = () => {
        setFormState({
            title: '',
            description: '',
            dateRange: { start: null, end: null },
            color: GOAL_COLORS[0],
            impact: 3
        });
        setError('');
    };

    useEffect(() => {
        if (!isOpen) return;

        setError('');

        if (editingGoal) {
            setFormState({
                title: editingGoal.title,
                description: editingGoal.description,
                dateRange: {
                    start: editingGoal.startDate,
                    end: editingGoal.endDate
                },
                color: editingGoal.color,
                impact: editingGoal.impact
            });
        } else {
            resetForm();

            if (initialDateRange?.start && initialDateRange?.end) {
                setFormState(prev => ({
                    ...prev,
                    dateRange: initialDateRange
                }));

                if (hasOverlap(initialDateRange.start, initialDateRange.end)) {
                    setError('A goal already exists during this time period');
                }
            }
        }
    }, [isOpen, editingGoal, initialDateRange, hasOverlap]);

    const validateDateRange = (range: DateRange) => {
        if (!range.start || !range.end) return;

        if (range.end < range.start) {
            setError('End date cannot be before start date');
        } else if (hasOverlap(range.start, range.end, editingGoal?.id)) {
            setError('A goal already exists during this time period');
        } else {
            setError('');
        }
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        const newDate = new Date(value);
        const updatedRange = {
            ...formState.dateRange,
            [type]: newDate
        };

        setFormState(prev => ({
            ...prev,
            dateRange: updatedRange
        }));

        if (updatedRange.start && updatedRange.end) {
            validateDateRange(updatedRange);
        }
    };

    const handleSave = async () => {
        const { title, dateRange, color, impact, description } = formState;

        if (!dateRange.start || !dateRange.end || !title) return;

        if (dateRange.end < dateRange.start) {
            setError('End date cannot be before start date');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const goalData = {
                title,
                description,
                startDate: dateRange.start,
                endDate: dateRange.end,
                color,
                impact,
                ...(editingGoal ? { id: editingGoal.id } : {})
            };

            await onSave(goalData);
            onClose();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save goal');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        resetForm();
        setError('');
    };

    const handleDelete = async () => {
        if (!editingGoal || !onDelete) return;

        try {
            setIsLoading(true);
            await onDelete(editingGoal.id);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete goal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box bg-[#E5E5E5] max-w-2xl max-h-[35rem] overflow-visible">
                <h3 className="font-bold text-lg">
                    {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>

                {error && (
                    <div className="alert alert-error mt-4">
                        <span>{error}</span>
                    </div>
                )}

                <div className="py-4">
                    {/* Goal Title */}
                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text">Goal Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter goal title..."
                            className="input input-bordered w-full"
                            value={formState.title}
                            onChange={(e) => setFormState(prev => ({
                                ...prev,
                                title: e.target.value
                            }))}
                        />
                    </div>

                    {/* Goal Description */}
                    <div className="form-control w-full mb-4">
                        <label className="label">
                            <span className="label-text">Goal Description</span>
                        </label>
                        <textarea
                            placeholder="Enter goal description..."
                            rows={3}
                            className="input input-bordered pt-2 w-full min-h-[4rem] max-h-[10rem]"
                            value={formState.description}
                            onChange={(e) => setFormState(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                        />
                    </div>

                    <div className="flex gap-4">
                        {/* Start Date */}
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">Start Date</span>
                            </label>
                            <input
                                type="date"
                                className="input border-black/20 flex-1"
                                value={formState.dateRange.start
                                    ? format(formState.dateRange.start, 'yyyy-MM-dd')
                                    : ''}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                            />
                        </div>

                        {/* End Date */}
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">End Date</span>
                            </label>
                            <input
                                type="date"
                                className="input border border-black/20 flex-1"
                                value={formState.dateRange.end
                                    ? format(formState.dateRange.end, 'yyyy-MM-dd')
                                    : ''}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                            />
                        </div>

                        {/* Color Picker */}
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">Color</span>
                            </label>
                            <ColorPicker
                                color={formState.color}
                                setColor={(color) => setFormState(prev => ({
                                    ...prev,
                                    color
                                }))}
                            />
                        </div>

                        {/* Impact Selector */}
                        <div className="form-control flex-1">
                            <label className="label">
                                <span className="label-text">Impact</span>
                            </label>
                            <ImpactSelector
                                impact={formState.impact}
                                setImpact={(impact) => setFormState(prev => ({
                                    ...prev,
                                    impact
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="modal-action flex justify-between w-full">
                    <div>
                        {editingGoal && onDelete && (
                            <button
                                className="btn btn-error"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-ghost"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={
                                isLoading ||
                                !formState.title ||
                                !formState.dateRange.start ||
                                !formState.dateRange.end ||
                                !!error
                            }
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    {editingGoal ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                editingGoal ? 'Save Changes' : 'Create Goal'
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
};

export default GoalModal;