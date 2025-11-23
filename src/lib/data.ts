
import type { ImagePlaceholder } from './placeholder-images';

// =============================================================================
// TYPE DEFINITIONS - FRONTEND DOMAIN
//
// Este arquivo contém as definições de tipo para a aplicação frontend.
// Estes tipos representam a ESTRUTURA FINAL dos dados após serem mapeados
// do backend. Eles são a "única fonte da verdade" para os componentes React.
//
// ✅ PRINCÍPIO: Não incluir campos brutos do backend (ex: id_escola, nome_role).
// A camada de mapeamento em 'services.ts' é a única responsável por essa tradução.
// =============================================================================


// #region --- USER & AUTH TYPES ---

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Aluno' | 'Responsavel' | 'Admin' | 'Cantina' | 'Escola';
  balance: number;
  schoolId: string | null;
  canteenId: string | null;
  students: User[]; // Para responsáveis, contém a lista de alunos dependentes
  telefone: string | null;
  data_nascimento: string | null;
  ativo: boolean;
};

export type StudentProfile = User & {
  role: 'Aluno';
};

export type GuardianProfile = User & {
  role: 'Responsavel';
  students: StudentProfile[];
};

export type UserProfile = StudentProfile | GuardianProfile;

// #endregion


// #region --- CORE ENTITY TYPES ---

export type School = {
  id: string; // Mapeado de id_escola
  name: string; // Mapeado de nome
  cnpj: string | null;
  status: 'ativa' | 'inativa' | 'pendente';
  qtd_alunos: number;
};

export type Canteen = {
  id: string; // Mapeado de id_cantina
  name: string; // Mapeado de nome
  schoolId: string; // Mapeado de id_escola
  hr_abertura: string | null;
  hr_fechamento: string | null;
};

export type Product = {
  id: string; // Mapeado de id_produto
  canteenId: string; // Mapeado de id_cantina
  name: string; // Mapeado de nome
  price: number; // Mapeado de preco
  image: ImagePlaceholder;
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
  popular?: boolean;
  ativo: boolean;
};

export type Order = {
  id: string; // Mapeado de id_pedido
  studentId: string; // Mapeado de id_destinatario
  userId: string; // Mapeado de id_comprador
  canteenId: string; // Mapeado de id_cantina
  total: number; // Mapeado de valor_total
  date: string; // Mapeado de created_at
  status: 'pendente' | 'confirmado' | 'cancelado' | 'entregue';
  items: OrderItem[]; 
};

export type OrderItem = {
  productId: string; // Mapeado de id_produto
  productName: string; // Mapeado de produto.nome
  quantity: number; // Mapeado de quantidade
  unitPrice: number; // Mapeado de preco_unitario
  image: ImagePlaceholder;
};

export type Transaction = {
  id: string; // Mapeado de id_transacao
  walletId: string; // Mapeado de id_carteira
  userId: string; // Mapeado de id_user_autor
  date: string; // Mapeado de created_at
  description: string; // Mapeado de descricao
  amount: number; // Mapeado de valor
  type: 'credit' | 'debit'; // Derivado de tipo
  origin: 'PIX' | 'Recarregar' | 'PagamentoEscola' | 'Debito' | 'Repasse' | 'Estorno'; // Mapeado de tipo
  status: 'pendente' | 'confirmada' | 'rejeitada';
};

export type Wallet = {
    id: string; // Mapeado de id_carteira
    userId: string; // Mapeado de id_user
    balance: number; // Mapeado de saldo
}

// #endregion
