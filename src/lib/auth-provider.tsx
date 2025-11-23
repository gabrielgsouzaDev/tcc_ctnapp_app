'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, apiGet } from './api';
import { type User } from './data';
import { getUser } from './services';

// --- Tipagens para a Resposta da API de Login ---

// Resposta em caso de SUCESSO
interface AuthSuccessResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}

// Resposta em caso de FALHA
interface AuthFailureResponse {
  success: false;
  message: string;
}

// A resposta completa da API será um dos dois tipos acima (União Discriminada)
type LoginApiResponse = AuthSuccessResponse | AuthFailureResponse;

// O payload que a função handleAuthSuccess espera, extraído da resposta de sucesso
interface AuthSuccessPayload {
    token: string;
    user: User;
}

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
           setUser(userData);
        } catch (error) {
          console.error("Falha ao buscar usuário com dados locais, limpando sessão.", error);
          localStorage.clear(); // Limpa tudo se os dados estiverem corrompidos
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const handleAuthSuccess = (payload: AuthSuccessPayload) => {
    localStorage.setItem('authToken', payload.token);
    localStorage.setItem('userId', payload.user.id.toString());
    setToken(payload.token);
    setUser(payload.user);
  }

  const login = async (email: string, password: string) => {
    const response = await apiPost<LoginApiResponse>('login', { email, senha: password, device_name: 'browser' });

    // ✅ CORREÇÃO DEFINITIVA: Checa `response.success` de forma explícita.
    // Isso funciona como um "type guard" para o TypeScript.
    if (response.success === true) {
      // Se success é true, o TS sabe que `response` é `AuthSuccessResponse`
      // e que `response.data` existe e é seguro de usar.
      handleAuthSuccess(response.data);
    } else {
      // Se success não é true, o TS sabe que `response` é `AuthFailureResponse`
      // e que `response.message` existe e é seguro de usar.
      throw new Error(response.message || 'Login falhou por um motivo desconhecido');
    }
  };

  const register = async (data: Record<string, any>) => {
    const { password, role, ...restOfData } = data;

    const roleMappings: { [key: string]: number } = {
        'Admin': 1,
        'Aluno': 2,
        'Responsavel': 3,
        'Funcionario': 4,
        'Cantina': 5,
    };
    const roleId = roleMappings[role as string];

    if (!roleId) {
        throw new Error(`A role fornecida ('${role}') é inválida.`);
    }

    const payload = { ...restOfData, senha: password, id_role: roleId };
    await apiPost('users', payload);
    
    // Após o cadastro, faz o login para popular a sessão
    await login(data.email, password);
  };

  const logout = async () => {
    try {
        await apiPost('logout', {});
    } catch (error) {
        console.error("Logout via API falhou, procedendo com logout local.", error);
    } finally {
        localStorage.clear(); // Limpa toda a sessão local
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
