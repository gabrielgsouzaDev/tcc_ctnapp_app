
import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.

// #region TYPE DEFINITIONS

export type Product = {
  id: string;
  id_cantina?: string; // from backend
  canteenId: string; // derived from id_cantina
  name: string;
  descricao?: string;
  price: number;
  estoque?: number;
  categoria: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
  image: ImagePlaceholder;
  popular?: boolean;
};

export type Canteen = {
  id: string;
  nome: string; // from backend
  name: string; // derived from nome
  id_escola: string; // from backend
  schoolId: string; // derived from id_escola
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: ImagePlaceholder;
};

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  valor_total?: number; // from backend
  status: 'Entregue' | 'Pendente' | 'Cancelado' | 'Em Preparo' | 'Recebido';
  aluno_id?: string; // from backend
  studentId: string; // derived
  responsavel_id?: string; // from backend
  userId: string; // The user who placed the order (student or guardian)
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  origin: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência';
  userId: string; // The user initiating the transaction
  studentId?: string; // studentId is optional as a transaction can be for the guardian
};

export type StudentProfile = {
  id: string;
  nome: string;
  name: string; // derived from nome
  email: string;
  balance: number; // This needs to come from the backend, maybe on the user object
  // Laravel fields
  data_nascimento?: string;
  escola_id?: string;
  schoolId: string;
};

export type GuardianProfile = {
  id: string;
  nome: string;
  name: string; // derived from nome
  email: string;
  telefone?: string;
  balance: number; // This needs to come from the backend, maybe on the user object
  students: StudentProfile[]; // Attached by service
};

export type UserProfile = StudentProfile | GuardianProfile;

export type User = {
    id: string;
    nome: string;
    name: string;
    email: string;
    role: 'student' | 'guardian' | 'admin';
    // profile might not exist on the base user object from laravel
    profile?: StudentProfile | GuardianProfile;
}

export type School = {
  id: string;
  nome: string;
  name: string;
  endereco: string;
  address: string;
};

// #endregion
