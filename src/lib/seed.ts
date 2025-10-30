import {
  collection,
  writeBatch,
  doc,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { PlaceHolderImages } from './placeholder-images';

const schoolsData = [
  { id: 'school_1', name: 'Escola Modelo', address: 'Rua das Flores, 123' },
  { id: 'school_2', name: 'Colégio Alpha', address: 'Avenida Brasil, 456' },
];

const canteensData = [
  { id: 'canteen_1', name: 'Cantina da Tia Joana', schoolId: 'school_1' },
  { id: 'canteen_2', name: 'Alpha Lanches', schoolId: 'school_2' },
];

const productsData = [
  // Canteen 1 Products
  {
    name: 'Hambúrguer Clássico',
    price: 15.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_burger')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Salgado' as const,
    popular: true,
  },
  {
    name: 'Fatia de Pizza',
    price: 8.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_pizza')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Salgado' as const,
  },
  {
    name: 'Refrigerante em Lata',
    price: 5.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_soda')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Bebida' as const,
  },
  {
    name: 'Brigadeiro',
    price: 3.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_brigadeiro')!,
    canteenId: 'canteen_1',
    schoolId: 'school_1',
    category: 'Doce' as const,
  },
  // Canteen 2 Products
  {
    name: 'Sanduíche Natural',
    price: 12.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_sandwich')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Salgado' as const,
    popular: true,
  },
  {
    name: 'Suco de Laranja em Caixa',
    price: 4.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_juice')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Bebida' as const,
  },
  {
    name: 'Pudim',
    price: 7.5,
    image: PlaceHolderImages.find(img => img.id === 'prod_pudding')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Doce' as const,
  },
  {
    name: 'Prato Feito (Almoço)',
    price: 22.0,
    image: PlaceHolderImages.find(img => img.id === 'prod_lunch')!,
    canteenId: 'canteen_2',
    schoolId: 'school_2',
    category: 'Almoço' as const,
  },
];

export const seedDatabase = async (db: Firestore) => {
  const batch = writeBatch(db);

  // Check if schools already exist to prevent re-seeding
  const schoolsSnapshot = await getDocs(collection(db, 'schools'));
  if (!schoolsSnapshot.empty) {
    console.log('Database already seeded.');
    return { message: 'O banco de dados já foi populado com dados de exemplo.' };
  }

  schoolsData.forEach(school => {
    const docRef = doc(db, 'schools', school.id);
    batch.set(docRef, school);
  });

  canteensData.forEach(canteen => {
    const docRef = doc(db, 'canteens', canteen.id);
    batch.set(docRef, canteen);
  });

  productsData.forEach(product => {
    const docRef = doc(collection(db, 'products')); // Auto-generate ID
    batch.set(docRef, product);
  });

  await batch.commit();
  console.log('Database seeded successfully!');
  return { message: 'Banco de dados populado com sucesso! Agora você pode cadastrar alunos.' };
};
