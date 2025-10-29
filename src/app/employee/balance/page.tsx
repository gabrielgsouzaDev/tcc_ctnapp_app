
'use client';

import { Wallet, CreditCard, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { type Transaction, type UserProfile } from '@/lib/data';
import Link from 'next/link';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getEmployeeProfile, getTransactionsByUser } from '@/lib/services';
import { onSnapshot, query, collection, limit } from 'firebase/firestore';


type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type FilterTypeKey = 'all' | 'credit' | 'debit';
type FilterOriginKey = 'all' | 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência';

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


export default function EmployeeBalancePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [employeeProfile, setEmployeeProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const [filterType, setFilterType] = useState<FilterTypeKey>('all');
    const [filterOrigin, setFilterOrigin] = useState<FilterOriginKey>('all');
    const [rechargeAmount, setRechargeAmount] = useState('');
    
    const canRecharge = true; 

    useEffect(() => {
        if (isUserLoading || !user) {
            if (!isUserLoading) setIsLoading(false);
            return;
        }

        const profileQuery = query(collection(firestore, `users/${user.uid}/userProfiles`), limit(1));
        const unsubscribeProfile = onSnapshot(profileQuery, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                setEmployeeProfile({ id: doc.id, ...doc.data() } as UserProfile);
            } else {
                setEmployeeProfile(null);
            }
            setIsLoading(false); // Stop loading after profile is fetched or not found
        }, (error) => {
            console.error("Error fetching employee profile:", error);
            setIsLoading(false);
        });

        return () => unsubscribeProfile();
    }, [user, isUserLoading, firestore]);
    
    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return getTransactionsByUser(firestore, user.uid);
    }, [firestore, user]);

    const { data: transactionHistory, isLoading: isLoadingTransactions } = useCollection<Transaction>(transactionsQuery);

    const filteredHistory = useMemo(() => {
        if (!transactionHistory) return [];
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
    }, [sortKey, filterType, filterOrigin, transactionHistory]);
    
    const handleAmountSelect = (amount: number) => {
        setRechargeAmount(amount.toString());
    };
    
    const amountValue = Number(rechargeAmount);
    const isButtonDisabled = !amountValue || amountValue <= 0;

    if (isLoading || isUserLoading || isLoadingTransactions) {
        return (
             <div className="space-y-6 animate-pulse">
                <div className="space-y-1">
                    <div className="h-8 w-72 rounded bg-muted"></div>
                    <div className="h-4 w-96 rounded bg-muted"></div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="h-36" />
                    <Card className="h-60" />
                </div>
                
                <Card>
                    <CardHeader className="h-24" />
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full rounded bg-muted"></div>)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!employeeProfile) {
        return (
            <div className="text-center">
                <p className="text-muted-foreground">Não foi possível carregar as informações de saldo.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Saldo e Extrato</h1>
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
                            R$ {employeeProfile.balance.toFixed(2)}
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
                        Defina um valor e pague com PIX para adicionar créditos à sua conta.
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
                        <Link href={`/pix-payment?amount=${amountValue}&targetId=${employeeProfile.id}&targetType=userProfiles&userId=${user?.uid}`} passHref className={cn('block mt-4', isButtonDisabled && 'pointer-events-none opacity-50')}>
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
                                <SelectItem value="Transferência">Transferência</SelectItem>
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
                                {filteredHistory.map((transaction) => (
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
                            </TableBody>
                        </Table>
                    </div>
                    {filteredHistory.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            <p>Nenhuma transação encontrada para os filtros selecionados.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

