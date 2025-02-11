import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Task, TaskDTO } from '@/types/task';
import { useGoals } from '@/components/contexts/GoalContext';
import { useTasks } from '@/components/contexts/TaskContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    tasks: Task[];
}

const TaskModal: React.FC<TaskModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 date,
                                                 tasks: initialTasks,
                                             }) => {
    const { createTask, updateTask, deleteTask } = useTasks();
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState('');
    const [editingTaskDescription, setEditingTaskDescription] = useState('');
    const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { goals } = useGoals();

    // Filter goals that are active on the selected date
    const availableGoals = goals.filter(goal =>
        date >= goal.startDate && date <= goal.endDate
    );

    useEffect(() => {
        setTasks(initialTasks);
        resetForm();
    }, [initialTasks, isOpen]);

    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setSelectedGoalId(undefined);
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setEditingTaskDescription('');
        setError(null);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || tasks.length >= 5) return;

        try {
            setIsLoading(true);
            setError(null);

            const taskDTO: TaskDTO = {
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                goalId: selectedGoalId,
                date: date,
                completed: false
            };

            await createTask(taskDTO);
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add task');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            await deleteTask(taskId);

            if (editingTaskId === taskId) {
                cancelEditing();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete task');
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskTitle(task.title);
        setEditingTaskDescription(task.description || '');
        setSelectedGoalId(task.goalId);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setEditingTaskDescription('');
        setSelectedGoalId(undefined);
    };

    const saveEditing = async (task: Task) => {
        if (!editingTaskTitle.trim()) return;

        try {
            setIsLoading(true);
            setError(null);

            await updateTask(task.id, {
                title: editingTaskTitle.trim(),
                description: editingTaskDescription.trim(),
                goalId: selectedGoalId,
                date: task.date,
                completed: task.completed
            });

            cancelEditing();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">
                    Tasks for {format(date, 'MMMM d, yyyy')}
                </h3>

                {error && (
                    <div className="alert alert-error mt-4">
                        <span>{error}</span>
                    </div>
                )}

                <div className="py-4">
                    <div className="form-control w-full mb-4">
                        {tasks.length < 5 && (
                            <div className="space-y-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Add new task..."
                                    className="input input-bordered w-full"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddTask();
                                        }
                                    }}
                                />
                                <textarea
                                    placeholder="Task description (optional)"
                                    className="textarea textarea-bordered w-full"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                />
                                {availableGoals.length > 0 && (
                                    <select
                                        className="select select-bordered w-full"
                                        value={selectedGoalId || ''}
                                        onChange={(e) => setSelectedGoalId(e.target.value || undefined)}
                                    >
                                        <option value="">No associated goal</option>
                                        {availableGoals.map(goal => (
                                            <option key={goal.id} value={goal.id}>
                                                {goal.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleAddTask}
                                    disabled={isLoading || !newTaskTitle.trim() || tasks.length >= 5}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Task'
                                    )}
                                </button>
                            </div>
                        )}

                        {tasks.length === 5 && (
                            <div className="text-sm text-yellow-600 mb-2">
                                Maximum 5 tasks per day reached
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex flex-col gap-2 p-2 border rounded hover:bg-gray-50"
                                >
                                    {editingTaskId === task.id ? (
                                        // Editing mode
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={editingTaskTitle}
                                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                className="input input-bordered input-sm w-full"
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        saveEditing(task);
                                                    }
                                                }}
                                            />
                                            <textarea
                                                value={editingTaskDescription}
                                                onChange={(e) => setEditingTaskDescription(e.target.value)}
                                                className="textarea textarea-bordered textarea-sm w-full"
                                                placeholder="Task description (optional)"
                                            />
                                            {availableGoals.length > 0 && (
                                                <select
                                                    className="select select-bordered select-sm w-full"
                                                    value={selectedGoalId || ''}
                                                    onChange={(e) => setSelectedGoalId(e.target.value || undefined)}
                                                >
                                                    <option value="">No associated goal</option>
                                                    {availableGoals.map(goal => (
                                                        <option key={goal.id} value={goal.id}>
                                                            {goal.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => saveEditing(task)}
                                                    className="btn btn-sm btn-success"
                                                    disabled={isLoading || !editingTaskTitle.trim()}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="loading loading-spinner"></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="btn btn-sm btn-ghost"
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display mode
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() => {
                                                            updateTask(task.id, {
                                                                title: task.title,
                                                                description: task.description,
                                                                date: task.date,
                                                                goalId: task.goalId,
                                                                completed: !task.completed
                                                            });
                                                        }}
                                                        className="checkbox"
                                                    />
                                                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <div className="text-sm text-gray-500 mt-1 ml-7">
                                                        {task.description}
                                                    </div>
                                                )}
                                                {task.goalId && (
                                                    <div className="text-xs text-gray-500 mt-1 ml-7">
                                                        Goal: {goals.find(g => g.id === task.goalId)?.title}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => startEditing(task)}
                                                    className="btn btn-ghost btn-sm"
                                                    title="Edit task"
                                                    disabled={isLoading}
                                                >
                                                    <i className="icon icon-pen" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="btn btn-ghost btn-sm text-red-500"
                                                    title="Delete task"
                                                    disabled={isLoading}
                                                >
                                                    <i className="icon icon-trash" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default TaskModal;