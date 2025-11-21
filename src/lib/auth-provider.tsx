
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from './api';
import { type User } from './data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'student' | 'guardian') => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          // Assuming a /me endpoint to verify token and get user data
          const userData = await apiGet<User>('/me'); 
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user with stored token", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'guardian') => {
    const loginPath = role === 'student' ? '/login/aluno' : '/login/responsavel';
    const response = await apiPost<{ user: User; token: string }>(loginPath, { email, password });
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: Record<string, any>) => {
    const { role, ...payload } = data;
    const registerPath = role === 'student' ? '/alunos' : '/responsaveis';
    const response = await apiPost<{ user: User; token: string }>(registerPath, payload);
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    // Optionally call a /logout endpoint on your API
    // await apiPost('/logout', {});
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
