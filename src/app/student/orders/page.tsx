
'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect, useTransition } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { type Order, type Product } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getOrdersByUser, updateOrderStatus, getProductsByCanteen } from '@/lib/services';
import { useAuth } from '@/lib/auth-provider';
import { useCart } from '@/hooks/use-cart';

type SortKey = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const classNameMap = {
    'entregue': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    'confirmado': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    'em_preparo': 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
    'pronto': 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    'cancelado': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  } as const;
  const statusTextMap = {
    'em_preparo': 'Em Preparo',
    'pendente': 'Pendente',
    'confirmado': 'Confirmado',
    'pronto': 'Pronto para Retirada',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado',
  }

  const className = classNameMap[status] ?? 'default';
  return <Badge variant='secondary' className={cn('capitalize', className)}>{statusTextMap[status]}</Badge>;
};

const OrderDetailsDialog = ({ order, onRepeatOrder, onCancelOrder }: { order: Order; onRepeatOrder: (order: Order) => Promise<void>; onCancelOrder: (orderId: string) => Promise<void>; }) => {
    const [isRepeating, setIsRepeating] = useTransition();

    const handleRepeatClick = () => {
        setIsRepeating(async () => {
            await onRepeatOrder(order);
        });
    }

    return (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Detalhes do Pedido #{order.id.substring(0,6).toUpperCase()}</DialogTitle>
      <DialogDescription>
        Realizado em {new Date(order.date).toLocaleDateString('pt-BR')}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
        <div className="space-y-2">
         <h4 className="text-sm font-medium">Itens do Pedido</h4>
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Image 
                src={item.image?.imageUrl || '/images/default.png'} 
                alt={item.productName} 
                width={40} 
                height={40} 
                className="rounded-md object-cover h-10 w-10"
              />
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x R$ {item.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="font-medium">
              R$ {(item.quantity * item.unitPrice).toFixed(2)}
            </p>
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
        <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Fechar</Button>
        </DialogClose>
        <div className="flex flex-col-reverse sm:flex-row sm:gap-2 w-full sm:w-auto">
            {order.status === 'pendente' && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full sm:w-auto"><X className="mr-2 h-4 w-4" />Cancelar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle>
                            <AlertDialogDescription>
                                Você tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita e o valor será estornado para sua carteira.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onCancelOrder(order.id)}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button onClick={handleRepeatClick} className="w-full sm:w-auto" disabled={isRepeating}>
                {isRepeating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isRepeating ? 'Adicionando...' : 'Repetir Pedido'}
            </Button>
        </div>
    </DialogFooter>
  </DialogContent>
)};


export default function StudentOrdersPage() {
    const { toast } = useToast();
    const { user, isLoading: isUserLoading } = useAuth();
    const { addItem } = useCart();
    
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.id) {
                setIsLoading(true);
                try {
                  const orders = await getOrdersByUser(user.id);
                  setOrderHistory(orders);
                } catch (error) {
                  console.error("Failed to fetch orders", error);
                  toast({ variant: 'destructive', title: 'Erro ao buscar pedidos.' });
                }
                setIsLoading(false);
            }
        };

        if (!isUserLoading && user) {
            fetchOrders();
        }
    }, [user, isUserLoading, toast]);

    const filteredHistory = useMemo(() => {
        let processedOrders = [...orderHistory];

        if (searchTerm) {
            processedOrders = processedOrders.filter(order => 
                order.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        switch (sortKey) {
            case 'date-asc':
                processedOrders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                break;
            case 'total-desc':
                processedOrders.sort((a, b) => b.total - a.total);
                break;
            case 'total-asc':
                processedOrders.sort((a, b) => a.total - b.total);
                break;
            case 'date-desc':
            default:
                processedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
        }
        return processedOrders;
    }, [sortKey, searchTerm, orderHistory]);

    const handleRepeatOrder = async (order: Order) => {
        try {
            const currentProducts = await getProductsByCanteen(order.canteenId);
            const productsMap = new Map(currentProducts.map(p => [p.id, p]));

            let itemsAdded = 0;
            let itemsUnavailable = 0;

            for (const orderItem of order.items) {
                const product = productsMap.get(orderItem.productId);
                if (product && product.ativo) {
                    addItem(product, orderItem.quantity);
                    itemsAdded++;
                } else {
                    itemsUnavailable++;
                }
            }

            if (itemsAdded > 0) {
                toast({
                    title: "Itens adicionados!",
                    description: `${itemsAdded} tipo(s) de item foram adicionados ao seu carrinho.`,
                    variant: "success"
                });
            }
            if (itemsUnavailable > 0) {
                toast({
                    title: "Alguns itens não estão disponíveis",
                    description: `${itemsUnavailable} produto(s) do seu pedido antigo não estão mais disponíveis e não foram adicionados.`,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Failed to repeat order:", error);
            toast({
                title: "Erro ao repetir pedido",
                description: "Não foi possível buscar as informações dos produtos. Tente novamente.",
                variant: "destructive"
            });
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, 'cancelado');
            setOrderHistory(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            toast({
                title: "Pedido Cancelado",
                description: "Seu pedido foi cancelado com sucesso e o valor estornado.",
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
            <div className="space-y-6">
                <div>
                    <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-64 mt-2 animate-pulse"></div>
                </div>
                <Card>
                    <CardHeader className="p-4 md:p-6 rounded-t-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">
                            <div className="h-10 bg-muted rounded flex-1"></div>
                            <div className="h-10 bg-muted rounded w-full md:w-[180px]"></div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Itens</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={`skeleton-row-${i}`} className="animate-pulse">
                                            <TableCell><div className="h-4 bg-muted rounded w-20"></div></TableCell>
                                            <TableCell><div className="h-4 bg-muted rounded w-24"></div></TableCell>
                                            <TableCell><div className="h-8 w-20 bg-muted rounded-full"></div></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-muted rounded-full"></div></TableCell>
                                            <TableCell className="text-right"><div className="h-4 bg-muted rounded w-16 ml-auto"></div></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meus Pedidos</h1>
        <p className="text-muted-foreground">
          Veja aqui o histórico de todos os seus pedidos.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-card-foreground/5 border-b p-4 md:p-6 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por ID do pedido..."
                        className="pl-10 w-full bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                    <SelectTrigger className="w-full md:w-auto min-w-[180px] bg-background">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-desc">Mais recentes</SelectItem>
                        <SelectItem value="date-asc">Mais antigos</SelectItem>
                        <SelectItem value="total-desc">Maior valor</SelectItem>
                        <SelectItem value="total-asc">Menor valor</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden space-y-4 p-4">
              {filteredHistory.map((order) => (
                  <Dialog key={`mobile-${order.id}`}>
                      <DialogTrigger asChild>
                          <Card className={cn("p-4", order.status === 'pendente' && 'bg-yellow-50/50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600')}>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold">#{order.id.substring(0, 6).toUpperCase()}</p>
                                      <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                                  </div>
                                  <OrderStatusBadge status={order.status} />
                              </div>
                              <Separator className="my-2"/>
                              <div className="flex justify-between items-center">
                                  <div className="flex -space-x-4">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <Image 
                                            key={index}
                                            src={item.image?.imageUrl || '/images/default.png'} 
                                            alt={item.productName} 
                                            width={24} 
                                            height={24} 
                                            className="rounded-full object-cover border-2 border-background h-6 w-6" 
                                            title={item.productName}
                                        />
                                    ))}
                                     {order.items.length > 3 && (
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium border-2 border-background">
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                  </div>
                                  <p className="font-bold text-lg">R$ {order.total.toFixed(2)}</p>
                              </div>
                          </Card>
                      </DialogTrigger>
                      <OrderDetailsDialog order={order} onRepeatOrder={handleRepeatOrder} onCancelOrder={handleCancelOrder} />
                  </Dialog>
              ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((order) => (
                  <Dialog key={order.id}>
                    <DialogTrigger asChild>
                       <TableRow className={cn(
                           "cursor-pointer",
                            order.status === 'pendente' && 'bg-yellow-50/50 border-l-4 border-yellow-400 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:hover:bg-yellow-900/30'
                        )}>
                        <TableCell className="font-medium">#{order.id.substring(0, 6).toUpperCase()}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-4">
                            {order.items.slice(0, 3).map((item, index) => (
                                <Image 
                                    key={index}
                                    src={item.image?.imageUrl || '/images/default.png'} 
                                    alt={item.productName} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full object-cover border-2 border-background h-8 w-8" 
                                    title={item.productName}
                                />
                            ))}
                             {order.items.length > 3 && (
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
                                    +{order.items.length - 3}
                                </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">R$ {order.total.toFixed(2)}</TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <OrderDetailsDialog order={order} onRepeatOrder={handleRepeatOrder} onCancelOrder={handleCancelOrder} />
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredHistory.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-10">
                <p>Nenhum pedido encontrado.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
