'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserCredential } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

const registerSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  studentRa: z.string().min(1, { message: 'O RA do aluno é obrigatório.' }),
});

export default function ResponsavelAuthPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', studentRa: '' },
  });
  
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/guardian/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    initiateEmailSignIn(auth, data.email, data.password);
    toast({ title: 'Entrando...', description: 'Aguarde um momento.' });
  };

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
        toast({ title: 'Criando conta...', description: 'Seu cadastro está sendo realizado.' });

        // 1. Cria o usuário no Firebase Authentication
        const userCredential = await initiateEmailSignUp(auth, data.email, data.password) as UserCredential;
        
        if (userCredential?.user) {
            const idToken = await userCredential.user.getIdToken();

            // 3. Envia os dados e o token para o seu back-end central (PHP)
            // !! IMPORTANTE !! Substitua a URL abaixo pela URL real do seu endpoint da API
            const apiEndpoint = 'https://sua-api.com/register/guardian'; // <-- COLOQUE SUA URL AQUI

            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                studentRa: data.studentRa,
                firebaseUid: userCredential.user.uid,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Falha ao registrar no servidor central.');
            }

            // Se tudo correu bem, o usuário será redirecionado pelo useEffect
            toast({ title: 'Cadastro realizado com sucesso!', description: 'Você será redirecionado em breve.' });

        } else {
             throw new Error("Não foi possível obter os dados do usuário após o cadastro no Firebase.");
        }

    } catch (error: any) {
        console.error("Registration Error: ", error);
        toast({
            variant: "destructive",
            title: "Erro no Cadastro",
            description: error.message || "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        });
    }
  };


  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="font-headline text-5xl font-bold text-primary">CTNAPP</h1>
          <p className="text-muted-foreground">Acesso do Responsável.</p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Área do Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="pt-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="responsavel@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                      Entrar
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="register" className="pt-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="responsavel@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crie uma senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={registerForm.control}
                      name="studentRa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RA do Aluno</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o RA do aluno" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                      Criar Conta
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
