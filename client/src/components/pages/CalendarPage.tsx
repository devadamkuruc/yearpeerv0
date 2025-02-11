// components/pages/CalendarPage.tsx
import React, {useState, useEffect} from 'react';
import {useGoals} from "@/components/contexts/GoalContext.tsx";
import CalendarSidebar from "@/components/custom/CalendarSidebar.tsx";
import YearView from "@/components/custom/YearView.tsx";
import MonthView from "@/components/custom/MonthView.tsx";
import MonthTabs from "@/components/custom/MonthTabs.tsx";
import GoalModal from "@/components/custom/GoalModal.tsx";
import {CalendarView} from '@/types/viewTypes';
import {Link} from "react-router";
import YearPicker from "@/components/custom/YearPicker.tsx";
import yearpeerLogo from "/yearpeer-logo.svg";
import {GoalDTO} from "@/types/goal";

const CalendarPage: React.FC = () => {
    const {
        goals,
        showModal,
        editingGoal,
        openModal,
        openEditModal,
        selectedRange,
        selectDateRange,
        closeModal,
        addGoal,
        updateGoal,
        deleteGoal,
        fetchGoals,
        isLoading,
    } = useGoals();

    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(-1); // -1 represents year view
    const [view, setView] = useState<CalendarView>('year');

    // Fetch goals when year changes
    useEffect(() => {
        fetchGoals(currentYear);
    }, [currentYear, fetchGoals]);

    const handleYearChange = (year: number) => {
        setCurrentYear(year);
    };

    const handleViewChange = (newView: CalendarView, month?: number) => {
        setView(newView);
        setCurrentMonth(month ?? -1);
    };

    const handleSaveGoal = async (goalData: GoalDTO & { id?: string }) => {
        try {
            if (goalData.id) {
                // Editing existing goal
                await updateGoal(goalData.id, {
                    title: goalData.title,
                    description: goalData.description,
                    startDate: goalData.startDate,
                    endDate: goalData.endDate,
                    color: goalData.color,
                    impact: goalData.impact,
                });
            } else {
                // Creating new goal
                await addGoal({
                    title: goalData.title,
                    description: goalData.description,
                    startDate: goalData.startDate,
                    endDate: goalData.endDate,
                    color: goalData.color,
                    impact: goalData.impact,
                });
            }
        } catch (error) {
            console.error('Failed to save goal:', error);
            // The error will be handled by the GoalContext and displayed in the modal
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        try {
            await deleteGoal(goalId);
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    }

    return (
        <div className="flex h-screen bg-[#E5E5E5]">
            <div className="flex-1 overflow-auto flex flex-col">
                <div className="flex-1">
                    <div className="flex flex-col w-full h-screen justify-between p-4">
                        <div className="flex w-full justify-between">
                            <Link to="/calendar">
                                <img src={yearpeerLogo} alt="YearPeer"/>
                            </Link>

                            <YearPicker
                                year={currentYear}
                                onYearChange={handleYearChange}
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="loading loading-spinner loading-lg text-primary"></div>
                            </div>
                        ) : (
                            view === 'year' ? (
                                <YearView
                                    currentYear={currentYear}
                                    goals={goals}
                                    onRangeSelected={selectDateRange}
                                    onYearChange={handleYearChange}
                                    onGoalClick={openEditModal}
                                />
                            ) : (
                                <MonthView
                                    year={currentYear}
                                    month={currentMonth}
                                    goals={goals}
                                />
                            )
                        )}

                        <MonthTabs
                            currentYear={currentYear}
                            currentMonth={currentMonth}
                            onViewChange={handleViewChange}
                        />
                    </div>
                </div>
            </div>

            <CalendarSidebar
                onCreateNewGoal={() => openModal()}
                onEditGoal={openEditModal}
                goals={goals}
                currentYear={currentYear}
            />

            <GoalModal
                isOpen={showModal}
                onClose={closeModal}
                onSave={handleSaveGoal}
                onDelete={handleDeleteGoal}
                initialDateRange={selectedRange}
                editingGoal={editingGoal}
            />
        </div>
    );
};

export default CalendarPage;