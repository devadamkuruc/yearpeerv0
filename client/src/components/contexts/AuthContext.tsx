// contexts/AuthContext.tsx
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState
} from 'react';
import { User } from '@/types/auth';
import api from "@/api/axios";
import { handleApiError } from '@/utils/api';
import { useNavigate } from 'react-router';

interface AuthState {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [state, setState] = useState<AuthState>({
        currentUser: null,
        isLoading: true,
        error: null
    });

    const setPartialState = (partial: Partial<AuthState>) => {
        setState(prev => ({ ...prev, ...partial }));
    };

    const refreshUser = useCallback(async () => {
        try {
            setPartialState({ isLoading: true, error: null });
            const response = await api.get<User>('/auth/me');
            setPartialState({
                currentUser: response.data,
                isLoading: false
            });
        } catch (err) {
            const apiError = handleApiError(err);
            setPartialState({
                currentUser: null,
                error: apiError.message,
                isLoading: false
            });

            // If the error is authentication-related, redirect to sign-in
            if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'FORBIDDEN') {
                navigate('/sign-in');
            }
        }
    }, [navigate]);

    // Initial authentication check
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = () => {
        // Redirect to backend auth endpoint
        window.location.href = `api/auth/login`;
    };

    const logout = async () => {
        try {
            setPartialState({ isLoading: true, error: null });
            await api.post('/auth/logout');
            setPartialState({
                currentUser: null,
                isLoading: false
            });
            navigate('/sign-in');
        } catch (err) {
            const apiError = handleApiError(err);
            setPartialState({
                error: apiError.message,
                isLoading: false
            });
            console.error('Logout failed:', apiError);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                isAuthenticated: !!state.currentUser,
                login,
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;