
'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CopyButton({ value }: { value: string }) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setHasCopied(true);
    toast({
      title: 'Copiado!',
      description: 'O código PIX foi copiado para a área de transferência.',
    });
    setTimeout(() => setHasCopied(false), 2000);
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
