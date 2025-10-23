'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { useUser } from '@/firebase';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export default function AlunoAuthPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/student/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    initiateEmailSignIn(auth, data.email, data.password);
    toast({ title: 'Entrando...', description: 'Aguarde um momento.' });
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
          <p className="text-muted-foreground">Acesso do Aluno.</p>
        </div>
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Área do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="aluno@email.com" {...field} />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
