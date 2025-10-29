
"use client";

import { UserProfile } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StudentFilterProps = {
    students: UserProfile[];
    selectedStudentId: string;
    onSelectionChange: (id: string) => void;
};

export function StudentFilter({ students, selectedStudentId, onSelectionChange }: StudentFilterProps) {
  return (
    <Select value={selectedStudentId} onValueChange={onSelectionChange}>
        <SelectTrigger className="w-full sm:w-[200px] lg:w-[250px]">
            <SelectValue placeholder="Selecione um aluno" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">Todos os Alunos</SelectItem>
            {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                    {student.name}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
  )
}
