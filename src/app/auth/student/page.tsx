
'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import api from '@/lib/api';
import { type School } from '@/lib/data';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const signupSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  ra: z.string().min(1, 'O RA é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  schoolId: z.string({ required_error: 'Por favor, selecione uma escola.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

// Mock data for schools since there's no public endpoint yet
const mockSchools: School[] = [
  { id: '1', name: 'Escola Padrão A', address: 'Rua Exemplo, 123' },
  { id: '2', name: 'Escola Padrão B', address: 'Avenida Teste, 456' },
];

export default function StudentAuthPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>(mockSchools); // Use mock data

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', ra: '', email: '', password: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Login bem-sucedido!', description: 'Redirecionando para o painel...' });
      router.push('/student/dashboard');
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
    let userCredential;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await api.post('/cadastrar-aluno', {
        uid_firebase: user.uid, // Corrected field name
        name: data.name,
        email: data.email,
        ra: data.ra,
        schoolId: data.schoolId,
      });

      toast({ title: 'Conta criada com sucesso!', description: 'Você será redirecionado para o painel.' });
      router.push('/student/dashboard');

    } catch (error: any) {
       console.error("Signup Error:", error);
      let description = 'Ocorreu um erro ao criar a conta. Tente novamente.';

      if (error.code === 'auth/email-already-in-use') {
        description = 'Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.';
      } else if (error.response) {
        description = error.response.data?.message || `Erro do servidor: ${error.response.statusText || 'Erro desconhecido'}`;
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
        description = "Não foi possível conectar ao servidor. Verifique sua conexão e se a API está online.";
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
          <p className="text-muted-foreground">Acesso do Aluno</p>
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
                <CardDescription>Acesse sua conta para fazer pedidos.</CardDescription>
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
                <CardTitle>Cadastro de Aluno</CardTitle>
                <CardDescription>Crie sua conta para utilizar os serviços da cantina.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
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
                      control={signupForm.control}
                      name="ra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu RA (Registro de Aluno)</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu número de RA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={signupForm.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escola</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione sua escola" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {schools.length === 0 ? (
                                <SelectItem value="loading" disabled>Carregando escolas...</SelectItem>
                              ) : (
                                schools.map(school => (
                                  <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
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
