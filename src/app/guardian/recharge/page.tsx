
'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, CreditCard, DollarSign, Repeat, User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { guardianProfile, type Student } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

const quickAmounts = [20, 50, 100];

export default function GuardianRechargePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [guardianBalance] = useState(75.50); // Saldo fictício para o responsável

  const handleAmountSelect = (amount: number) => {
    setRechargeAmount(amount.toString());
  };
  
  const handleInternalTransfer = () => {
     if (!selectedStudent || !rechargeAmount || Number(rechargeAmount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Dados inválidos',
        description: 'Selecione um aluno e um valor para a transferência.',
      });
      return;
    }

    if (Number(rechargeAmount) > guardianBalance) {
      toast({
        variant: 'destructive',
        title: 'Saldo insuficiente',
        description: 'Seu saldo é insuficiente para realizar esta transferência.',
      });
      return;
    }

    setIsProcessing(true);
    toast({
      title: 'Processando Transferência...',
      description: `O valor de R$${Number(rechargeAmount).toFixed(2)} está sendo transferido para ${selectedStudent.name}.`,
    });

    setTimeout(() => {
      toast({
        title: 'Transferência Concluída!',
        description: `O saldo de ${selectedStudent.name} foi atualizado com sucesso.`,
      });
      router.push('/guardian/dashboard');
    }, 1500);
  }

  const amountValue = Number(rechargeAmount);
  const isButtonDisabled = !selectedStudent || !amountValue || amountValue <= 0 || isProcessing;
  const isTransferDisabled = isButtonDisabled || amountValue > guardianBalance;


  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Recarregar Saldo</h1>
        <p className="text-muted-foreground">
          Adicione créditos para os alunos de forma rápida e segura.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Passo 1: Selecione o Aluno
          </CardTitle>
          <CardDescription>
            Escolha para qual aluno a recarga será destinada.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {guardianProfile.students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border-2 p-4 text-center transition-all duration-200',
                selectedStudent?.id === student.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              {selectedStudent?.id === student.id && (
                <CheckCircle2 className="absolute right-2 top-2 h-5 w-5 text-primary" />
              )}
              <User className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">
                Saldo: R$ {student.balance.toFixed(2)}
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
            Defina o valor a ser adicionado ao saldo do aluno.
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
                <span className="text-muted-foreground">Aluno:</span>
                <span className="font-medium">{selectedStudent?.name || 'N/A'}</span>
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
                  <Repeat className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Processando...' : 'Transferir do seu Saldo'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transferência Interna</AlertDialogTitle>
                    <AlertDialogDescription>
                        Você está prestes a transferir <span className="font-bold">R$ {amountValue.toFixed(2)}</span> do seu saldo para <span className="font-bold">{selectedStudent?.name}</span>.
                        Seu saldo restante será <span className="font-bold">R$ {(guardianBalance - amountValue).toFixed(2)}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleInternalTransfer}>Confirmar Transferência</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Link 
                href={`/pix-payment?amount=${amountValue}&studentId=${selectedStudent?.id}`}
                passHref
                className={cn('w-full', isButtonDisabled && 'pointer-events-none opacity-50')}
            >
                <Button
                    size="lg"
                    disabled={isButtonDisabled}
                    className="w-full"
                >
                    {isProcessing ? 'Processando...' : 'Pagar com PIX'}
                    {!isProcessing && <CreditCard className="ml-2 h-5 w-5" />}
                </Button>
            </Link>
        </CardFooter>
      </Card>
      
       <p className="text-xs text-center text-muted-foreground">
          Seu saldo como responsável é de R$ {guardianBalance.toFixed(2)}.
       </p>
    </div>
  );
}
