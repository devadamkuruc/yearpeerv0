// contexts/GoalContext.tsx
import React, { createContext, useState, ReactNode, useContext, useCallback } from 'react';
import { areIntervalsOverlapping } from 'date-fns';
import { DateRange, Goal, GoalDTO } from "@/types/goal";
import { useAuth } from "@/components/contexts/AuthContext";
import api from "@/api/axios";
import { handleApiError } from '@/utils/api';
import { goalSchema } from '@/utils/validation';
import { formatDate } from '@/utils/date';

interface GoalContextType {
    goals: Goal[];
    selectedRange: DateRange | undefined;
    showModal: boolean;
    editingGoal: Goal | undefined;
    isLoading: boolean;
    error: string | null;
    addGoal: (goalData: GoalDTO) => Promise<void>;
    updateGoal: (id: string, goalData: GoalDTO) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    selectDateRange: (range: DateRange) => void;
    openModal: (withRange?: DateRange) => void;
    openEditModal: (goal: Goal) => void;
    closeModal: () => void;
    hasOverlap: (start: Date, end: Date, excludeGoalId?: string) => boolean;
    fetchGoals: (year: number) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async (year: number) => {
        if (!currentUser) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(`/goals`, {
                params: {
                    year,
                    userId: currentUser.id,
                    startDate: formatDate(new Date(year, 0, 1)),
                    endDate: formatDate(new Date(year, 11, 31))
                }
            });

            // Validate and transform the response data
            const validatedGoals = await Promise.all(
                response.data.map(async (goal: unknown) => goalSchema.parseAsync(goal))
            );

            setGoals(validatedGoals);
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
            console.error('Error fetching goals:', apiError);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const hasOverlap = useCallback((start: Date, end: Date, excludeGoalId?: string) => {
        return goals.some(goal =>
            goal.id !== excludeGoalId &&
            areIntervalsOverlapping(
                { start, end },
                { start: goal.startDate, end: goal.endDate },
                { inclusive: true }
            )
        );
    }, [goals]);

    const addGoal = async (goalData: GoalDTO) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post('/goals', {
                ...goalData,
                userId: currentUser.id
            });

            const newGoal = await goalSchema.parseAsync(response.data);
            setGoals(prev => [...prev, newGoal]);
            setShowModal(false);
            setSelectedRange(undefined);
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
            console.error('Error adding goal:', apiError);
            throw apiError;
        } finally {
            setIsLoading(false);
        }
    };

    const updateGoal = async (id: string, goalData: GoalDTO) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.put(`/goals/${id}`, goalData);
            const updatedGoal = await goalSchema.parseAsync(response.data);

            setGoals(prev => prev.map(goal =>
                goal.id === id ? updatedGoal : goal
            ));
            setShowModal(false);
            setEditingGoal(undefined);
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
            console.error('Error updating goal:', apiError);
            throw apiError;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteGoal = async (id: string) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            setIsLoading(true);
            setError(null);

            await api.delete(`/goals/${id}`);
            setGoals(prev => prev.filter(goal => goal.id !== id));
        } catch (err) {
            const apiError = handleApiError(err);
            setError(apiError.message);
            console.error('Error deleting goal:', apiError);
            throw apiError;
        } finally {
            setIsLoading(false);
        }
    };

    const selectDateRange = (range: DateRange) => {
        setSelectedRange(range);
        setEditingGoal(undefined);
        setShowModal(true);
    };

    const openModal = (withRange?: DateRange) => {
        setSelectedRange(withRange);
        setEditingGoal(undefined);
        setShowModal(true);
    };

    const openEditModal = (goal: Goal) => {
        setEditingGoal(goal);
        setSelectedRange(undefined);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRange(undefined);
        setEditingGoal(undefined);
        setError(null);
    };

    return (
        <GoalContext.Provider
            value={{
                goals,
                selectedRange,
                showModal,
                editingGoal,
                isLoading,
                error,
                addGoal,
                updateGoal,
                deleteGoal,
                selectDateRange,
                openModal,
                openEditModal,
                closeModal,
                hasOverlap,
                fetchGoals
            }}
        >
            {children}
        </GoalContext.Provider>
    );
};

export const useGoals = () => {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider');
    }
    return context;
};

export default GoalContext;