
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuardianDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel do Responsável</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel! Aqui você poderá gerenciar seus dependentes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dependentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Em breve, você poderá adicionar e gerenciar os perfis dos seus dependentes, controlar saldos e ver históricos de pedidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
