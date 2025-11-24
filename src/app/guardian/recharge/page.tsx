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

// ⛔ REMOVIDO UserProfile e StudentProfile
// ⛔ StudentLite adicionado
import { type GuardianProfile, type StudentLite } from '@/lib/data';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-provider';
import { getGuardianProfile, internalTransfer, rechargeBalance } from '@/lib/services';

type RechargeTarget = {
  id: string;
  name: string;
  balance: number;
  walletId: string | null;
  isGuardian?: boolean;
};

const quickAmounts = [20, 50, 100];

export default function GuardianRechargePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();

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
            walletId: profile.walletId,
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
          walletId: guardianProfile.walletId,
          isGuardian: true,
        },
        ...guardianProfile.students.map((s) => ({
          id: s.id,
          name: s.name,
          balance: s.balance,
          walletId: s.walletId,
          isGuardian: false,
        })),
      ]
    : [];

  const handleAmountSelect = (amount: number) => {
    setRechargeAmount(amount.toString());
  };

  const handleInternalTransfer = async () => {
    const amountValue = Number(rechargeAmount);

    if (!selectedTarget || selectedTarget.isGuardian || !rechargeAmount || amountValue <= 0 || !selectedTarget.walletId) {
      toast({ variant: 'destructive', title: 'Dados inválidos' });
      return;
    }

    if (!guardianProfile || amountValue > guardianProfile.balance || !guardianProfile.walletId) {
      toast({ variant: 'destructive', title: 'Saldo insuficiente ou conta inválida' });
      return;
    }

    setIsProcessing(true);

    try {
      await internalTransfer(guardianProfile.walletId, guardianProfile.id, selectedTarget.walletId, selectedTarget.id, amountValue);

      toast({ variant: 'success', title: 'Transferência concluída!' });
      router.push('/guardian/dashboard');
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro na transferência' });
    } finally {
      setIsProcessing(false);
    }
  };

  const amountValue = Number(rechargeAmount);
  const isPixButtonDisabled =
    !selectedTarget || !amountValue || amountValue <= 0 || isProcessing || !selectedTarget.walletId;

  const isTransferDisabled =
    isPixButtonDisabled ||
    (guardianProfile && amountValue > guardianProfile.balance) ||
    selectedTarget?.isGuardian;

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
      {/* ...resto do arquivo exatamente igual... */}
    </div>
  );
}
