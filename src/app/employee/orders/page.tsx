
'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { type Order, type OrderItem } from '@/lib/data';
import api from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SortKey = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const variant = {
    'Entregue': 'default',
    'Pendente': 'secondary',
    'Cancelado': 'destructive',
  }[status] || 'default';
  
  const className = {
    'Entregue': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 animate-pulse',
    'Cancelado': 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  }[status]

  return <Badge variant={variant} className={cn('capitalize', className)}>{status.toLowerCase()}</Badge>;
};

const OrderDetailsDialog = ({ order, onRepeatOrder }: { order: Order; onRepeatOrder: (items: OrderItem[]) => void; }) => {
    const [progress, setProgress] = useState(10)
 
    useEffect(() => {
        if (order.status === 'Pendente') {
            const timer = setTimeout(() => setProgress(33), 800)
            return () => clearTimeout(timer)
        }
    }, [order.status]);

    return (
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Detalhes do Pedido {order.id}</DialogTitle>
      <DialogDescription>
        Realizado em {new Date(order.date).toLocaleDateString('pt-BR')}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      {order.status === 'Pendente' && (
        <div className="space-y-2">
            <h4 className="text-sm font-medium">Acompanhamento</h4>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Recebido</span>
                <span>Em preparação</span>
                <span>Pronto</span>
            </div>
            <p className="text-sm text-center text-primary font-medium pt-2">Tempo estimado: 5-10 minutos</p>
        </div>
      )}
      <div className="space-y-2">
         <h4 className="text-sm font-medium">Itens do Pedido</h4>
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Image 
                src={item.product.image.imageUrl} 
                alt={item.product.name} 
                width={40} 
                height={40} 
                className="rounded-md object-cover h-10 w-10"
                data-ai-hint={item.product.image.imageHint}
              />
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x R$ {item.product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="font-medium">
              R$ {(item.quantity * item.product.price).toFixed(2)}
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
    <DialogFooter>
        <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
        </DialogClose>
        <DialogClose asChild>
            <Button onClick={() => onRepeatOrder(order.items)}>Repetir Pedido</Button>
        </DialogClose>
    </DialogFooter>
  </DialogContent>
)};


export default function EmployeeOrdersPage() {
    const { toast } = useToast();
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/pedidos'); // Uses a general endpoint
                setOrderHistory(response.data);
            } catch (error) {
                console.error('Failed to fetch order history:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao buscar pedidos',
                    description: 'Não foi possível carregar seu histórico de pedidos.'
                })
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [toast]);

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


    const handleRepeatOrder = (items: OrderItem[]) => {
        // NOTE: This is a placeholder. In a real app, this would update a shared state (e.g., React Context or Zustand)
        // that manages the cart, and then likely navigate to the dashboard.
        console.log('Repeating order with items:', items);
        toast({
            title: "Pedido repetido!",
            description: `${items.length} tipo(s) de item foram adicionados ao seu carrinho.`,
        });
    };
    
    if (isLoading) {
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
        <h1 className="text-2xl font-bold tracking-tight font-headline">Meus Pedidos</h1>
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
                          <Card className={cn("p-4", order.status === 'Pendente' && 'bg-yellow-50/50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600')}>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <p className="font-bold">{order.id}</p>
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
                                            src={item.product.image.imageUrl} 
                                            alt={item.product.name} 
                                            width={24} 
                                            height={24} 
                                            className="rounded-full object-cover border-2 border-background h-6 w-6" 
                                            data-ai-hint={item.product.image.imageHint}
                                            title={item.product.name}
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
                      <OrderDetailsDialog order={order} onRepeatOrder={handleRepeatOrder} />
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
                            order.status === 'Pendente' && 'bg-yellow-50/50 border-l-4 border-yellow-400 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:hover:bg-yellow-900/30'
                        )}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex -space-x-4">
                            {order.items.slice(0, 3).map((item, index) => (
                                <Image 
                                    key={index}
                                    src={item.product.image.imageUrl} 
                                    alt={item.product.name} 
                                    width={32} 
                                    height={32} 
                                    className="rounded-full object-cover border-2 border-background h-8 w-8" 
                                    data-ai-hint={item.product.image.imageHint}
                                    title={item.product.name}
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
                    <OrderDetailsDialog order={order} onRepeatOrder={handleRepeatOrder} />
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredHistory.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-10">
                <p>Nenhum pedido encontrado para a busca "{searchTerm}".</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
