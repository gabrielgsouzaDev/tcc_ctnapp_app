// ======================================================
// DATA TYPES — Alinhados com Laravel e services.ts
// ======================================================

// -------------------------
// IMAGE & CATEGORY
// -------------------------

export type Image = {
  id: string;
  imageUrl: string;
  imageHint: string;
  description: string;
};

export type Category = 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';

// -------------------------
// USER — Modelo COMPLETO
// -------------------------

export type User = {
  id: string;
  walletId: string | null;
  name: string;
  email: string;
  role: 'Aluno' | 'Responsavel' | 'Admin' | 'Cantina' | 'Escola';
  balance: number;
  schoolId: string | null;
  canteenId: string | null;
  students: User[];
  telefone: string | null;
  data_nascimento: string | null;
  ativo: boolean;
  student_code: string | null;
};

// -------------------------
// PERFIS — Dados reduzidos
// -------------------------

export type StudentProfile = {
  id: string;
  name: string;
  walletId: string | null;
  balance: number;
  student_code: string | null;
  schoolId: string | null;
};

// PERFIL COMPLETO DO RESPONSÁVEL
export type GuardianProfile = {
  id: string;
  name: string;
  walletId: string | null;
  balance: number;

  // O BACKEND RETORNA SÓ ISSO PARA STUDENTS
  students: StudentLite[];
};

// -------------------------
// SCHOOL / CANTEEN
// -------------------------

export type School = {
  id: string;
  name: string;
  cnpj: string | null;
  status: 'ativa' | 'inativa' | 'pendente';
  qtd_alunos: number;
};

export type Canteen = {
  id: string;
  name: string;
  schoolId: string;
  hr_abertura: string;
  hr_fechamento: string;
  produtos: Product[];
};

// -------------------------
// PRODUCTS + FAVORITES
// -------------------------

export type Product = {
  id: string;
  canteenId: string;
  name: string;
  price: number;
  ativo: boolean;
  image: Image;
  category: Category;
  popular: boolean;
};

export type Favorite = {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
};

// -------------------------
// ORDERS
// -------------------------

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image: Image;
};

export type Order = {
  id: string;
  studentId: string;
  userId: string;
  canteenId: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pendente' | 'confirmado' | 'entregue' | 'cancelado';
};

// -------------------------
// WALLET & TRANSACTIONS
// -------------------------

export type Wallet = {
  id: string;
  userId: string;
  balance: number;
};

export type Transaction = {
  id: string;
  walletId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  origin: 'PIX' | 'Debito' | 'Estorno' | 'Recarregar' | 'Compra';
  userId: string;
  status: string;
};

// -------------------------
// STUDENT LITE (Retorno real da API)
// -------------------------

export type StudentLite = {
  id: string;
  name: string;
  balance: number;
  walletId: string | null;
  school?: {
    name: string;
  } | null;
};
