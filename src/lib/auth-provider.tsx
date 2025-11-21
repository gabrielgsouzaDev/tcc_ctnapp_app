
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from './api';
import { type User } from './data';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
          // You need a /me endpoint to get user data from token
          // const userData = await apiGet<User>('/me'); 
          // setUser(userData);
          // For now, we'll assume the user data is stored in localStorage too
           const storedUser = localStorage.getItem('user');
           if (storedUser) {
             setUser(JSON.parse(storedUser));
           } else {
             // Or fetch it if not present
             // const userData = await apiGet<User>('/me'); 
             // setUser(userData);
             // localStorage.setItem('user', JSON.stringify(userData));
           }
        } catch (error) {
          console.error("Failed to fetch user with stored token", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiPost<{ user: User; token: string }>('/login', { email, senha: password });
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (data: Record<string, any>) => {
    const { role, ...payload } = data;
    // The password field name must match backend validation ('senha')
    const apiPayload = { ...payload, senha: payload.password };
    delete apiPayload.password;
    
    const registerPath = role === 'student' ? '/alunos' : '/responsaveis';

    const response = await apiPost<{ user: User; token: string }>(registerPath, apiPayload);
    
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
        await apiPost('/logout', {});
    } catch (error) {
        console.error("Logout failed on API, logging out client-side anyway.", error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/');
    }
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
