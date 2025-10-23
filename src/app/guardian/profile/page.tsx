'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function GuardianProfilePage() {
  const { user, isUserLoading } = useUser();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getToken = async () => {
      if (user) {
        setIsLoadingToken(true);
        try {
          // Força a renovação do token para garantir que não está expirado.
          const token = await user.getIdToken(true);
          setIdToken(token);
        } catch (error) {
          console.error('Error getting ID token:', error);
          toast({
            variant: 'destructive',
            title: 'Erro ao obter token',
            description: 'Não foi possível carregar o token de autenticação.',
          });
        } finally {
          setIsLoadingToken(false);
        }
      }
    };

    getToken();
  }, [user, toast]);
  
  const handleCopyToClipboard = () => {
    if(idToken) {
        navigator.clipboard.writeText(idToken);
        toast({
            title: 'Token Copiado!',
            description: 'O ID Token foi copiado para a área de transferência.'
        })
    }
  }

  if (isUserLoading) {
    return <p>Carregando perfil...</p>;
  }

  if (!user) {
    return <p>Você precisa estar logado para ver esta página.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight font-headline">Perfil e Conexão com Back-end</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>
            Estes são os detalhes da sua sessão de autenticação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Firebase UID</span>
            <span className="font-medium">{user.uid}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Firebase ID Token</CardTitle>
           <CardDescription>
            Este é o token dinâmico que autentica o usuário. Para cada requisição que este app fizer ao seu back-end central (PHP), envie este token no cabeçalho HTTP `Authorization` como um `Bearer Token`. <br/><br/> Exemplo: `Authorization: Bearer [ID_TOKEN]`
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoadingToken && <p>Gerando token...</p>}
            {idToken && (
                <>
                    <div className="p-4 bg-muted rounded-md text-sm break-all" style={{ wordBreak: 'break-all' }}>
                        {idToken}
                    </div>
                    <Button onClick={handleCopyToClipboard}>Copiar Token</Button>
                </>
            )}
             {!idToken && !isLoadingToken && <p className="text-destructive-foreground">Não foi possível gerar o token.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
