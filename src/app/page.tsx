
'use client';

import { User, Shield, BookUser, Database } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { seedDatabase } from '@/lib/seed';


export default function ProfileSelectionPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    try {
      const result = await seedDatabase(firestore);
      toast({
        title: 'Sucesso!',
        description: result.message,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao popular o banco de dados',
        description: 'Verifique o console para mais detalhes.',
      });
    } finally {
      setIsSeeding(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <Logo />
        <h2 className="mb-6 mt-12 text-2xl font-semibold">Quem está usando?</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link href="/auth/student" className="flex">
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
          <Link href="/auth/guardian" className="flex">
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
          <Link href="/auth/employee" className="flex">
             <Card className="flex w-full transform cursor-pointer flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex flex-col items-center gap-2">
                  <BookUser className="h-12 w-12 text-primary" />
                  <span>Funcionário</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acessar a cantina como professor ou funcionário.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <div className="mt-12">
          <p className="text-sm text-muted-foreground">
            Primeira vez usando? Clique aqui para popular o banco com dados de exemplo.
          </p>
          <Button onClick={handleSeed} variant="outline" className="mt-2" disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? 'Populando...' : 'Popular Banco de Dados'}
          </Button>
        </div>
      </div>
    </div>
  );
}
