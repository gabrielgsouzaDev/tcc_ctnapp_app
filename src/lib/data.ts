import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

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
  origin: 'Aluno' | 'Responsável' | 'Cantina';
};

export type Student = {
    id: string;
    name: string;
    balance: number;
}

export type Guardian = {
    name: string;
    students: Student[];
}


export const canteens: Canteen[] = [
  { id: 'canteen1', name: 'Cantina Central' },
  { id: 'canteen2', name: 'Ponto do Lanche' },
];

export const products: Product[] = [
  { id: '1', name: 'Hambúrguer', price: 15.00, image: images.prod_burger, canteenId: 'canteen1', category: 'Salgado', popular: true },
  { id: '2', name: 'Fatia de Pizza', price: 10.00, image: images.prod_pizza, canteenId: 'canteen1', category: 'Salgado', popular: true },
  { id: '3', name: 'Refrigerante', price: 5.00, image: images.prod_soda, canteenId: 'canteen1', category: 'Bebida' },
  { id: '4', name: 'Suco de Caixa', price: 4.00, image: images.prod_juice, canteenId: 'canteen1', category: 'Bebida' },
  { id: '5', name: 'Salada', price: 12.00, image: images.prod_salad, canteenId: 'canteen1', category: 'Almoço' },
  { id: '6', name: 'Misto Quente', price: 8.00, image: images.prod_sandwich, canteenId: 'canteen2', category: 'Salgado' },
  { id: '7', name: 'Suco de Laranja', price: 6.00, image: images.prod_juice, canteenId: 'canteen2', category: 'Bebida' },
  { id: '8', name: 'Prato Feito', price: 25.00, image: {id: 'prod_lunch', description: 'prato de almoço', imageUrl: 'https://picsum.photos/seed/10/400/300', imageHint: 'lunch plate'}, canteenId: 'canteen1', category: 'Almoço' },
  { id: '9', name: 'Brigadeiro', price: 3.00, image: {id: 'prod_brigadeiro', description: 'chocolate brigadeiro', imageUrl: 'https://picsum.photos/seed/11/400/300', imageHint: 'chocolate candy'}, canteenId: 'canteen1', category: 'Doce', popular: true },
  { id: '10', name: 'Pudim', price: 7.00, image: {id: 'prod_pudding', description: 'pedaço de pudim', imageUrl: 'https://picsum.photos/seed/12/400/300', imageHint: 'pudding slice'}, canteenId: 'canteen2', category: 'Doce' },
];

export const orderHistory: Order[] = [
  {
    id: '#003',
    date: new Date().toISOString(),
    items: [
      { product: products[4], quantity: 1 },
      { product: products[6], quantity: 1 },
    ],
    total: 18.00,
    status: 'Pendente',
    studentId: 'student1'
  },
  {
    id: '#002',
    date: '2024-07-28',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 1 },
    ],
    total: 20.00,
    status: 'Entregue',
    studentId: 'student1'
  },
  {
    id: '#001',
    date: '2024-07-27',
    items: [{ product: products[1], quantity: 2 }],
    total: 20.00,
    status: 'Entregue',
    studentId: 'student1'
  },
   {
    id: '#101',
    date: '2024-07-29',
    items: [{ product: products[5], quantity: 1 }, { product: products[3], quantity: 1 }],
    total: 12.00,
    status: 'Entregue',
    studentId: 'student2'
  },
];

export const studentProfile = {
  id: 'student1',
  name: 'João Silva',
  balance: 32.75,
};

export const guardianProfile: Guardian = {
  name: 'Maria Silva',
  students: [
    {
      id: 'student1',
      name: 'João Silva',
      balance: 32.75,
    },
    {
      id: 'student2',
      name: 'Ana Silva',
      balance: 55.20,
    },
  ],
};

export const transactionHistory: Transaction[] = [
    { id: 't1', date: new Date(new Date().setHours(new Date().getHours() - 1, 15, 22)).toISOString(), description: 'Compra Pedido #003', amount: 18.00, type: 'debit', origin: 'Cantina' },
    { id: 't2', date: new Date('2024-07-29T10:05:10').toISOString(), description: 'Recarga via PIX', amount: 50.00, type: 'credit', origin: 'Responsável' },
    { id: 't6', date: new Date('2024-07-28T14:20:05').toISOString(), description: 'Recarga via App', amount: 20.00, type: 'credit', origin: 'Aluno' },
    { id: 't3', date: new Date('2024-07-28T12:30:45').toISOString(), description: 'Compra Pedido #002', amount: 20.00, type: 'debit', origin: 'Cantina' },
    { id: 't4', date: new Date('2024-07-27T12:25:11').toISOString(), description: 'Compra Pedido #001', amount: 20.00, type: 'debit', origin: 'Cantina' },
    { id: 't5', date: new Date('2024-07-26T09:00:00').toISOString(), description: 'Recarga via Cartão', amount: 30.00, type: 'credit', origin: 'Responsável' },
];
