import { School, Canteen, Product, Order, Transaction, StudentProfile, GuardianProfile } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const MOCK_SCHOOLS: School[] = [
  { id: 'school_1', name: 'Escola Modelo', address: 'Rua das Flores, 123' },
  { id: 'school_2', name: 'Colégio Alpha', address: 'Avenida Brasil, 456' },
];

export const MOCK_CANTEENS: Canteen[] = [
  { id: 'canteen_1', name: 'Cantina da Tia Joana', schoolId: 'school_1' },
  { id: 'canteen_2', name: 'Alpha Lanches', schoolId: 'school_2' },
];

export const MOCK_PRODUCTS: Product[] = [
  // Canteen 1 Products
  {
    id: 'prod_1',
    name: 'Hambúrguer Clássico',
    price: 15.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_burger')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Salgado' as const,
    popular: true,
  },
  {
    id: 'prod_2',
    name: 'Fatia de Pizza',
    price: 8.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_pizza')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Salgado' as const,
  },
  {
    id: 'prod_3',
    name: 'Refrigerante em Lata',
    price: 5.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_soda')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Bebida' as const,
  },
  {
    id: 'prod_4',
    name: 'Brigadeiro',
    price: 3.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_brigadeiro')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Doce' as const,
  },
  // Canteen 2 Products
  {
    id: 'prod_5',
    name: 'Sanduíche Natural',
    price: 12.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_sandwich')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Salgado' as const,
    popular: true,
  },
  {
    id: 'prod_6',
    name: 'Suco de Laranja em Caixa',
    price: 4.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_juice')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Bebida' as const,
  },
  {
    id: 'prod_7',
    name: 'Pudim',
    price: 7.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_pudding')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Doce' as const,
  },
  {
    id: 'prod_8',
    name: 'Prato Feito (Almoço)',
    price: 22.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_lunch')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Almoço' as const,
  },
];

export const MOCK_STUDENT_PROFILE: StudentProfile = {
    id: 'student_1',
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    schoolId: 'school_1',
    ra: '123456',
    balance: 75.50,
};

export const MOCK_GUARDIAN_PROFILE: GuardianProfile = {
    id: 'guardian_1',
    name: 'Maria da Silva',
    email: 'maria.silva@example.com',
    studentId: 'student_1',
    studentRa: '123456',
    balance: 250.00,
    students: [MOCK_STUDENT_PROFILE]
}

export const MOCK_ORDERS: Order[] = [
    {
        id: 'order_1',
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        studentId: 'student_1',
        userId: 'student_1',
        status: 'Entregue',
        total: 20.50,
        items: [
            { productId: 'prod_1', productName: 'Hambúrguer Clássico', quantity: 1, unitPrice: 15.50, image: PlaceHolderImages.find(img => img.id === 'prod_burger')! },
            { productId: 'prod_3', productName: 'Refrigerante em Lata', quantity: 1, unitPrice: 5.00, image: PlaceHolderImages.find(img => img.id === 'prod_soda')! },
        ]
    },
    {
        id: 'order_2',
        date: new Date().toISOString(),
        studentId: 'student_1',
        userId: 'guardian_1',
        status: 'Pendente',
        total: 11.0,
        items: [
            { productId: 'prod_2', productName: 'Fatia de Pizza', quantity: 1, unitPrice: 8.00, image: PlaceHolderImages.find(img => img.id === 'prod_pizza')! },
            { productId: 'prod_4', productName: 'Brigadeiro', quantity: 1, unitPrice: 3.00, image: PlaceHolderImages.find(img => img.id === 'prod_brigadeiro')! },
        ]
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx_1',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        description: 'Recarga via PIX',
        amount: 100.00,
        type: 'credit',
        origin: 'PIX',
        userId: 'student_1',
        studentId: 'student_1',
    },
    {
        id: 'tx_2',
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Compra de Pedido #ORDER_1',
        amount: 20.50,
        type: 'debit',
        origin: 'Cantina',
        userId: 'student_1',
        studentId: 'student_1',
    },
    {
        id: 'tx_3',
        date: new Date().toISOString(),
        description: 'Compra de Pedido #ORDER_2',
        amount: 11.00,
        type: 'debit',
        origin: 'Responsável',
        userId: 'guardian_1',
        studentId: 'student_1',
    },
    {
        id: 'tx_4',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        description: 'Recarga para João da Silva',
        amount: 150.00,
        type: 'credit',
        origin: 'Transferência',
        userId: 'guardian_1',
        studentId: 'student_1',
    }
];
