// src/lib/auth-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from './api';
import { type User } from './data';
import { getUser, mapUser } from './services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>; // ✅ 1. Adicionada a função ao tipo do contexto
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await apiPost('logout', {});
    } catch (error) {
      console.error('Logout via API falhou, procedendo com logout local.', error);
    } finally {
      localStorage.clear();
      setToken(null);
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    let mounted = true;
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (storedToken && storedUserId) {
        setToken(storedToken);

        try {
          const userData = await getUser(storedUserId);

          if (!mounted) return;
          if (!userData) {
            console.error('Falha ao carregar dados do usuário, limpando sessão.');
            logout();
            return;
          }

          setUser(userData);
        } catch (error) {
          console.error('Falha crítica ao inicializar autenticação, limpando sessão.', error);
          logout();
        }
      }
      if (mounted) setIsLoading(false);
    };

    initializeAuth();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda só uma vez

  const handleAuthSuccess = (rawUser: any, token: string) => {
    const mappedUser = mapUser(rawUser);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', mappedUser.id.toString());
    setToken(token);
    setUser(mappedUser);
  };

  // ✅ 2. Implementada a função para atualizar os dados do usuário
  const refreshUser = useCallback(async () => {
    if (!user?.id) {
        console.warn("Tentativa de atualizar usuário sem um usuário logado.");
        return;
    }
    try {
        const updatedUserData = await getUser(user.id);
        if (updatedUserData) {
            setUser(updatedUserData);
        }
    } catch (error) {
        console.error("Falha ao atualizar os dados do usuário:", error);
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<{ data: { user: any; token: string } }>('login', {
        email,
        senha: password,
        device_name: 'browser',
      });

      handleAuthSuccess(response.data.user, response.data.token);
    } catch (error: any) {
      console.error('Falha no login:', error);
      throw new Error(error.message || 'E-mail ou senha incorretos. Tente novamente.');
    }
  };

  const register = async (data: Record<string, any>) => {
    const { password, ...rest } = data;
    const payload = { ...rest, senha: password };
    await apiPost<{ data: any }>('users', payload);
    await login(data.email, password);
  };

  // ✅ 3. Exposta a nova função para os componentes filhos
  const value = { user, token, isLoading, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}
