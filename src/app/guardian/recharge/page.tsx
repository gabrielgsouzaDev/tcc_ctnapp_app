
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
import { type Student, type Guardian } from '@/lib/data';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

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

  const [guardianProfile, setGuardianProfile] = useState<Guardian | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<RechargeTarget | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/guardian/profile');
            setGuardianProfile(response.data);
        } catch (error) {
            console.error("Failed to fetch guardian profile", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar perfil',
                description: 'Não foi possível buscar as informações do seu perfil.'
            })
        } finally {
            setIsLoading(false);
        }
    };
    fetchProfile();
  }, [toast]);


  const guardianAsTarget: RechargeTarget | null = guardianProfile ? {
      id: 'guardian',
      name: guardianProfile.name,
      balance: guardianProfile.balance,
      isGuardian: true,
  } : null;

  const allTargets: RechargeTarget[] = guardianAsTarget && guardianProfile ? [guardianAsTarget, ...guardianProfile.students] : [];

  const handleAmountSelect = (amount: number) => {
    setRechargeAmount(amount.toString());
  };
  
  const handleInternalTransfer = async () => {
     if (!selectedTarget || selectedTarget.isGuardian || !rechargeAmount || Number(rechargeAmount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: 'Selecione um aluno e um valor para a transferência.',
      });
      return;
    }

    if (!guardianProfile || Number(rechargeAmount) > guardianProfile.balance) {
      toast({
        variant: 'destructive',
        title: 'Saldo insuficiente',
        description: 'Seu saldo é insuficiente para realizar esta transferência.',
      });
      return;
    }

    setIsProcessing(true);
    try {
        await api.post('/transactions/transfer', {
            toStudentId: selectedTarget.id,
            amount: Number(rechargeAmount),
        });

        toast({
          title: 'Transferência Concluída!',
          description: `O saldo de ${selectedTarget.name} foi atualizado com sucesso.`,
        });
        router.push('/guardian/dashboard');
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Erro na Transferência',
            description: error.response?.data?.message || 'Não foi possível completar a transferência.'
        });
    } finally {
        setIsProcessing(false);
    }
  }

  const amountValue = Number(rechargeAmount);
  const isPixButtonDisabled = !selectedTarget || !amountValue || amountValue <= 0 || isProcessing;
  const isTransferDisabled = isPixButtonDisabled || (guardianProfile && amountValue > guardianProfile.balance) || selectedTarget?.isGuardian;

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-1/2"></div>
            <Card className="h-48" />
            <Card className="h-48" />
            <Card className="h-48" />
        </div>
    )
  }
  
  if (!guardianProfile) {
     return (
        <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6 text-center">
            <p className="text-muted-foreground">Não foi possível carregar as informações.</p>
        </div>
     )
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Recarregar Saldo</h1>
        <p className="text-muted-foreground">
          Adicione créditos para os alunos ou para sua própria conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Passo 1: Selecione o Destinatário
          </CardTitle>
          <CardDescription>
            Escolha para quem a recarga será destinada.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {allTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => setSelectedTarget(target)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all duration-200',
                selectedTarget?.id === target.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <Badge variant={target.isGuardian ? "secondary" : "default"} className="absolute left-2 top-2">
                {target.isGuardian ? 'Responsável' : 'Aluno'}
              </Badge>
              {selectedTarget?.id === target.id && (
                <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-primary" />
              )}
              <User className="mb-2 mt-8 h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">{target.name}</p>
              <p className="text-sm text-muted-foreground">
                Saldo: R$ {target.balance.toFixed(2)}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Passo 2: Escolha o Valor
          </CardTitle>
          <CardDescription>
            Defina o valor a ser adicionado ao saldo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Label htmlFor="amount" className="text-lg font-semibold sm:mb-0">R$</Label>
            <Input
              id="amount"
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              placeholder="0.00"
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
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Passo 3: Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Destinatário:</span>
                <span className="font-medium">{selectedTarget?.name || 'N/A'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xl">
                <span className="font-semibold">Valor da Recarga:</span>
                <span className="font-bold text-primary">R$ {amountValue > 0 ? amountValue.toFixed(2) : '0.00'}</span>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 sm:flex-row">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={isTransferDisabled}
                  className="w-full"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Repeat className="mr-2 h-5 w-5" />}
                  {isProcessing ? 'Processando...' : 'Transferir do seu Saldo'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transferência Interna</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a transferir <span className="font-bold">R$ {amountValue > 0 ? amountValue.toFixed(2) : '0.00'}</span> do seu saldo para <span className="font-bold">{selectedTarget?.name}</span>.
                        Seu saldo restante será <span className="font-bold">R$ {(guardianProfile.balance - amountValue).toFixed(2)}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleInternalTransfer}>Confirmar Transferência</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Link 
                href={`/pix-payment?amount=${amountValue}&targetId=${selectedTarget?.id}&targetType=${selectedTarget?.isGuardian ? 'guardian' : 'student'}`}
                passHref
                className={cn('w-full', isPixButtonDisabled && 'pointer-events-none opacity-50')}
            >
                <Button
                    size="lg"
                    disabled={isPixButtonDisabled}
                    className="w-full"
                >
                    Pagar com PIX
                    <CreditCard className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </CardFooter>
      </Card>
      
       <p className="text-xs text-center text-muted-foreground">
          Seu saldo como responsável é de R$ {guardianProfile.balance.toFixed(2)}. Use-o para transferir para os alunos.
       </p>
    </div>
  );
}
