
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { type School } from '@/lib/data';
import { Logo } from '@/components/shared/logo';
import { getSchools } from '@/lib/services';
import { useAuth } from '@/lib/auth-provider';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

const signupSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  data_nascimento: z.string().min(1, 'A data de nascimento é obrigatória.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  // schoolId: z.string({ required_error: 'Por favor, selecione uma escola.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function StudentAuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolList = await getSchools();
        if (schoolList.length === 0) {
          toast({ variant: 'default', title: 'Nenhuma escola encontrada para seleção.' });
        } else {
          setSchools(schoolList);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
        toast({ variant: 'destructive', title: 'Erro ao buscar escolas', description: 'Não foi possível carregar a lista de escolas do servidor.' });
      }
    };
    fetchSchools();
  }, [toast]);


  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nome: '', data_nascimento: '', email: '', password: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast({ 
        title: 'Login bem-sucedido!', 
        description: 'Redirecionando para o painel...',
        variant: 'success'
      });
      router.push('/student/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description: error.data?.message || error.message || 'E-mail ou senha inválidos. Verifique suas credenciais.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    
    try {
      await register({
        ...data,
        role: 'student'
      });
      
      toast({ 
        title: 'Conta criada com sucesso!', 
        description: 'Você será redirecionado para o painel.',
        variant: 'success'
      });
      router.push('/student/dashboard');

    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        variant: 'destructive',
        title: 'Falha no cadastro',
        description: error.data?.message || error.message || 'Ocorreu um erro ao criar a conta.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Logo />
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login de Aluno</CardTitle>
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
                      name="nome"
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
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* A escola será associada pelo admin/responsável posteriormente */}
                    {/* <FormField
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
                    /> */}
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
