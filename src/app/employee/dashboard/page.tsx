"use client";

import { useAuth } from "@/lib/auth-provider";

export default function EmployeeDashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard do Funcionário</h1>
                <button 
                    onClick={logout}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#FC5407', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Sair
                </button>
            </header>
            
            <main>
                <p style={{ fontSize: '1.1rem' }}>
                    Olá, <span style={{ fontWeight: 'bold' }}>{user?.nome || 'Funcionário'}</span>!
                </p>
                <p>Bem-vindo à sua área de trabalho.</p>
                <p>Aqui você poderá gerenciar pedidos e outras tarefas da cantina.</p>
                
                {/* Conteúdo futuro do dashboard pode ser adicionado aqui */}

            </main>
        </div>
    );
}
