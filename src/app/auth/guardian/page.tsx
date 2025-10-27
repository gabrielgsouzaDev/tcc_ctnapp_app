
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const signupSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  studentRa: z.string().min(4, 'O RA do aluno deve ter pelo menos 4 caracteres.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function GuardianAuthPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', studentRa: '', email: '', password: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Login bem-sucedido!', description: 'Redirecionando para o painel...' });
      router.push('/guardian/dashboard');
    } catch (error: any) {
      let description = 'Ocorreu um erro inesperado. Tente novamente.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = 'E-mail ou senha inválidos. Por favor, tente novamente.';
      }
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);

    let userCredential; // Keep userCredential in a broader scope

    try {
      // Step 1: Create user in Firebase Auth
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Step 2: Call the Laravel backend to create the guardian profile
      await api.post('/guardian/register', {
        firebaseUid: user.uid,
        name: data.name,
        email: data.email,
        studentRa: data.studentRa,
      });

      toast({ title: 'Conta criada com sucesso!', description: 'Você será redirecionado para o painel.' });
      router.push('/guardian/dashboard');

    } catch (error: any) {
      let description = 'Ocorreu um erro ao criar a conta. Tente novamente.';

      if (error.code === 'auth/email-already-in-use') {
        description = 'Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.';
      } else if (error.response) {
        // Handle Laravel API errors
        description = error.response.data?.message || error.message || 'Falha na comunicação com o servidor.';
        
        // ** CRITICAL ROLLBACK STEP **
        // If the Laravel API call failed, but the Firebase user was created, delete the Firebase user.
        if (userCredential) {
          try {
            await userCredential.user.delete();
            console.log('Orphaned Firebase user deleted due to API registration failure.');
          } catch (deleteError) {
            console.error('CRITICAL: Failed to delete orphaned Firebase user.', deleteError);
            description = "Ocorreu um erro crítico no cadastro. Por favor, contate o suporte.";
          }
        }
      } else if (error.request) {
        // Handle network errors (no response received)
        description = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.";
      }
      
      toast({
        variant: 'destructive',
        title: 'Falha no cadastro',
        description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="font-headline text-5xl font-bold text-primary">CTNAPP</h1>
          </Link>
          <p className="text-muted-foreground">Acesso do Responsável</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Acesse sua conta para gerenciar saldos e pedidos.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
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
                            <Input type="password" placeholder="Sua senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Responsável</CardTitle>
                <CardDescription>Crie sua conta para vincular a um aluno.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={signupForm.control}
                      name="studentRa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RA do Aluno</FormLabel>
                          <FormControl>
                            <Input placeholder="RA do aluno a ser vinculado" {...field} />
                          </FormControl>
                           <p className="text-xs text-muted-foreground pt-1">Este é o Registro do Aluno que você deseja gerenciar.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Crie uma Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crie uma senha segura" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
         <div className="mt-6 text-center">
          <Button variant="link" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
