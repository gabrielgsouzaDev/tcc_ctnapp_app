import type { ImagePlaceholder } from './placeholder-images';

// This file now only contains TYPE DEFINITIONS for our data models.
// The actual data is fetched from the Laravel API.

export type Product = {
  id: string;
  name: string;
  price: number;
  image: ImagePlaceholder;
  canteenId: string;
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
  popular?: boolean;
};

export type Canteen = {
  id: string;
  name: string;
};

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Entregue' | 'Pendente' | 'Cancelado';
  studentId: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  origin: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX';
  studentId?: string; // studentId is optional as a transaction can be for the guardian
};

// Base User type reflecting tb_usuario and tb_carteira
export type User = {
  id: string; // Corresponds to id_usuario
  uid_firebase: string;
  name: string;
  email: string;
  schoolId: string; // Corresponds to id_escola
  balance: number;
  ra?: string;
  cargo?: string;
};

// Student is a specific type of User
export type Student = User & {
  ra: string; // RA is mandatory for a student
};

// Guardian is a specific type of User that also has a list of dependents
export type Guardian = User & {
  students: Student[]; // List of dependent students
};


export type School = {
  id: string;
  name: string;
  address: string;
};
