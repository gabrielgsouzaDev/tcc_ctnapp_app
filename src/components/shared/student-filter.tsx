
"use client";

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge";
import { Student } from "@/lib/data";
import { useState } from "react";

type StudentFilterProps = {
    students: Student[];
    selectedStudentIds: string[];
    onSelectionChange: (ids: string[]) => void;
};

export function StudentFilter({ students, selectedStudentIds, onSelectionChange }: StudentFilterProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (studentId: string) => {
    const newSelection = selectedStudentIds.includes(studentId)
      ? selectedStudentIds.filter((id) => id !== studentId)
      : [...selectedStudentIds, studentId];
    onSelectionChange(newSelection);
  };

  const selectedStudentsText = () => {
    if (selectedStudentIds.length === 0) return "Todos os Alunos";
    if (selectedStudentIds.length === students.length) return "Todos os Alunos";
    if (selectedStudentIds.length === 1) {
      return students.find(s => s.id === selectedStudentIds[0])?.name || '1 Aluno';
    }
    return `${selectedStudentIds.length} Alunos Selecionados`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between sm:w-[200px] lg:w-[250px]"
        >
          <span className="truncate">
            {selectedStudentsText()}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Buscar aluno..." />
          <CommandList>
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.name}
                  onSelect={() => {
                    handleSelect(student.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStudentIds.includes(student.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {student.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
