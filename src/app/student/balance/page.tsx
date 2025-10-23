
'use client';

import { Wallet, CreditCard, Repeat } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { studentProfile, transactionHistory, type Transaction } from '@/lib/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FilterTypeKey = 'all' | 'credit' | 'debit';
type FilterOriginKey = 'all' | 'Aluno' | 'Responsável' | 'Cantina' | 'PIX';

const quickAmounts = [20, 50, 100];

const TransactionDetailsDialog = ({ transaction }: { transaction: Transaction }) => {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Detalhes da Transação</DialogTitle>
                <DialogDescription>
                    ID da transação: {transaction.id}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Data e Hora</span>
                    <span className="font-medium">{new Date(transaction.date).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Descrição</span>
                    <span className="font-medium text-right">{transaction.description}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Origem</span>
                    <span className="font-medium">{transaction.origin}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'} className={cn(
                        'capitalize',
                        transaction.type === 'credit' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                    )}>
                        {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                    </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                    <span>Valor:</span>
                    <span className={cn(
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    )}>
                        {transaction.type === 'credit' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </span>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Fechar</Button>
                </DialogClose>
                <Button disabled>Gerar Comprovante</Button>
            </DialogFooter>
        </DialogContent>
    )
};


export default function StudentBalancePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [filterType, setFilterType] = useState<FilterTypeKey>('all');
    const [filterOrigin, setFilterOrigin] = useState<FilterOriginKey>('all');
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [isClient, setIsClient] = useState(false);
    
    // For prototype purposes, we assume the student has permission to recharge.
    // In a real app, this would be based on `student.hasGuardian` and `guardian.allowsRecharge`.
    const canRecharge = true; 

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const filteredHistory = useMemo(() => {
        if (!isClient) return [];
        let processedTransactions = [...transactionHistory];

        if (filterType !== 'all') {
            processedTransactions = processedTransactions.filter(t => t.type === filterType);
        }
        
        if (filterOrigin !== 'all') {
            processedTransactions = processedTransactions.filter(t => t.origin === filterOrigin);
        }

        switch (sortKey) {
            case 'date-asc':
                processedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                break;
            case 'amount-desc':
                processedTransactions.sort((a, b) => b.amount - a.amount);
                break;
            case 'amount-asc':
                processedTransactions.sort((a, b) => a.amount - b.amount);
                break;
            case 'date-desc':
            default:
                processedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                break;
        }

        return processedTransactions;
    }, [sortKey, filterType, filterOrigin, isClient]);
    
    const handleAmountSelect = (amount: number) => {
        setRechargeAmount(amount.toString());
    };
    
    const amountValue = Number(rechargeAmount);
    const isButtonDisabled = !amountValue || amountValue <= 0;


    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Saldo e Extrato</h1>
                <p className="text-muted-foreground">
                    Consulte seu saldo atual e o histórico de transações.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-6 w-6"/>
                            <span>Saldo Atual</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">
                            R$ {studentProfile.balance.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                {canRecharge ? (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <CreditCard />
                        Recarregar Saldo
                        </CardTitle>
                        <CardDescription>
                        Defina um valor e pague com PIX.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center gap-2 sm:flex-row">
                            <Label htmlFor="amount" className="text-lg font-semibold sm:mb-0">R$</Label>
                            <Input
                            id="amount"
                            type="number"
                            value={rechargeAmount}
                            onChange={(e) => setRechargeAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-14 flex-1 text-center text-4xl font-bold tracking-tight [appearance:textfield] focus-visible:ring-offset-0 sm:text-left [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map((amount) => (
                            <Button
                                key={amount}
                                variant={Number(rechargeAmount) === amount ? 'default' : 'outline'}
                                onClick={() => handleAmountSelect(amount)}
                            >
                                R$ {amount}
                            </Button>
                            ))}
                        </div>
                        <Link href={`/pix-payment?amount=${amountValue}`} passHref className={cn(isButtonDisabled && 'pointer-events-none opacity-50')}>
                            <Button 
                                className="w-full"
                                disabled={isButtonDisabled}
                            >
                                Pagar com PIX
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                ) : (
                <Card className="flex flex-col items-center justify-center text-center p-6 bg-muted/50">
                    <CardHeader className="p-0">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard />
                            Recarregar Saldo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <p className="text-sm text-muted-foreground">
                            As recargas do seu saldo são gerenciadas pelo seu responsável.
                        </p>
                    </CardContent>
                </Card>
                )}
            </div>


            <Card>
                <CardHeader className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between md:p-6">
                    <h3 className="text-lg font-semibold shrink-0">Histórico de Transações</h3>
                    <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:justify-end">
                        <Select value={filterOrigin} onValueChange={(value) => setFilterOrigin(value as FilterOriginKey)}>
                            <SelectTrigger className="w-full min-w-[150px] bg-background sm:w-auto">
                                <SelectValue placeholder="Filtrar por origem" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toda Origem</SelectItem>
                                <SelectItem value="Aluno">Aluno</SelectItem>
                                <SelectItem value="Responsável">Responsável</SelectItem>
                                <SelectItem value="Cantina">Cantina</SelectItem>
                                <SelectItem value="PIX">PIX</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterTypeKey)}>
                            <SelectTrigger className="w-full min-w-[150px] bg-background sm:w-auto">
                                <SelectValue placeholder="Filtrar por tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os Tipos</SelectItem>
                                <SelectItem value="credit">Créditos</SelectItem>
                                <SelectItem value="debit">Débitos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                            <SelectTrigger className="w-full min-w-[180px] bg-background sm:w-auto">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date-desc">Mais recentes</SelectItem>
                                <SelectItem value="date-asc">Mais antigos</SelectItem>
                                <SelectItem value="amount-desc">Maior valor</SelectItem>
                                <SelectItem value="amount-asc">Menor valor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px] p-4 hidden sm:table-cell">Data</TableHead>
                                    <TableHead className="p-4">Descrição</TableHead>
                                    <TableHead className="text-right w-[120px] p-4">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isClient && filteredHistory.map((transaction) => (
                                    <Dialog key={transaction.id}>
                                        <DialogTrigger asChild>
                                            <TableRow className="cursor-pointer">
                                                <TableCell className="text-muted-foreground hidden sm:table-cell">
                                                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{transaction.description}</span>
                                                        <span className="text-xs text-muted-foreground sm:hidden">
                                                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <Badge variant={transaction.type === 'credit' ? 'default' : 'destructive'} className={cn(
                                                            'capitalize w-fit mt-1 sm:hidden',
                                                            transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            )}>
                                                            {transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-semibold",
                                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                )}>
                                                    {transaction.type === 'credit' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </DialogTrigger>
                                        <TransactionDetailsDialog transaction={transaction} />
                                    </Dialog>
                                ))}
                                {!isClient && (
                                    [...Array(4)].map((_, i) => (
                                        <TableRow key={`skeleton-${i}`}>
                                            <TableCell className="hidden sm:table-cell"><div className="h-4 bg-muted rounded w-3/4"></div></TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                                    <div className="h-3 bg-muted rounded w-1/4 sm:hidden"></div>
                                                </div>
                                            </TableCell>
                                            <TableCell><div className="h-4 bg-muted rounded w-1/4 ml-auto"></div></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {isClient && filteredHistory.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Nenhuma transação encontrada para os filtros selecionados.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

