import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface Admin {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

interface AuthContextType {
    admin: Admin | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('trackmaster_token');
        const storedAdmin = localStorage.getItem('trackmaster_admin');

        if (storedToken && storedAdmin) {
            setToken(storedToken);
            setAdmin(JSON.parse(storedAdmin));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { token: newToken, admin: newAdmin } = response.data;

        localStorage.setItem('trackmaster_token', newToken);
        localStorage.setItem('trackmaster_admin', JSON.stringify(newAdmin));

        setToken(newToken);
        setAdmin(newAdmin);
    };

    const logout = () => {
        localStorage.removeItem('trackmaster_token');
        localStorage.removeItem('trackmaster_admin');
        setToken(null);
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{
            admin,
            token,
            login,
            logout,
            isLoading,
            isAuthenticated: !!token && !!admin,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
