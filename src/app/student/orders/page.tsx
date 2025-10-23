
'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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
import { orderHistory, type Order, type OrderItem } from '@/lib/data';
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


export default function StudentOrdersPage() {
    const { toast } = useToast();
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredHistory, setFilteredHistory] = useState<Order[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            let processedOrders = [...orderHistory];

            // 1. Filter by search term
            if (searchTerm) {
                processedOrders = processedOrders.filter(order => 
                    order.id.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // 2. Sort the filtered orders
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
            setFilteredHistory(processedOrders);
        }
    }, [sortKey, isClient, searchTerm]);


    const handleRepeatOrder = (items: OrderItem[]) => {
        // NOTE: This is a placeholder. In a real app, this would update a shared state (e.g., React Context or Zustand)
        // that manages the cart, and then likely navigate to the dashboard.
        console.log('Repeating order with items:', items);
        toast({
            title: "Pedido repetido!",
            description: `${items.length} tipo(s) de item foram adicionados ao seu carrinho.`,
        });
    };

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] p-4">Pedido</TableHead>
                  <TableHead className="p-4">Data</TableHead>
                  <TableHead className="p-4 hidden sm:table-cell">Itens</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="text-right p-4">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isClient && filteredHistory.map((order) => (
                  <Dialog key={order.id}>
                    <DialogTrigger asChild>
                       <TableRow className={cn(
                           "cursor-pointer",
                            order.status === 'Pendente' && 'bg-yellow-50/50 border-l-4 border-yellow-400 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:hover:bg-yellow-900/30'
                        )}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="hidden sm:table-cell">
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
                {!isClient && (
                    [...Array(3)].map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                            <TableCell><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                            <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                            <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted rounded w-1/4"></div></TableCell>
                            <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                            <TableCell><div className="h-4 bg-muted rounded w-1/4 ml-auto"></div></TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            {isClient && filteredHistory.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                    <p>Nenhum pedido encontrado para a busca "{searchTerm}".</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
