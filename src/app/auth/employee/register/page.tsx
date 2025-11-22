"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider'; // CORRIGIDO: Caminho de importação
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmployeeRegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            // O auth-provider espera 'password', não 'senha'.
            // A role ID '6' é para Funcionário.
            const employeeData = {
                nome: name,
                email,
                password, // CORRIGIDO: Chave é 'password'
                telefone: phone,
                id_role: 6,
            };

            // CORRIGIDO: A função register não retorna o usuário.
            // Ela internamente chama o login, que atualiza o contexto.
            await register(employeeData);

            // A melhor prática aqui é redirecionar para o login,
            // forçando o usuário a confirmar suas novas credenciais.
            router.push('/auth/employee/login');

        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || 'Ocorreu um erro durante o cadastro.';
            setError(message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#FFE7D4' }}>
            <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333', fontFamily: 'Inter, sans-serif' }}>Cadastro de Funcionário</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nome Completo"
                        required
                        style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                    />
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
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefone (Opcional)"
                        style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                    />
                    <button type="submit" style={{ padding: '0.85rem', backgroundColor: '#FC5407', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>
                        Cadastrar
                    </button>
                    {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>
                    Já tem uma conta? <Link href="/auth/employee/login" style={{ color: '#FC5407', textDecoration: 'none' }}>Faça login</Link>
                </p>
            </div>
        </div>
    );
}
