"use client";

import { useAuth } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth(); // CORRIGIDO: usa isLoading
    const router = useRouter();

    useEffect(() => {
        // Só executa a lógica depois que o estado de autenticação for resolvido
        if (!isLoading) {
            // Se não há usuário, não pode acessar a área
            if (!user) {
                router.push("/auth/employee/login");
                return;
            }

            // Se há um usuário, mas ele não tem a role de funcionário, o acesso é negado
            const isEmployee = user.roles?.some(role => role.nome_role === 'Funcionário');
            if (!isEmployee) {
                // Pode ser útil mostrar uma mensagem antes de redirecionar
                alert("Acesso negado. Esta área é apenas para funcionários."); 
                router.push("/auth/employee/login");
            }
        }
    }, [user, isLoading, router]);

    // Enquanto isLoading for true, mostra um feedback de carregamento.
    // Isso previne que a página do children (ex: dashboard) seja renderizada e "pisque" na tela
    // antes do redirecionamento acontecer.
    if (isLoading) {
        return <p>Verificando permissões...</p>; // Ou um componente de Spinner
    }

    // Se o usuário está carregado, não é nulo e é um funcionário, 
    // a lógica do useEffect não redirecionou. Então, renderiza a página.
    return <>{children}</>;
}