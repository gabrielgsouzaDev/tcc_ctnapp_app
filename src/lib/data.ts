import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.
// These types should reflect the Laravel Models.

// #region TYPE DEFINITIONS

export type Product = {
  id: string; // id_produto from backend
  id_cantina: string; 
  canteenId: string; // derived from id_cantina
  nome: string;
  name: string; // derived from nome
  descricao?: string;
  preco: number;
  price: number; // derived from preco
  estoque?: number;
  categoria: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço'; // derived from categoria
  image: ImagePlaceholder; // Mapped client-side
  popular?: boolean; // Mapped client-side
};

export type Canteen = {
  id: string; // id_cantina from backend
  nome: string;
  name: string; // derived from nome
  id_escola: string;
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
  items: OrderItem[]; // This is constructed on the client from the pivot table relationship
  total: number;
  valor_total?: number; // from backend
  status: 'Entregue' | 'Pendente' | 'Cancelado' | 'Em Preparo' | 'Recebido';
  aluno_id?: string; 
  studentId: string; // derived from aluno_id
  responsavel_id?: string;
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
  data_nascimento?: string;
  id_escola?: string; // from backend
  schoolId: string; // derived from id_escola
  ra?: string; // Registration number
};

export type GuardianProfile = {
  id: string;
  nome: string;
  name: string; // derived from nome
  email: string;
  telefone?: string;
  balance: number; // This needs to come from the backend
  students: StudentProfile[]; // Attached by service
};

export type UserProfile = StudentProfile | GuardianProfile;

export type User = {
    id: string;
    nome: string; // from backend
    name: string; // derived from nome
    email: string;
    role: 'student' | 'guardian' | 'admin';
    // profile might not exist on the base user object from laravel
    profile?: StudentProfile | GuardianProfile;
}

export type School = {
  id: string; // id_escola from backend
  nome: string;
  name: string; // derived from nome
  endereco?: string;
  address?: string; // derived from endereco
};

// #endregion
