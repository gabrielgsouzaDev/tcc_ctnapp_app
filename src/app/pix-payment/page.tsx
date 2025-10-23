
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Copy, Loader2, QrCode } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/shared/copy-button';
import { QRCode } from '@/components/shared/qr-code';
import { Label } from '@/components/ui/label';

function PixPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const amount = searchParams.get('amount') || '0';
  const studentId = searchParams.get('studentId'); // Pode ser nulo se o aluno estiver pagando

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending');

  const pixCode = '00020126360014br.gov.bcb.pix0114+5511999999999520400005303986540550.005802BR5913NOME COMPLETO6009SAO PAULO62070503***6304E4A9';

  const handleConfirmPayment = () => {
    setPaymentStatus('processing');
    toast({
      title: 'Aguardando Confirmação...',
      description: 'Estamos verificando o status do seu pagamento PIX. Isso pode levar um instante.',
    });

    // Simula a confirmação do pagamento após alguns segundos
    setTimeout(() => {
      setPaymentStatus('confirmed');
      toast({
        title: 'Pagamento Confirmado!',
        description: 'O saldo foi atualizado com sucesso.',
      });
    }, 3000);

    // Redireciona o usuário após a confirmação
    setTimeout(() => {
      const redirectPath = studentId ? '/guardian/dashboard' : '/student/balance';
      router.push(redirectPath);
    }, 5000);
  };

  if (paymentStatus === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Pagamento Confirmado!</h2>
        <p className="text-muted-foreground">O saldo foi atualizado. Você será redirecionado em breve.</p>
      </div>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <QrCode />
          Pagar com PIX
        </CardTitle>
        <CardDescription>
          Escaneie o QR Code abaixo com o app do seu banco ou copie o código para pagar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="rounded-lg border-4 border-primary p-2 bg-white">
          <QRCode value={pixCode} />
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="pix-code" className="text-sm font-medium">Código PIX (Copia e Cola)</Label>
          <div className="flex items-center gap-2">
            <input
              id="pix-code"
              readOnly
              value={pixCode}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 truncate"
            />
            <CopyButton value={pixCode} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <Clock className="h-5 w-5 mb-1"/>
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
                <Suspense fallback={<div>Carregando...</div>}>
                    <PixPaymentContent />
                </Suspense>
            </Card>
        </div>
    )
}
