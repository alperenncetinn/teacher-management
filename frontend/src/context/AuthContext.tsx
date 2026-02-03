import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import type { User, AuthResponse } from '../types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode token to get user info or validate
            try {
                const decoded: any = jwtDecode(token);
                // Need to fetch full user or just use claims. 
                // Claims: nameid, email, role, unique_name
                setUser({
                    id: parseInt(decoded.nameid),
                    email: decoded.email,
                    role: decoded.role,
                    fullName: decoded.unique_name
                });
            } catch (e) {
                localStorage.removeItem('token');
                setToken(null);
            }
        }
        setIsLoading(false);
    }, [token]);

    const login = async (email: string, password: string) => {
        const { data } = await client.post<AuthResponse>('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
