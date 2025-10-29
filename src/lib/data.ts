
import type { ImagePlaceholder } from './placeholder-images';

// This file now contains TYPE DEFINITIONS and MOCK DATA for the entire application.

// #region TYPE DEFINITIONS

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

// #endregion

// #region MOCK DATA

import { PlaceHolderImages } from './placeholder-images';

export const mockCanteens: Canteen[] = [
    { id: 'canteen-1', name: 'Cantina Central' },
    { id: 'canteen-2', name: 'Ponto do Lanche' },
];

export const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Hambúrguer de Carne', price: 12.50, canteenId: 'canteen-1', category: 'Salgado', image: PlaceHolderImages[0], popular: true },
    { id: 'prod-2', name: 'Fatia de Pizza', price: 8.00, canteenId: 'canteen-1', category: 'Salgado', image: PlaceHolderImages[1] },
    { id: 'prod-3', name: 'Refrigerante Lata', price: 5.00, canteenId: 'canteen-1', category: 'Bebida', image: PlaceHolderImages[2] },
    { id: 'prod-4', name: 'Suco de Caixa', price: 4.00, canteenId: 'canteen-1', category: 'Bebida', image: PlaceHolderImages[3] },
    { id: 'prod-5', name: 'Salada Simples', price: 15.00, canteenId: 'canteen-1', category: 'Almoço', image: PlaceHolderImages[4] },
    { id: 'prod-6', name: 'Misto Quente', price: 7.50, canteenId: 'canteen-2', category: 'Salgado', image: PlaceHolderImages[5] },
    { id: 'prod-7', name: 'Prato do Dia', price: 22.00, canteenId: 'canteen-2', category: 'Almoço', image: PlaceHolderImages[6], popular: true },
    { id: 'prod-8', name: 'Brigadeiro', price: 3.00, canteenId: 'canteen-1', category: 'Doce', image: PlaceHolderImages[7] },
    { id: 'prod-9', name: 'Pudim', price: 6.00, canteenId: 'canteen-2', category: 'Doce', image: PlaceHolderImages[8] },
];

export const mockStudentProfile: Student = {
    id: 'student-001',
    uid_firebase: 'firebase-student-001',
    name: 'João Silva',
    email: 'joao.silva@aluno.com',
    schoolId: '1',
    balance: 50.25,
    ra: '12345'
};

export const mockEmployeeProfile: User = {
    id: 'emp-001',
    uid_firebase: 'firebase-emp-001',
    name: 'Carlos Antunes',
    email: 'carlos.antunes@escola.com',
    schoolId: '1',
    balance: 15.75,
    cargo: 'Professor',
};

export const mockGuardianProfile: Guardian = {
    id: 'guardian-001',
    uid_firebase: 'firebase-guardian-001',
    name: 'Maria Silva',
    email: 'maria.silva@example.com',
    schoolId: '1',
    balance: 150.00,
    students: [
        { ...mockStudentProfile }, // João Silva
        { id: 'student-002', uid_firebase: 'firebase-student-002', name: 'Ana Silva', email: 'ana.silva@aluno.com', schoolId: '1', balance: 30.50, ra: '67890' },
    ]
};

export const mockStudentOrderHistory: Order[] = [
    { id: '#PED-001', date: '2024-07-22T10:00:00Z', studentId: 'student-001', status: 'Entregue', total: 17.50, items: [
        { product: mockProducts[0], quantity: 1 },
        { product: mockProducts[2], quantity: 1 },
    ]},
    { id: '#PED-002', date: '2024-07-23T12:15:00Z', studentId: 'student-001', status: 'Pendente', total: 8.00, items: [
        { product: mockProducts[1], quantity: 1 },
    ]},
    { id: '#PED-003', date: '2024-07-21T09:45:00Z', studentId: 'student-001', status: 'Cancelado', total: 12.50, items: [
        { product: mockProducts[0], quantity: 1 },
    ]},
];

export const mockStudentTransactions: Transaction[] = [
    { id: 'tx-stud-1', date: '2024-07-23T12:15:00Z', description: 'Compra de Pedido #PED-002', amount: 8.00, type: 'debit', origin: 'Cantina', studentId: 'student-001' },
    { id: 'tx-stud-2', date: '2024-07-22T10:00:00Z', description: 'Compra de Pedido #PED-001', amount: 17.50, type: 'debit', origin: 'Cantina', studentId: 'student-001' },
    { id: 'tx-stud-3', date: '2024-07-22T08:00:00Z', description: 'Recarga do Responsável', amount: 50.00, type: 'credit', origin: 'Responsável', studentId: 'student-001' },
];

export const mockEmployeeOrderHistory: Order[] = mockStudentOrderHistory; // Employees see same orders for now
export const mockEmployeeTransactions: Transaction[] = [
    { id: 'tx-emp-1', date: '2024-07-22T10:00:00Z', description: 'Compra na Cantina Central', amount: 12.50, type: 'debit', origin: 'Cantina' },
    { id: 'tx-emp-2', date: '2024-07-21T12:00:00Z', description: 'Recarga via PIX', amount: 50.00, type: 'credit', origin: 'PIX' },
    { id: 'tx-emp-3', date: '2024-07-20T09:30:00Z', description: 'Compra de Café', amount: 3.25, type: 'debit', origin: 'Cantina' },
];


export const mockGuardianOrderHistory: Order[] = [
    ...mockStudentOrderHistory,
    { id: '#PED-004', date: '2024-07-23T12:15:00Z', studentId: 'student-002', status: 'Pendente', total: 8.00, items: [
        { product: mockProducts[1], quantity: 1 },
    ]},
];

export const mockGuardianTransactionHistory: Transaction[] = [
    { id: 'tx-guard-1', date: '2024-07-23T12:15:00Z', description: 'Compra de Pedido #PED-004', amount: 8.00, type: 'debit', origin: 'Cantina', studentId: 'student-002' },
    ...mockStudentTransactions,
    { id: 'tx-guard-2', date: '2024-07-20T15:00:00Z', description: 'Recarga via PIX (Conta Responsável)', amount: 100.00, type: 'credit', origin: 'PIX' },
];

// #endregion
