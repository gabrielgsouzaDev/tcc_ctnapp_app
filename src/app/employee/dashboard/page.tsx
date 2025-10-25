
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function EmployeeDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Painel do Funcionário</h1>
        <p className="text-muted-foreground">
          Bem-vindo! Esta é sua área para interagir com a cantina.
        </p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
          <CardDescription>Funcionalidades principais ao seu alcance.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Em breve, aqui você poderá ver o cardápio, fazer pedidos e consultar seu saldo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
