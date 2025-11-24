
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, DollarSign, Repeat, User, Wallet, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

import { type GuardianProfile, type StudentLite } from '@/lib/data';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import { getGuardianProfile, rechargeBalance } from '@/lib/services';

type RechargeTarget = {
  id: string;
  name: string;
  balance: number;
  isGuardian?: boolean;
};

const quickAmounts = [20, 50, 100];

export default function GuardianRechargePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading, refreshUser } = useAuth();

  const [guardianProfile, setGuardianProfile] = useState<GuardianProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<RechargeTarget | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        setIsLoading(true);
        const profile = await getGuardianProfile(user.id);
        setGuardianProfile(profile);

        if (profile) {
          setSelectedTarget({
            id: profile.id,
            name: profile.name,
            balance: profile.balance,
            isGuardian: true,
          });
        }

        setIsLoading(false);
      }
    };

    if (!isUserLoading) fetchProfile();
  }, [user, isUserLoading]);

  const allTargets: RechargeTarget[] = guardianProfile
    ? [
        {
          id: guardianProfile.id,
          name: guardianProfile.name,
          balance: guardianProfile.balance,
          isGuardian: true,
        },
        ...guardianProfile.students.map((s) => ({
          id: s.id,
          name: s.name,
          balance: s.balance,
          isGuardian: false,
        })),
      ]
    : [];

  const handleAmountSelect = (amount: number) => {
    setRechargeAmount(amount.toString());
  };
  
  const handleRecharge = async () => {
    const amountValue = Number(rechargeAmount);

    if (!selectedTarget || !rechargeAmount || amountValue <= 0) {
      toast({ variant: 'destructive', title: 'Dados inválidos' });
      return;
    }
    
    // Redireciona para a página de pagamento PIX
    router.push(`/pix-payment?amount=${amountValue}&targetId=${selectedTarget.id}`);
  };


  const amountValue = Number(rechargeAmount);
  const isPixButtonDisabled =
    !selectedTarget || !amountValue || amountValue <= 0 || isProcessing;


  if (isLoading || isUserLoading) {
    return <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6 animate-pulse">
      <div className="h-10 bg-muted rounded w-1/2"></div>
      <Card className="h-48" />
      <Card className="h-48" />
      <Card className="h-48" />
    </div>;
  }

  if (!guardianProfile) {
    return (
      <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6 text-center">
        <p className="text-muted-foreground">Não foi possível carregar as informações.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recarregar Saldo</h1>
        <p className="text-muted-foreground">
          Adicione créditos para você ou para um de seus dependentes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Selecione o Destino</CardTitle>
          <CardDescription>Escolha para quem você quer adicionar saldo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {allTargets.map((target) => (
            <div
              key={target.id}
              className={cn(
                'rounded-lg border p-4 cursor-pointer transition-all',
                selectedTarget?.id === target.id ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/5' : 'hover:bg-muted/50'
              )}
              onClick={() => setSelectedTarget(target)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-3 rounded-full">
                    {target.isGuardian ? <Wallet className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold">{target.name}</p>
                    <p className="text-sm text-muted-foreground">{target.isGuardian ? 'Sua carteira' : 'Dependente'}</p>
                  </div>
                </div>
                {selectedTarget?.id === target.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saldo atual:</span>
                <span className="font-bold">R$ {target.balance.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedTarget && (
        <Card>
          <CardHeader>
            <CardTitle>2. Escolha o Valor</CardTitle>
            <CardDescription>Digite o valor da recarga ou use uma das opções rápidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <Label htmlFor="amount" className="text-lg font-semibold sm:mb-0">R$</Label>
              <Input
                id="amount"
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="0,00"
                className="h-14 flex-1 text-center text-4xl font-bold tracking-tight [appearance:textfield] focus-visible:ring-offset-0 sm:text-left [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={Number(rechargeAmount) === amount ? 'default' : 'outline'}
                  onClick={() => handleAmountSelect(amount)}
                >
                  R$ {amount}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={isPixButtonDisabled}
              onClick={handleRecharge}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Continuar para Pagamento com PIX
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
