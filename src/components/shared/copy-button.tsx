
'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CopyButton({ value }: { value: string }) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const showSuccess = () => {
    setHasCopied(true);
    toast({
      title: 'Copiado!',
      description: 'O código PIX foi copiado para a área de transferência.',
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const showError = () => {
    toast({
      variant: 'destructive',
      title: 'Falha ao copiar',
      description: 'Não foi possível copiar o código. Por favor, copie manualmente.',
    });
  };

  const handleCopy = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        showSuccess();
      } catch (error) {
        console.error("Clipboard API failed, falling back.", error);
        // Fallback for when clipboard API fails (e.g. in non-secure contexts)
        copyManually();
      }
    } else {
        // Fallback for older browsers
        copyManually();
    }
  };

  const copyManually = () => {
    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.style.position = 'absolute';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      console.error('Fallback copy failed', err);
      showError();
    }
    document.body.removeChild(textArea);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleCopy}>
      {hasCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copiar código</span>
    </Button>
  );
}
