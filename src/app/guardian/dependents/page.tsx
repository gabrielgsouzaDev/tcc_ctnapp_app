
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { getGuardianProfile, linkStudentToGuardian } from '@/lib/services';
import { type GuardianProfile, type StudentLite } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, User as UserIcon, Briefcase, DollarSign, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// -------------------------
// CARD DO DEPENDENTE
// -------------------------

const DependentCard = ({ student }: { student: StudentLite }) => {
  const schoolName = student.school?.name ?? 'Não informada';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`https://avatar.vercel.sh/${student.name}.png`} alt={student.name} />
          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div>
          <CardTitle>{student.name}</CardTitle>
          <CardDescription>Estudante</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>Escola: {schoolName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span>
            Saldo: <span className="font-bold text-foreground">R$ {student.balance.toFixed(2)}</span>
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};

// -------------------------
// DIALOG — ADICIONAR DEPENDENTE
// -------------------------

const AddDependentDialog = ({
  onDependentAdded
}: {
  onDependentAdded: () => void;
}) => {
  const { toast } = useToast();
  const [studentCode, setStudentCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkStudent = async () => {
    if (!studentCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Digite o código do estudante.'
      });
      return;
    }

    setIsLinking(true);

    try {
      await linkStudentToGuardian(studentCode);

      toast({
        variant: 'success',
        title: 'Dependente adicionado!',
        description: 'O aluno foi vinculado com sucesso.'
      });

      onDependentAdded();
      setIsOpen(false);
      setStudentCode('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao vincular aluno',
        description: error.message || 'Código incorreto.'
      });
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
          <DialogTitle>Adicionar Dependente</DialogTitle>
          <DialogDescription>Digite o código único do aluno.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student-code" className="text-right">
              Código
            </Label>
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
            <Button variant="outline" disabled={isLinking}>
              Cancelar
            </Button>
          </DialogClose>

          <Button onClick={handleLinkStudent} disabled={isLinking}>
            {isLinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -------------------------
// PÁGINA PRINCIPAL
// -------------------------

export default function GuardianDependentsPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const fetchProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const guardianProfile = await getGuardianProfile(user.id);
      setProfile(guardianProfile);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dependentes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && user) {
      fetchProfile();
    }
  }, [user, isUserLoading, key]);

  if (isLoading || isUserLoading) {
    return <div className="space-y-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Dependentes</h1>
          <p className="text-muted-foreground">Visualize e vincule alunos à sua conta.</p>
        </div>

        {user && (
          <AddDependentDialog onDependentAdded={() => setKey((v) => v + 1)} />
        )}
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
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em "Adicionar Dependente" para vincular um aluno.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
