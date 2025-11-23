
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
// ✅ CORREÇÃO: Importando 'User' e removendo referências desnecessárias a 'StudentProfile'
import { type Order, type GuardianProfile, type User } from '@/lib/data';
import { useAuth } from '@/lib/auth-provider';
import { getGuardianProfile, getOrdersByGuardian, updateOrderStatus } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const classNameMap = {
    'entregue': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    'confirmado': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'cancelado': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  } as const;
  const className = classNameMap[status];
  return <Badge variant={classNameMap[status] ? 'secondary' : 'default'} className={cn('capitalize', className)}>{status}</Badge>;
};

const OrderDetailsDialog = ({ order, studentName, onCancelOrder }: { order: Order; studentName: string; onCancelOrder: (orderId: string) => void; }) => {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Pedido de {studentName}</DialogTitle>
                <DialogDescription>ID: #{order.id.substring(0, 6).toUpperCase()} | Data: {new Date(order.date).toLocaleDateString('pt-BR')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Itens do Pedido</h4>
                    {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image src={item.image.imageUrl} alt={item.productName} width={40} height={40} className="rounded-md object-cover h-10 w-10" data-ai-hint={item.image.imageHint} />
                                <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">{item.quantity} x R$ {item.unitPrice.toFixed(2)}</p>
                                </div>
                            </div>
                            <p className="font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto">Fechar</Button></DialogClose>
                
                {order.status === 'pendente' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Cancelar Pedido</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Você tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita e o valor será estornado para a carteira do aluno.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onCancelOrder(order.id)}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </DialogFooter>
        </DialogContent>
    );
};

export default function GuardianDashboardPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const guardianProfile = await getGuardianProfile(user.id);
          setProfile(guardianProfile);
          if (guardianProfile && guardianProfile.students.length > 0) {
            const studentIds = guardianProfile.students.map(s => s.id);
            const studentOrders = await getOrdersByGuardian(studentIds);
            studentOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(studentOrders);
          }
        } catch (error) {
          console.error("Failed to fetch guardian data:", error);
          toast({ variant: "destructive", title: "Erro ao buscar dados", description: "Não foi possível carregar as informações." });
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (!isUserLoading) {
      fetchData();
    }
  }, [user, isUserLoading, toast]);

  const studentsMap = useMemo(() => {
      // ✅ CORREÇÃO: O mapa agora armazena 'User', que é o tipo correto.
      const map = new Map<string, User>();
      profile?.students.forEach(student => map.set(student.id, student));
      return map;
  }, [profile]);

  const handleCancelOrder = async (orderId: string) => {
      try {
          const updatedOrder = await updateOrderStatus(orderId, 'cancelado');
          setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
          toast({
              title: "Pedido Cancelado",
              description: "O pedido foi cancelado com sucesso e o valor estornado.",
              variant: "success"
          });
      } catch (error) {
          console.error("Failed to cancel order:", error);
          toast({
              title: "Falha ao Cancelar",
              description: "Não foi possível cancelar o pedido. Tente novamente.",
              variant: "destructive"
          });
      }
  };

  if (isLoading || isUserLoading) {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-8 bg-muted rounded w-64 mb-2"></div>
                <div className="h-4 bg-muted rounded w-80"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium"><div className="h-5 bg-muted rounded w-32"></div></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-48 mb-1"></div>
                            <div className="h-4 bg-muted rounded w-40"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader><CardTitle><div className="h-6 bg-muted rounded w-40"></div></CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded w-full"></div>)}
                    </div>
                </CardContent>
            </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel do Responsável</h1>
        <p className="text-muted-foreground">Bem-vindo, {profile?.name}! Gerencie seus dependentes e acompanhe os pedidos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile?.students.map(student => (
              <Card key={student.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Saldo de {student.name.split(' ')[0]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold" style={{color: '#FC5407'}}>R$ {student.balance.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">em {new Date().toLocaleDateString('pt-BR')}</p>
                  </CardContent>
              </Card>
          ))}
          {profile?.students.length === 0 && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground">Você ainda não tem dependentes cadastrados.</p>
                </CardContent>
              </Card>
          )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos dos Dependentes</CardTitle>
          <CardDescription>Acompanhe todos os pedidos feitos por seus dependentes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {orders.map((order) => (
                        <Dialog key={order.id}>
                            <DialogTrigger asChild>
                                <TableRow className="cursor-pointer">
                                    <TableCell className="font-medium">{studentsMap.get(order.studentId)?.name || '-'}</TableCell>
                                    <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {order.items.slice(0, 3).map((item, index) => (
                                                <Image key={index} src={item.image.imageUrl} alt={item.productName} width={24} height={24} className="rounded-full border-2 border-background h-6 w-6" />
                                            ))}
                                            {order.items.length > 3 && <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">+{order.items.length-3}</div>}
                                        </div>
                                    </TableCell>
                                    <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                                    <TableCell className="text-right font-semibold">R$ {order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            </DialogTrigger>
                            <OrderDetailsDialog order={order} studentName={studentsMap.get(order.studentId)?.name || 'Desconhecido'} onCancelOrder={handleCancelOrder} />
                        </Dialog>
                    ))}
                    </TableBody>
                </Table>
            </div>
          {orders.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-10">
                <p>Nenhum pedido encontrado para seus dependentes.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
