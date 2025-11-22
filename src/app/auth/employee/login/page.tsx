"use client";

import { useState, useEffect } from 'react'; // Adicionado useEffect
import { useAuth } from '@/lib/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployeeLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, user, isLoading } = useAuth(); // Obtém user e isLoading do contexto
    const router = useRouter();

    // CORRIGIDO: A lógica de verificação e redirecionamento agora está em um useEffect
    useEffect(() => {
        // Se o login foi feito e temos um usuário
        if (!isLoading && user) {
            // Verifica se o usuário tem a role de 'Funcionário'
            const isEmployee = user.roles?.some(role => role.nome_role === 'Funcionário');

            if (isEmployee) {
                router.push('/employee/dashboard');
            } else {
                // O usuário está logado, mas não é funcionário. 
                // Mostra erro e não redireciona.
                setError('Acesso negado. Esta área é restrita para funcionários.');
            }
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // Apenas chama o login. O useEffect cuidará do resto.
            await login(email, password);
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || 'Falha no login. Verifique suas credenciais.';
            setError(message);
        }
    };

    // Se estiver autenticando, pode mostrar um feedback visual
    if (isLoading) {
        return <p>Autenticando...</p>
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#FFE7D4' }}>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333', fontFamily: 'Inter, sans-serif' }}>Login do Funcionário</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                        style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                    />
                    <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#FC5407', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                        Entrar
                    </button>
                    {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
                    Não tem uma conta? <Link href="/auth/employee/register" style={{ color: '#FC5407', textDecoration: 'none' }}>Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}
