'use client';

// Ícone adicionado: ConciergeBell para representar o serviço do funcionário
import { User, Shield, ConciergeBell } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';

export default function ProfileSelectionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg text-center"> {/* Aumentado o max-width para acomodar 3 cards */}
        <Logo />
        <h2 className="mb-6 mt-12 text-2xl font-semibold">Quem está usando?</h2>
        {/* CORRIGIDO: O grid agora suporta 3 colunas em telas médias e maiores */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Card Aluno (Existente) */}
          <Link href="/auth/student/login" className="flex">
            <Card className="flex w-full transform cursor-pointer flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <User className="h-12 w-12 text-primary" />
                  <span>Aluno</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acessar cardápio, fazer pedidos e ver histórico.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card Responsável (Existente) */}
          <Link href="/auth/guardian/login" className="flex">
            <Card className="flex w-full transform cursor-pointer flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <Shield className="h-12 w-12 text-primary" />
                  <span>Responsável</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recarregar saldo e acompanhar os pedidos do aluno.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* NOVO: Card Funcionário */}
          <Link href="/auth/employee/login" className="flex">
            <Card className="flex w-full transform cursor-pointer flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <ConciergeBell className="h-12 w-12 text-primary" />
                  <span>Funcionário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerenciar pedidos, estoque e fluxo da cantina.
                </p>
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </div>
  );
}
