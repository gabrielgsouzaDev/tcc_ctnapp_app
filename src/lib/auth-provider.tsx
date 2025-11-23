'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// ✅ 1. Importar usePathname para verificar a rota atual
import { useRouter, usePathname } from 'next/navigation';
import { apiPost, apiGet } from './api';
import { type User } from './data';
import { getUser, mapUser } from './services';

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
  const pathname = usePathname(); // ✅ Obter o pathname atual

  // A função de logout foi movida para cima para ser usada no useEffect
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

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

      if (storedToken && storedUserId) {
        setToken(storedToken);
        try {
           const userData = await getUser(storedUserId);

           if (userData) {
            // ✅ 2. Lógica de verificação de consistência da sessão
            const isStudentRoute = pathname.startsWith('/student');
            const isGuardianRoute = pathname.startsWith('/guardian');
            const userIsStudent = userData.role === 'Aluno';
            const userIsGuardian = userData.role === 'Responsavel';

            // Se o tipo de usuário na sessão for inconsistente com a rota, força o logout
            if ((isStudentRoute && !userIsStudent) || (isGuardianRoute && !userIsGuardian)) {
                console.warn("Inconsistência de sessão detectada (rota vs. papel de usuário). Limpando a sessão.");
                logout(); // Força o logout para limpar dados corrompidos
                return; // Interrompe a execução
            }

            setUser(userData);

           } else {
             throw new Error('Usuário não encontrado com o ID armazenado');
           }
        } catch (error) {
          console.error("Falha ao buscar usuário, limpando sessão.", error);
          logout(); // Usa a função de logout para limpar tudo
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  // A dependência de `pathname` garante que a verificação ocorra em mudanças de rota, se necessário
  }, [pathname]); 

  const handleAuthSuccess = (rawUser: any, token: string) => {
    const mappedUser = mapUser(rawUser);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', mappedUser.id.toString());
    setToken(token);
    setUser(mappedUser);
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<{ data: { user: any; token: string } }>('login', { email, senha: password, device_name: 'browser' });
      handleAuthSuccess(response.data.user, response.data.token);
    } catch (error: any) {
      console.error("Falha no login:", error);
      throw new Error(error.message || 'E-mail ou senha incorretos. Tente novamente.');
    }
  };

  const register = async (data: Record<string, any>) => {
    const { password, ...restOfData } = data;
    const payload = { ...restOfData, senha: password };
    await apiPost<{ data: any }>('users', payload);
    await login(data.email, password);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout, // Expõe a função de logout já definida
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
