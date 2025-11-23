
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { getGuardianProfile, linkStudentToGuardian } from '@/lib/services';
import { type GuardianProfile, type User } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, User as UserIcon, Briefcase, DollarSign, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const DependentCard = ({ student }: { student: User }) => {
    const studentSchoolName = (student as any).school?.name || 'Não informada';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${student.name}.png`} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{student.name}</CardTitle>
                    <CardDescription>{student.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Escola: {studentSchoolName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Saldo: <span className="font-bold text-foreground">R$ {student.balance.toFixed(2)}</span></span>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full">Ver Detalhes</Button>
            </CardFooter>
        </Card>
    );
};

const AddDependentDialog = ({ guardianId, onDependentAdded }: { guardianId: string; onDependentAdded: () => void }) => {
    const { toast } = useToast();
    const [studentCode, setStudentCode] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleLinkStudent = async () => {
        if (!studentCode.trim()) {
            toast({ variant: 'destructive', title: 'Código inválido', description: 'Por favor, insira o código do aluno.' });
            return;
        }
        setIsLinking(true);
        try {
            await linkStudentToGuardian(guardianId, studentCode);
            toast({ variant: 'success', title: 'Dependente adicionado!', description: 'O aluno agora está vinculado à sua conta.' });
            onDependentAdded(); // Atualiza a lista na página principal
            setIsOpen(false); // Fecha o diálogo
            setStudentCode('');
        } catch (error: any) {
            console.error("Failed to link student:", error);
            toast({ variant: "destructive", title: "Falha ao vincular aluno", description: error.message || 'Não foi possível adicionar o dependente. Verifique o código e tente novamente.' });
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Dependente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Dependente</DialogTitle>
                    <DialogDescription>
                        Insira o código único do estudante para vinculá-lo à sua conta. Esse código pode ser encontrado no perfil do aluno.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="student-code" className="text-right">Código</Label>
                        <Input 
                            id="student-code" 
                            value={studentCode} 
                            onChange={(e) => setStudentCode(e.target.value.toUpperCase())} 
                            className="col-span-3" 
                            placeholder="Ex: A4B8C2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLinking}>Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleLinkStudent} disabled={isLinking}>
                        {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Vincular Aluno
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function GuardianDependentsPage() {
    const { user, isLoading: isUserLoading } = useAuth();
    const { toast } = useToast();
    const [profile, setProfile] = useState<GuardianProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [key, setKey] = useState(0); // Chave para forçar a re-renderização

    const fetchProfile = async () => {
        if (user?.id) {
            setIsLoading(true);
            try {
                const guardianProfile = await getGuardianProfile(user.id);
                setProfile(guardianProfile);
            } catch (error) {
                console.error("Failed to fetch guardian profile:", error);
                toast({ variant: "destructive", title: "Erro ao buscar perfil", description: "Não foi possível carregar as informações dos dependentes." });
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!isUserLoading && user) {
            fetchProfile();
        }
    }, [user, isUserLoading, toast, key]);

    if (isLoading || isUserLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
                    <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-muted"></div>
                                <div className="space-y-2">
                                    <div className="h-5 w-32 bg-muted rounded"></div>
                                    <div className="h-4 w-40 bg-muted rounded"></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                 <div className="h-4 w-full bg-muted rounded"></div>
                                 <div className="h-4 w-full bg-muted rounded"></div>
                            </CardContent>
                             <CardFooter>
                                <div className="h-10 w-full bg-muted rounded"></div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gerenciar Dependentes</h1>
                    <p className="text-muted-foreground">Visualize e adicione novos dependentes à sua conta.</p>
                </div>
                {user && <AddDependentDialog guardianId={user.id} onDependentAdded={() => setKey(prev => prev + 1)} />}
            </div>

            {profile && profile.students.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {profile.students.map((student) => (
                        <DependentCard key={student.id} student={student} />
                    ))}
                </div>
            ) : (
                <Card className="mt-6">
                    <CardContent className="p-6 text-center">
                        <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">Nenhum dependente encontrado</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Clique em "Adicionar Dependente" para vincular um estudante à sua conta.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
