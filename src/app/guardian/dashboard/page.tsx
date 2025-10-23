
"use client";

import { CreditCard, User, Wallet, Search, ShoppingBasket, ArrowDown, ArrowUp, Calendar, Filter, Download } from 'lucide-react';
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
import { guardianProfile, orderHistory, transactionHistory, type Order, type OrderItem, type Student, type Transaction } from '@/lib/data';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { StudentFilter } from '@/components/shared/student-filter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [searchTermHistory, setSearchTermHistory] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  
  useEffect(() => {
      setIsClient(true);
  }, []);

  const studentsMap = useMemo(() => {
    const map = new Map<string, Student>();
    guardianProfile.students.forEach(student => {
      map.set(student.id, student);
    });
    return map;
  }, []);

  const filteredOrders = useMemo(() => {
    if (!isClient) return [];
  
    let processedOrders = [...orderHistory];
    
    // Filter by student
    if (selectedStudentId !== 'all') {
      processedOrders = processedOrders.filter(o => selectedStudentId === o.studentId);
    }

    // Filter by search term
    if (searchTermHistory) {
      processedOrders = processedOrders.filter(order => 
        order.id.toLowerCase().includes(searchTermHistory.toLowerCase())
      );
    }
    
    // Sort
    processedOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return processedOrders;
  }, [isClient, searchTermHistory, selectedStudentId]);

   const filteredTransactions = useMemo(() => {
    if (!isClient) return [];

    let processedTransactions = [...transactionHistory];
    
    // For now, linking transactions to students is mocked. Let's assume a studentId property.
    // In a real scenario, you'd need this link in your data.
    const mockStudentTransactions = processedTransactions.map((t, i) => ({
      ...t,
      studentId: guardianProfile.students[i % guardianProfile.students.length].id
    }));
    
    let studentFilteredTxs = mockStudentTransactions;
    if (selectedStudentId !== 'all') {
      studentFilteredTxs = mockStudentTransactions.filter(t => selectedStudentId === t.studentId);
    }

    // Sort
    studentFilteredTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return studentFilteredTxs;
  }, [isClient, selectedStudentId]);

  const dashboardMetrics = useMemo(() => {
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    const ordersInMonth = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === selectedMonth && orderDate.getFullYear() === selectedYear;
    });

    const transactionsInMonth = filteredTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    });
    
    const totalSpent = ordersInMonth.reduce((acc, order) => acc + order.total, 0);
    const totalDeposits = transactionsInMonth
      .filter(tx => tx.type === 'credit')
      .reduce((acc, tx) => acc + tx.amount, 0);
    
    const combinedBalance = selectedStudentId === 'all' 
      ? guardianProfile.students.reduce((acc, s) => acc + s.balance, 0)
      : studentsMap.get(selectedStudentId)?.balance || 0;

    return {
      totalOrders: ordersInMonth.length,
      totalSpent,
      totalDeposits,
      combinedBalance
    }
  }, [filteredOrders, filteredTransactions, selectedStudentId, studentsMap, date]);

  const handleRepeatOrder = (items: OrderItem[]) => {
      console.log("Adding items to cart for repeat order:", items);
      toast({
          title: "Itens no Carrinho!",
          description: `Itens adicionados ao seu carrinho. Vá para 'Fazer Pedido' para finalizar.`,
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Dashboard</h1>
            <p className="text-muted-foreground">Acompanhe os gastos, pedidos e saldos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <StudentFilter
              students={guardianProfile.students}
              selectedStudentId={selectedStudentId}
              onSelectionChange={setSelectedStudentId}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-auto justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM 'de' yyyy", { locale: ptBR }) : <span>Escolha um mês</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  initialFocus
                  captionLayout="dropdown-nav"
                  fromYear={new Date().getFullYear() - 5}
                  toYear={new Date().getFullYear()}
                  classNames={{
                    caption_label: "hidden",
                    vhidden: "hidden",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    month: "space-y-4 p-4",
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_next: "absolute right-1",
                    nav_button_previous: "absolute left-1",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                  }}
                  onMonthChange={setDate} // Allow month navigation to set the date
                />
              </PopoverContent>
            </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos no Mês</CardTitle>
                  <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{dashboardMetrics.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Total de pedidos realizados este mês</p>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                  <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">R$ {dashboardMetrics.totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total gasto em pedidos este mês</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Depositado</CardTitle>
                  <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">R$ {dashboardMetrics.totalDeposits.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Recargas realizadas neste mês</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Combinado</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">R$ {dashboardMetrics.combinedBalance.toFixed(2)}</div>
                   <p className="text-xs text-muted-foreground">
                    {selectedStudentId === 'all' ? 'Soma de todos os alunos' : studentsMap.get(selectedStudentId)?.name}
                   </p>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Alunos Vinculados</CardTitle>
            <CardDescription>Consulte o saldo individual e inicie uma recarga.</CardDescription>
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
                        <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex items-center gap-4">
                                <User className="h-5 w-5 text-primary" />
                                <span className="font-medium">{student.name}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4">
                             <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                  <span className="text-muted-foreground">Saldo Atual:</span>
                                  <span className="font-bold text-lg text-primary flex items-center gap-2">
                                    <Wallet className="h-5 w-5"/>
                                    R$ {student.balance.toFixed(2)}
                                  </span>
                             </div>
                             <Link href="/guardian/recharge" className='w-full sm:w-auto'>
                                <Button className="w-full sm:w-auto">
                                    <CreditCard className="mr-2 h-4 w-4" /> Recarregar Saldo
                                </Button>
                             </Link>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="orders">
        <Card className="bg-card-foreground/5">
        <CardHeader className="p-4 border-b rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <TabsList className="grid w-full grid-cols-2 md:w-auto shrink-0">
                    <TabsTrigger value="orders">Histórico de Pedidos</TabsTrigger>
                    <TabsTrigger value="transactions">Histórico de Transações</TabsTrigger>
                </TabsList>
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por ID do pedido..."
                        className="pl-10 w-full bg-background"
                        value={searchTermHistory}
                        onChange={(e) => setSearchTermHistory(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <TabsContent value="orders" className="m-0">
                <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="p-4">Pedido</TableHead>
                        <TableHead className="p-4">Aluno</TableHead>
                        <TableHead className="p-4">Data</TableHead>
                        <TableHead className="p-4 hidden sm:table-cell">Itens</TableHead>
                        <TableHead className="p-4">Status</TableHead>
                        <TableHead className="text-right p-4">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isClient && filteredOrders.map((order) => (
                        <Dialog key={order.id}>
                            <DialogTrigger asChild>
                            <TableRow className={cn(
                                "cursor-pointer",
                                order.status === 'Pendente' && 'bg-yellow-50/50 border-l-4 border-yellow-400 hover:bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600 dark:hover:bg-yellow-900/30'
                                )}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{studentsMap.get(order.studentId)?.name || 'N/A'}</TableCell>
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
                                <TableRow key={`skeleton-order-${i}`}>
                                    {[...Array(6)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded w-full"></div></TableCell>)}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    </Table>
                    {isClient && filteredOrders.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            {searchTermHistory ? 
                            <p>Nenhum pedido encontrado para a busca "{searchTermHistory}".</p> :
                            <p>Nenhum pedido encontrado para o(s) aluno(s) selecionado(s).</p>
                            }
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="transactions" className="m-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="p-4">Aluno</TableHead>
                                    <TableHead className="w-[120px] p-4 hidden sm:table-cell">Data</TableHead>
                                    <TableHead className="p-4">Descrição</TableHead>
                                    <TableHead className="text-right w-[120px] p-4">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isClient && filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{studentsMap.get((transaction as any).studentId)?.name || 'N/A'}</TableCell>
                                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{transaction.description}</span>
                                                <span className="text-xs text-muted-foreground sm:hidden">
                                                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-semibold",
                                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {transaction.type === 'credit' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isClient && (
                                    [...Array(4)].map((_, i) => (
                                         <TableRow key={`skeleton-tx-${i}`}>
                                            {[...Array(4)].map((_, j) => <TableCell key={j}><div className="h-4 bg-muted rounded w-full"></div></TableCell>)}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {isClient && filteredTransactions.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Nenhuma transação encontrada para os filtros selecionados.</p>
                        </div>
                    )}
            </TabsContent>
        </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

    