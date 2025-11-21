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
  id_cantina: string;
  id: string; // derived from id_cantina
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
  data: string; // from backend
  date: string; // derived from data
  descricao: string;
  description: string; // derived from descricao
  valor: number;
  amount: number; // derived from valor
  tipo: 'credito' | 'debito';
  type: 'credit' | 'debit'; // derived from tipo
  origem: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência';
  origin: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência'; // derived from origem
  user_id: string;
  userId: string; // derived from user_id
  studentId?: string; 
};

export type User = {
    id: string;
    nome: string; 
    name: string; // derived from nome
    email: string;
    role: 'student' | 'guardian' | 'admin';
    // Profile-specific data
    data_nascimento?: string;
    telefone?: string;
    balance?: number; // Should come from a wallet endpoint
    id_escola?: string;
    schoolId?: string; // derived from id_escola
    ra?: string;
    students?: User[]; // For guardians
};


export type StudentProfile = User & {
  role: 'student';
};

export type GuardianProfile = User & {
  role: 'guardian';
  students: StudentProfile[];
};

export type UserProfile = StudentProfile | GuardianProfile;


export type School = {
  id_escola: string; 
  id: string; // derived from id_escola
  nome: string;
  name: string; // derived from nome
  endereco?: string;
  address?: string; // derived from endereco
};

// #endregion
