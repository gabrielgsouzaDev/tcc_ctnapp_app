
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from './api';
import { type User } from './data';
import { getUser } from './services';

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
      const storedUserId = localStorage.getItem('userId');

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
           const userData = await getUser(storedUserId);
           if (userData) {
             setUser(userData);
             localStorage.setItem('user', JSON.stringify(userData));
           } else {
             throw new Error('User not found with stored ID');
           }
        } catch (error) {
          console.error("Failed to fetch user with stored token/ID", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const handleAuthSuccess = (response: { user: User; token: string }) => {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('userId', response.user.id);
    setToken(response.token);
    setUser(response.user);
  }

  const login = async (email: string, password: string) => {
    const response = await apiPost<{ user: User; token: string }>('/login', { email, senha: password });
    handleAuthSuccess(response);
  };

  const register = async (data: Record<string, any>) => {
    // Backend expects 'senha', not 'password'
    const payload = { ...data, senha: data.password };
    delete payload.password; // remove original password field

    // The endpoint is now /users for both roles
    const response = await apiPost<{ user: User; token: string }>('/users', payload);
    handleAuthSuccess(response);
  };

  const logout = async () => {
    try {
        await apiPost('/logout', {});
    } catch (error) {
        console.error("Logout failed on API, logging out client-side anyway.", error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
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
