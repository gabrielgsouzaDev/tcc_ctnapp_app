
// #region --- DATA TYPE DEFINITIONS ---
// This file contains the type definitions for the data used in the application.
// These types are used to ensure that the data is consistent across the application.
// Mappers in services.ts are used to transform backend data into these types.

// #region --- IMAGE & CATEGORY TYPES ---

export type Image = {
  id: string;
  imageUrl: string;
  imageHint: string;
  description: string;
};

export type Category = 'Lanche' | 'Bebida' | 'Doce' | 'Salgado';

// #endregion


// #region --- USER & AUTH TYPES ---

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
  student_code: string | null; // ✅ CORREÇÃO: Propriedade adicionada
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
  userId: string; // ID of the user who made the order (can be the student or the guardian)
  canteenId: string;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'pendente' | 'confirmado' | 'entregue' | 'cancelado';
};

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
  userId: string; // ID of the user who initiated the transaction
  status: string;
};

// #endregion
