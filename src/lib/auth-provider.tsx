
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
           // Ao inicializar, busca os dados completos do usuário
           const userData = await getUser(storedUserId);
           if (userData) {
             setUser(userData);
           } else {
             throw new Error('User not found with stored ID');
           }
        } catch (error) {
          console.error("Failed to fetch user with stored token/ID, logging out.", error);
          // Limpa o estado se o token/ID for inválido
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

  // Função centralizada para lidar com o sucesso da autenticação
  const handleAuthSuccess = (response: { user: User; token: string }) => {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('userId', response.user.id.toString());
    setToken(response.token);
    setUser(response.user);
  }

  const login = async (email: string, password: string) => {
    // A rota de login do backend espera 'senha'
    const response = await apiPost<{ user: User; token: string }>('login', { email, senha: password });
    handleAuthSuccess(response);
  };

  const register = async (data: Record<string, any>) => {
    // Prepara o payload para a rota POST /users, que é um apiResource
    // O backend espera 'senha', não 'password'
    const payload = { ...data, senha: data.password };
    delete payload.password; // Remove o campo 'password' que o frontend usa

    // Chama a rota de criação de usuário. O backend se encarrega de associar a role.
    const response = await apiPost<{ user: User; token: string }>('users', payload);
    
    // Após o registro, o backend deve retornar o usuário e um token para login automático
    handleAuthSuccess(response);
  };

  const logout = async () => {
    try {
        // Tenta fazer logout no backend para invalidar o token
        await apiPost('logout', {});
    } catch (error) {
        console.error("Logout API call failed, proceeding with client-side logout.", error);
    } finally {
        // Limpa o estado local independentemente do sucesso da API
        localStorage.removeItem('authToken');
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
