
import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.
// These types should reflect the Laravel Models based on the provided DUMP.

// #region TYPE DEFINITIONS

export type Product = {
  id_produto: string;
  id_cantina: string; 
  nome: string;
  preco: number;
  ativo: boolean;
  // --- Frontend derived/mapped fields ---
  id: string; // derived from id_produto
  canteenId: string; // derived from id_cantina
  name: string; // derived from nome
  price: number; // derived from preco
  image: ImagePlaceholder;
  popular?: boolean;
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço'; // This needs to be present in the backend model or mapped
};

export type Canteen = {
  id_cantina: string;
  nome: string;
  id_escola: string;
  // --- Frontend derived/mapped fields ---
  id: string; // derived from id_cantina
  name: string; // derived from nome
  schoolId: string; // derived from id_escola
};

export type OrderItem = {
  id_produto: string;
  quantidade: number;
  preco_unitario: number;
  // --- Frontend derived/mapped fields ---
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: ImagePlaceholder;
};

export type Order = {
  id_pedido: string;
  id_comprador: string; // user who placed the order
  id_destinatario: string; // user who receives the items
  valor_total: number;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'entregue';
  created_at: string;
  // --- Frontend derived/mapped fields ---
  id: string; // from id_pedido
  date: string; // from created_at
  items: OrderItem[]; 
  total: number; // from valor_total
  studentId: string; // from id_destinatario
  userId: string; // from id_comprador
};

export type Transaction = {
  id_transacao: string;
  id_carteira: string;
  tipo: 'PIX' | 'Recarregar' | 'PagamentoEscola' | 'Debito' | 'Repasse' | 'Estorno';
  valor: number;
  descricao: string;
  status: 'pendente' | 'confirmada' | 'rejeitada';
  created_at: string;
  // --- Frontend derived/mapped fields ---
  id: string; // from id_transacao
  walletId: string; // from id_carteira
  date: string; // from created_at
  description: string; // from descricao
  amount: number; // from valor
  type: 'credit' | 'debit'; // derived from tipo
  origin: string; // derived from tipo
  userId: string; // needs to be mapped from user relationship
  studentId?: string; // needs to be mapped from user relationship
};

export type User = {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    data_nascimento: string | null;
    id_escola: string | null;
    roles: { nome_role: string }[]; // from user->roles relationship
    carteira?: Wallet; // from user->carteira relationship
    dependentes?: User[]; // For guardians, from user->dependentes
    // --- Frontend derived/mapped fields ---
    name: string; // derived from nome
    role: 'student' | 'guardian' | 'admin';
    balance: number;
    schoolId: string | null;
    students: User[]; // Mapped from 'dependentes'
};


export type StudentProfile = User & {
  role: 'student';
};

export type GuardianProfile = User & {
  role: 'guardian';
};

export type UserProfile = StudentProfile | GuardianProfile;


export type School = {
  id_escola: string; 
  nome: string;
  // --- Frontend derived/mapped fields ---
  id: string; // derived from id_escola
  name: string; // derived from nome
  address?: string; // from endereco relationship
};

export type Wallet = {
    id_carteira: string;
    id_user: string;
    saldo: number;
    // --- Frontend derived/mapped fields ---
    id: string; // from id_carteira
    userId: string; // from id_user
    balance: number; // from saldo
}
// #endregion
