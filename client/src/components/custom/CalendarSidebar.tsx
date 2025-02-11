// components/custom/CalendarSidebar.tsx
import Goals from "@/components/custom/Goals.tsx";
import { Goal } from "@/types/goal.ts";
import {useAuth} from "@/components/contexts/AuthContext.tsx";
import DaysLeft from "@/components/custom/DaysLeft.tsx";

interface CalendarSidebarProps {
    onCreateNewGoal: () => void;
    onEditGoal: (goal: Goal) => void;
    goals: Goal[];
    currentYear: number;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
                                                             onCreateNewGoal,
                                                             onEditGoal,
                                                             goals,
                                                             currentYear
                                                         }) => {
    const { currentUser, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <div className="sticky flex flex-col justify-between right-0 top-0 h-screen bg-black w-[17%] px-4">
            <div className="flex flex-col">
                {/* User Profile Section */}
                <div className="flex w-full h-fit justify-end pt-6">
                    {currentUser?.pictureUrl && (
                        <div className="dropdown dropdown-bottom dropdown-end">
                            <div
                                tabIndex={0}
                                className="rounded-full overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                role="button"
                            >
                                <img
                                    src={currentUser.pictureUrl}
                                    alt="User"
                                    height={28}
                                    width={28}
                                    className="rounded-full outline-0"
                                />
                            </div>

                            <ul tabIndex={0} className="dropdown-content mt-2 shadow-md bg-white w-96 rounded-2xl border border-black/20">
                                {/* User Info */}
                                <div className="flex gap-4 items-center py-4 px-5 border-b border-black/20">
                                    <div className="flex-grow-0 rounded-full overflow-hidden">
                                        <img
                                            className="rounded-full"
                                            src={currentUser.pictureUrl}
                                            alt="User"
                                            width={36}
                                            height={36}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-lg">{currentUser.firstName}</span>
                                        <span className="font-medium text-sm text-gray-600">{currentUser.email}</span>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <li className="flex items-center text-sm gap-4 px-5 py-2.5 cursor-pointer hover:bg-gray-50">
                                    <div className="flex w-9 items-center justify-center">
                                        <i className="icon icon-user-1"/>
                                    </div>
                                    Profile
                                </li>
                                <li className="flex items-center text-sm gap-4 px-5 py-2.5 cursor-pointer hover:bg-gray-50">
                                    <div className="flex w-9 items-center justify-center">
                                        <i className="icon icon-subscription"/>
                                    </div>
                                    Subscription
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center text-sm gap-4 px-5 py-2.5 cursor-pointer hover:bg-gray-50"
                                    >
                                        <i className="icon icon-rect-logout w-9"/>
                                        Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Goals Section */}
                <Goals
                    onCreateNewGoal={onCreateNewGoal}
                    onEditGoal={onEditGoal}
                    goals={goals}
                    currentYear={currentYear}
                />
            </div>

            <DaysLeft />
        </div>
    );
};

export default CalendarSidebar;