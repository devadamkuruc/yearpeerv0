import { Routes, Route, Navigate } from "react-router";
import SignInPage from "@/components/pages/SignInPage";
import CalendarPage from "@/components/pages/CalendarPage";
import { GoalProvider } from "@/components/contexts/GoalContext";
import { TaskProvider } from "@/components/contexts/TaskContext";
import { AuthProvider } from "@/components/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const App = () => {
    return (
        <AuthProvider>
            <GoalProvider>
                <TaskProvider>
                    <Routes>
                        {/* Public route */}
                        <Route path="/sign-in" element={<SignInPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/calendar" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <ProtectedRoute>
                                    <CalendarPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all route - redirect to calendar */}
                        <Route
                            path="*"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/calendar" replace />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </TaskProvider>
            </GoalProvider>
        </AuthProvider>
    );
};

export default App;