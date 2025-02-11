// components/contexts/TaskContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { format } from 'date-fns';
import { Task, TaskDTO, DayTasks } from '@/types/task';
import { useAuth } from "@/components/contexts/AuthContext.tsx";
import api from '@/api/axios';

interface TaskContextType {
    tasks: DayTasks;
    isLoading: boolean;
    error: string | null;
    getTasksForDate: (date: Date) => Task[];
    fetchTasksForMonth: (year: number, month: number) => Promise<void>;
    createTask: (taskDTO: TaskDTO) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<TaskDTO>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState<DayTasks>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const getTasksForDate = useCallback((date: Date): Task[] => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return tasks[dateKey] || [];
    }, [tasks]);

    const fetchTasksForMonth = useCallback(async (year: number, month: number) => {
        if (!currentUser) return;

        try {
            setIsLoading(true);
            setError(null);

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const response = await api.get('/tasks', {
                params: {
                    startDate: format(startDate, 'yyyy-MM-dd'),
                    endDate: format(endDate, 'yyyy-MM-dd')
                }
            });

            const tasksByDate: DayTasks = {};
            response.data.forEach((task: Task) => {
                const dateKey = format(new Date(task.date), 'yyyy-MM-dd');
                if (!tasksByDate[dateKey]) {
                    tasksByDate[dateKey] = [];
                }
                tasksByDate[dateKey].push({
                    ...task,
                    date: new Date(task.date),
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt)
                });
            });

            setTasks(prev => ({
                ...prev,
                ...tasksByDate
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const createTask = async (taskDTO: TaskDTO) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post('/tasks', taskDTO);
            const newTask = response.data;
            const dateKey = format(new Date(newTask.date), 'yyyy-MM-dd');

            setTasks(prev => {
                const updatedTasks = [
                    ...(prev[dateKey] || []),
                    {
                        ...newTask,
                        date: new Date(newTask.date),
                        createdAt: new Date(newTask.createdAt),
                        updatedAt: new Date(newTask.updatedAt)
                    }
                ];

                return {
                    ...prev,
                    [dateKey]: updatedTasks
                };
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateTask = async (taskId: string, updates: Partial<TaskDTO>) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.patch(`/tasks/${taskId}`, updates);
            const updatedTask = response.data;

            setTasks(prev => {
                const newTasks = { ...prev };
                const oldTask = Object.values(prev)
                    .flat()
                    .find(t => t.id === taskId);

                if (oldTask) {
                    const oldDateKey = format(oldTask.date, 'yyyy-MM-dd');
                    const newDateKey = format(new Date(updatedTask.date), 'yyyy-MM-dd');

                    // Remove from old date
                    if (newTasks[oldDateKey]) {
                        newTasks[oldDateKey] = newTasks[oldDateKey].filter(t => t.id !== taskId);
                        if (newTasks[oldDateKey].length === 0) {
                            delete newTasks[oldDateKey];
                        }
                    }

                    // Add to new date
                    if (!newTasks[newDateKey]) {
                        newTasks[newDateKey] = [];
                    }

                    newTasks[newDateKey] = [
                        ...newTasks[newDateKey].filter(t => t.id !== taskId),
                        {
                            ...updatedTask,
                            date: new Date(updatedTask.date),
                            createdAt: new Date(updatedTask.createdAt),
                            updatedAt: new Date(updatedTask.updatedAt)
                        }
                    ];
                }

                return newTasks;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            await api.delete(`/tasks/${taskId}`);

            setTasks(prev => {
                const newTasks = { ...prev };
                Object.keys(newTasks).forEach(dateKey => {
                    if (newTasks[dateKey].some(t => t.id === taskId)) {
                        newTasks[dateKey] = newTasks[dateKey].filter(t => t.id !== taskId);
                        if (newTasks[dateKey].length === 0) {
                            delete newTasks[dateKey];
                        }
                    }
                });
                return newTasks;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete task');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                isLoading,
                error,
                getTasksForDate,
                fetchTasksForMonth,
                createTask,
                updateTask,
                deleteTask,
                clearError
            }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

export default TaskContext;