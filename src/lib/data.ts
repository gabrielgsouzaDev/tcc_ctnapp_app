
import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

// This file now only contains TYPE DEFINITIONS for our data models.
// The actual data is fetched from the Laravel API.

const images = PlaceHolderImages.reduce((acc, img) => {
  acc[img.id] = img;
  return acc;
}, {} as Record<string, ImagePlaceholder>);

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

export type Student = {
    id: string;
    name: string;
    balance: number;
}

export type Guardian = {
    name: string;
    balance: number;
    students: Student[];
}
