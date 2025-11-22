
import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.
// These types reflect the final Laravel database DUMP.

// #region --- ENTITY TYPE DEFINITIONS ---

export type User = {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    data_nascimento: string | null;
    id_escola: number | null;
    id_cantina: number | null;
    ativo: boolean;
    created_at: string;
    updated_at: string;
    // --- Relationships & Frontend Derived Fields ---
    roles: { nome_role: string }[];
    carteira?: Wallet;
    dependentes?: User[]; // For guardians
    // --- Mapped Fields for convenience ---
    name: string; // derived from nome
    role: 'Aluno' | 'Responsavel' | 'Admin' | 'Cantina' | 'Escola';
    balance: number;
    schoolId: number | null; // derived from id_escola
    students: User[]; // Mapped from 'dependentes'
};

export type StudentProfile = User & {
  role: 'Aluno';
};

export type GuardianProfile = User & {
  role: 'Responsavel';
  students: StudentProfile[];
};

export type UserProfile = StudentProfile | GuardianProfile;

export type School = {
  id_escola: number; 
  nome: string;
  cnpj: string | null;
  id_endereco: number | null;
  id_plano: number | null;
  status: 'ativa' | 'inativa' | 'pendente';
  qtd_alunos: number;
  created_at: string;
  updated_at: string;
  // --- Mapped Fields ---
  id: string; // derived from id_escola
  name: string; // derived from nome
};

export type Canteen = {
  id_cantina: number;
  nome: string;
  id_escola: number;
  hr_abertura: string | null;
  hr_fechamento: string | null;
  created_at: string;
  updated_at: string;
  // --- Mapped Fields ---
  id: string; // derived from id_cantina
  name: string; // derived from nome
  schoolId: string; // derived from id_escola
};

export type Product = {
  id_produto: number;
  id_cantina: number; 
  nome: string;
  preco: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // --- Mapped Fields ---
  id: string; // derived from id_produto
  canteenId: string; // derived from id_cantina
  name: string; // derived from nome
  price: number; // derived from preco
  image: ImagePlaceholder;
  popular?: boolean;
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço'; // This needs to be present in the backend model or mapped
};

export type Order = {
  id_pedido: number;
  id_cantina: number;
  id_comprador: number;
  id_destinatario: number;
  valor_total: number;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'entregue';
  created_at: string;
  updated_at: string;
  // --- Relationships & Mapped Fields ---
  items: OrderItem[]; 
  id: string; // from id_pedido
  date: string; // from created_at
  total: number; // from valor_total
  studentId: string; // from id_destinatario
  userId: string; // from id_comprador
  canteenId: string; // from id_cantina
};

export type OrderItem = {
  id_item: number;
  id_pedido: number;
  id_produto: number;
  quantidade: number;
  preco_unitario: number;
  created_at: string;
  updated_at: string;
  // --- Frontend derived/mapped fields ---
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: ImagePlaceholder;
};

export type Transaction = {
  id_transacao: number;
  id_carteira: number;
  id_user_autor: number | null;
  id_aprovador: number | null;
  uuid: string;
  tipo: 'PIX' | 'Recarregar' | 'PagamentoEscola' | 'Debito' | 'Repasse' | 'Estorno';
  valor: number;
  descricao: string | null;
  referencia: string | null;
  status: 'pendente' | 'confirmada' | 'rejeitada';
  created_at: string;
  updated_at: string;
  // --- Mapped Fields ---
  id: string; // from id_transacao
  walletId: string; // from id_carteira
  date: string; // from created_at
  description: string; // from descricao
  amount: number; // from valor
  type: 'credit' | 'debit'; // derived from tipo
  origin: string; // derived from tipo
  userId: string; // derived from id_user_autor
  studentId?: string; // needs to be mapped based on context
};

export type Wallet = {
    id_carteira: number;
    id_user: number;
    saldo: number;
    saldo_bloqueado: number;
    // --- Mapped Fields ---
    id: string; // from id_carteira
    userId: string; // from id_user
    balance: number; // from saldo
}

// #endregion
