'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, Clock, Loader2, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/shared/copy-button';
import { QRCode } from '@/components/shared/qr-code';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-provider';
import { rechargeBalance } from '@/lib/services';

function PixPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();

  const amount = searchParams.get('amount') || '0';
  const targetId = searchParams.get('targetId');
  const walletId = searchParams.get('walletId');

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');
  const [pixDetails, setPixDetails] = useState<{ qrCode: string; code: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatePix = async () => {
      if (!amount || Number(amount) <= 0 || !targetId || !walletId) {
        toast({ variant: 'destructive', title: 'Dados inválidos para gerar PIX.' });
        router.back();
        return;
      }
      try {
        setIsLoading(true);
        setTimeout(() => {
          setPixDetails({
            qrCode: `pix-qrcode-for-${Number(amount).toFixed(2)}`,
            code: `00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540${Number(amount).toFixed(2).replace('.', '')}5802BR5913user-${targetId}6009SAO PAULO62070503***6304E7DF`
          });
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to generate PIX:', error);
        toast({ variant: 'destructive', title: 'Erro ao gerar PIX', description: 'Não foi possível criar a cobrança PIX. Tente novamente.' });
        router.back();
      }
    };
    generatePix();
  }, [amount, targetId, walletId, router, toast]);

  const handleConfirmPayment = async () => {
    if (!amount || Number(amount) <= 0 || !targetId || !walletId || !user?.id) return;

    setPaymentStatus('processing');
    toast({ title: 'Confirmando Pagamento...', description: 'Estamos atualizando o saldo. Isso pode levar um instante.' });

    try {
      const transactionUuid = uuidv4();
      await rechargeBalance(walletId, user.id, Number(amount), transactionUuid);

      if (refreshUser) await refreshUser();

      setPaymentStatus('confirmed');
      toast({ variant: 'success', title: 'Pagamento Confirmado!', description: 'O saldo foi atualizado com sucesso.' });

      setTimeout(() => {
        const redirectPath = user?.role === 'Aluno' ? '/student/dashboard' : '/guardian/dashboard';
        router.push(redirectPath);
      }, 3000);
    } catch (error) {
      console.error("Payment confirmation error:", error);
      toast({ variant: 'destructive', title: 'Erro na Confirmação', description: 'Não foi possível atualizar o saldo.' });
      setPaymentStatus('pending');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Gerando seu PIX...</p>
      </div>
    );
  }

  if (paymentStatus === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Pagamento Confirmado!</h2>
        <p className="text-muted-foreground">O saldo foi atualizado. Você será redirecionado em breve.</p>
      </div>
    );
  }

  if (!pixDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-destructive">Falha ao Gerar PIX</h2>
        <p className="text-muted-foreground">Não foi possível obter os dados da cobrança.</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <QrCode />
          Pagar com PIX
        </CardTitle>
        <CardDescription>
          Escaneie o QR Code abaixo com o app do seu banco ou copie o código para pagar o valor de <span className="font-bold text-primary">R$ {Number(amount).toFixed(2)}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="rounded-lg border-4 border-primary p-2 bg-white">
          <QRCode value={pixDetails.qrCode} />
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="pix-code" className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
          <div className="flex items-center gap-2">
            <input
              id="pix-code"
              readOnly
              value={pixDetails.code}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 truncate"
            />
            <CopyButton value={pixDetails.code} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
          <Clock className="h-5 w-5 mb-1" />
          <span>Este código expira em 10 minutos.</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleConfirmPayment}
          disabled={paymentStatus === 'processing'}
        >
          {paymentStatus === 'processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {paymentStatus === 'processing' ? 'Aguardando Pagamento...' : 'Já Paguei'}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </CardFooter>
    </>
  );
}

export default function PixPaymentPage() {
  return (
    <div className="container mx-auto max-w-md space-y-8 px-4 py-12">
      <Card>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          <PixPaymentContent />
        </Suspense>
      </Card>
    </div>
  );
}
