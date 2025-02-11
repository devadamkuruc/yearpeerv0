// components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/components/contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { currentUser, isLoading } = useAuth();
    const location = useLocation();

    // Show nothing while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#E5E5E5]">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    // Redirect to sign-in if not authenticated
    if (!currentUser) {
        // Save the attempted URL for redirecting after sign-in
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
};

export default ProtectedRoute;