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
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
           const userData = await getUser(storedUserId);
           if (userData) {
             setUser(userData);
           } else {
             throw new Error('Usuário não encontrado com o ID armazenado');
           }
        } catch (error) {
          console.error("Falha ao buscar usuário com dados locais, limpando sessão.", error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const handleAuthSuccess = (payload: { user: User; token: string }) => {
    localStorage.setItem('authToken', payload.token);
    localStorage.setItem('userId', payload.user.id.toString());
    setToken(payload.token);
    setUser(payload.user);
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<{ data: { user: User; token: string } }>('login', { email, senha: password, device_name: 'browser' });
      handleAuthSuccess(response.data);
    } catch (error: any) {
      // Transforma o erro da API em uma mensagem que o usuário final pode entender
      console.error("Falha no login:", error);
      // A mensagem de erro real vinda do backend agora será lançada para o formulário
      throw new Error(error.message || 'E-mail ou senha incorretos. Tente novamente.');
    }
  };

  const register = async (data: Record<string, any>) => {
    const { password, ...restOfData } = data;
    const payload = { ...restOfData, senha: password };

    await apiPost<{ data: any }>('users', payload);
    
    await login(data.email, password);
  };

  const logout = async () => {
    try {
        await apiPost('logout', {});
    } catch (error) {
        console.error("Logout via API falhou, procedendo com logout local.", error);
    } finally {
        localStorage.clear();
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
