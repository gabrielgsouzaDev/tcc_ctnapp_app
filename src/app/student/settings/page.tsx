
'use client';

import { Bell, Brush, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function StudentSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as preferências da sua conta e do aplicativo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell />
            Notificações
          </CardTitle>
          <CardDescription>
            Escolha como você deseja ser notificado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-app" className="text-base">Notificações no app</Label>
              <p className="text-sm text-muted-foreground">
                Receba alertas sobre o status do seu pedido.
              </p>
            </div>
            <Switch id="notifications-app" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-email" className="text-base">Notificações por E-mail</Label>
              <p className="text-sm text-muted-foreground">
                Receba um resumo diário e promoções.
              </p>
            </div>
            <Switch id="notifications-email" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="theme" className="text-base">Tema Escuro</Label>
              <p className="text-sm text-muted-foreground">
                Ative o modo escuro para uma visualização mais confortável à noite.
              </p>
            </div>
            {/* O controle real do tema (dark/light) normalmente seria gerenciado por um provider de tema (ex: next-themes) */}
            <Switch id="theme" disabled /> 
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie as configurações de segurança da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 mb-2 sm:mb-0">
              <Label className="text-base">Alterar Senha</Label>
              <p className="text-sm text-muted-foreground">
                Recomendamos alterar sua senha periodicamente.
              </p>
            </div>
            <Button variant="outline">Alterar Senha</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

