
"use client";

import { CreditCard, User, Wallet, Search, ShoppingBasket } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { guardianProfile, orderHistory, type Order, type OrderItem, type Student } from '@/lib/data';
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';


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
        <Link href="/guardian/order">
          <Button onClick={() => onRepeatOrder(order.items)}>Repetir Pedido</Button>
        </Link>
    </DialogFooter>
  </DialogContent>
)};


export default function GuardianDashboard() {
  const { toast } = useToast();
  const [activeStudentAccordion, setActiveStudentAccordion] = useState<string | undefined>(guardianProfile.students[0]?.id);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [searchTermHistory, setSearchTermHistory] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
      setIsClient(true);
  }, []);

  const handleRecharge = (e: React.FormEvent, studentName: string) => {
    e.preventDefault();
    const amount = (e.currentTarget as HTMLFormElement).amount.value;
    if (amount && Number(amount) > 0) {
      toast({
        title: "Recarga em processamento!",
        description: `O valor de R$ ${Number(amount).toFixed(2)} será adicionado em breve para ${studentName}.`,
      });
      (e.currentTarget as HTMLFormElement).reset();
    } else {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "Por favor, insira um valor positivo para a recarga.",
      });
    }
  };

  const studentsMap = useMemo(() => {
    const map = new Map<string, string>();
    guardianProfile.students.forEach(student => {
      map.set(student.id, student.name);
    });
    return map;
  }, []);

  const filteredHistory = useMemo(() => {
    if (!isClient) return [];
  
    let processedOrders = [...orderHistory];

    if (selectedStudentFilter !== 'all') {
      processedOrders = processedOrders.filter(o => o.studentId === selectedStudentFilter);
    }

    if (searchTermHistory) {
      processedOrders = processedOrders.filter(order => 
        order.id.toLowerCase().includes(searchTermHistory.toLowerCase())
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
  }, [sortKey, isClient, searchTermHistory, selectedStudentFilter]);

  const handleRepeatOrder = (items: OrderItem[]) => {
      // NOTE: This is a placeholder for future state management.
      // In a real app, this would likely update a shared cart state (e.g. via Context or Zustand)
      // and then navigate to the ordering page.
      console.log("Adding items to cart for repeat order:", items);
      toast({
          title: "Itens no Carrinho!",
          description: `Itens adicionados ao seu carrinho. Vá para 'Fazer Pedido' para finalizar.`,
      });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight font-headline">Painel do Responsável</h1>
      
      <Card>
        <CardHeader>
            <CardTitle>Alunos Vinculados</CardTitle>
            <CardDescription>Selecione um aluno para ver os detalhes e gerenciar o saldo.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion 
              type="single" 
              collapsible 
              defaultValue={activeStudentAccordion} 
              onValueChange={(value) => setActiveStudentAccordion(value)}
              className="space-y-2"
            >
                {guardianProfile.students.map((student: Student) => (
                    <AccordionItem value={student.id} key={student.id} className="border-b-0 rounded-lg bg-background">
                        <AccordionTrigger className="p-4">
                            <div className="flex items-center gap-4">
                                <User />
                                <span className="font-medium">{student.name}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="grid gap-6 lg:grid-cols-2 p-4 border-t">
                             <div className="space-y-4">
                                <h3 className="font-semibold">Informações</h3>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Saldo Atual</span>
                                  <span className="font-bold text-lg text-primary flex items-center gap-2">
                                    <Wallet />
                                    R$ {student.balance.toFixed(2)}
                                  </span>
                                </div>
                             </div>
                             
                             <div>
                                <h3 className="font-semibold">Recarregar Saldo</h3>
                                 <form className="space-y-4 mt-2" onSubmit={(e) => handleRecharge(e, student.name)}>
                                    <div className="space-y-2">
                                        <Label htmlFor={`amount-${student.id}`}>Valor da Recarga (R$)</Label>
                                        <Input id={`amount-${student.id}`} name="amount" type="number" placeholder="ex: 50.00" step="0.01" min="1" className="bg-white dark:bg-muted" />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <CreditCard className="mr-2 h-4 w-4" /> Recarregar para {student.name.split(' ')[0]}
                                    </Button>
                                </form>
                             </div>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <div>
            <h2 className="text-xl font-bold tracking-tight font-headline flex items-center gap-2">
              <ShoppingBasket />
              Histórico de Pedidos
            </h2>
            <p className="text-muted-foreground">
            Acompanhe o histórico de pedidos de todos os alunos vinculados.
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
                            value={searchTermHistory}
                            onChange={(e) => setSearchTermHistory(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select value={selectedStudentFilter} onValueChange={setSelectedStudentFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[180px] bg-background">
                                <SelectValue placeholder="Filtrar por aluno" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Alunos</SelectItem>
                                {guardianProfile.students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[180px] bg-background">
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
                </div>
            </CardHeader>
            <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="p-4">Pedido</TableHead>
                    <TableHead className="p-4">Aluno</TableHead>
                    <TableHead className="p-4">Data</TableHead>
                    <TableHead className="p-4">Itens</TableHead>
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
                            <TableCell>{studentsMap.get(order.studentId) || 'N/A'}</TableCell>
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
                    {!isClient && (
                        [...Array(3)].map((_, i) => (
                            <TableRow key={`skeleton-${i}`}>
                                <TableCell><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                                <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                                <TableCell><div className="h-4 bg-muted rounded w-1/4"></div></TableCell>
                                <TableCell><div className="h-4 bg-muted rounded w-1/2"></div></TableCell>
                                <TableCell><div className="h-4 bg-muted rounded w-1/4"></div></TableCell>
                                <TableCell><div className="h-4 bg-muted rounded w-1/4 ml-auto"></div></TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
                </Table>
                {isClient && filteredHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        {searchTermHistory ? 
                          <p>Nenhum pedido encontrado para a busca "{searchTermHistory}".</p> :
                          <p>Nenhum pedido encontrado para o aluno selecionado.</p>
                        }
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
