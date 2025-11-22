'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/shared/logo';
import { useAuth } from '@/lib/auth-provider';

// Schema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'), // Alterado para min 1, senha não pode ser vazia
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // Usando apenas o login do hook de autenticação
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Função executada ao submeter o formulário de login
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Tentativa de login com as credenciais fornecidas
      await login(data.email, data.password);
      
      toast({ 
        title: 'Login bem-sucedido!', 
        description: 'Redirecionando para o painel...',
        variant: 'success'
      });

      // Redireciona para o dashboard do aluno, conforme solicitado
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <Logo />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login de Funcionário</CardTitle>
            <CardDescription>Acesse a área administrativa com suas credenciais.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
