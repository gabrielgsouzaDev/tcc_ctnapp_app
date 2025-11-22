
import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.
// These types should reflect the Laravel Models.

// #region TYPE DEFINITIONS

export type Product = {
  id_produto: string;
  id: string; // derived
  id_cantina: string; 
  canteenId: string; // derived from id_cantina
  nome: string;
  name: string; // derived from nome
  preco: number;
  price: number; // derived from preco
  ativo: boolean;
  image: ImagePlaceholder; // Mapped client-side
  popular?: boolean; // Mapped client-side
  categoria: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço'; // This needs to be present in the backend model or mapped
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
  id: string; // id_pedido
  date: string;
  items: OrderItem[]; // This is constructed on the client from the pivot table relationship
  valor_total: number;
  total: number; // derived
  status: 'Entregue' | 'Pendente' | 'Cancelado' | 'Em Preparo' | 'Recebido';
  aluno_id?: string; 
  studentId: string; // derived from aluno_id
  responsavel_id?: string;
  userId: string; // The user who placed the order (student or guardian)
};

export type Transaction = {
  id: string; // id_transacao
  data_transacao: string; // from backend
  date: string; // derived from data_transacao
  descricao: string;
  description: string; // derived from descricao
  valor: number;
  amount: number; // derived from valor
  tipo: 'credito' | 'debito';
  type: 'credit' | 'debit'; // derived from tipo
  origem: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência'; // Example, should match backend enum/string
  origin: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência'; // derived from origem
  id_carteira: string;
  walletId: string; // derived
  userId: string; // derived from wallet
  studentId?: string; // derived from wallet
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

export type Wallet = {
    id_carteira: string;
    id: string; // derived
    id_user: string;
    user_id: string; // derived
    saldo: number;
    balance: number; // derived
}
// #endregion

