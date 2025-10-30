import type { ImagePlaceholder } from './placeholder-images';

// This file contains TYPE DEFINITIONS for the entire application.

// #region TYPE DEFINITIONS

export type Product = {
  id: string;
  name: string;
  price: number;
  image: ImagePlaceholder;
  canteenId: string;
  schoolId: string;
  category: 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
  popular?: boolean;
};

export type Canteen = {
  id: string;
  name: string;
  schoolId: string;
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
  status: 'Entregue' | 'Pendente' | 'Cancelado';
  studentId: string;
  userId: string; // The firebaseUid of the person who placed the order (student or guardian)
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  origin: 'Aluno' | 'Responsável' | 'Cantina' | 'PIX' | 'Transferência';
  userId: string; // The firebaseUid of the person initiating the transaction
  studentId?: string; // studentId is optional as a transaction can be for the guardian
};

// Represents the StudentProfile entity from backend.json
export type StudentProfile = {
  id: string; // doc id
  firebaseUid: string;
  name: string;
  email: string;
  schoolId: string;
  ra: string;
  balance: number;
};

// Represents the GuardianProfile entity from backend.json
export type GuardianProfile = {
  id: string; // doc id
  firebaseUid: string;
  name: string;
  email: string;
  studentRa: string;
  studentId?: string;
  balance: number;
  students: StudentProfile[]; // Not in schema, but attached by service
};

export type School = {
  id: string;
  name: string;
  address: string;
};

// #endregion
