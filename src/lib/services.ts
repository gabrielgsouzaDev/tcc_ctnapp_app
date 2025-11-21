import { type School, type StudentProfile, type GuardianProfile, Canteen, Product, Transaction, Order } from '@/lib/data';
import { apiGet, apiPost } from './api';

// MOCK DATA FOR MISSING API ENDPOINTS
import { PlaceHolderImages } from '@/lib/placeholder-images';


// School Services
export const getSchools = async (): Promise<School[]> => {
  // This endpoint is not in the provided api.php, assuming it will be created.
  // Using a mock for now.
  console.log("Fetching schools from mock...");
  return Promise.resolve([
    { id: '1', name: 'Escola Modelo', address: 'Rua das Flores, 123' },
    { id: '2', name: 'Colégio Alpha', address: 'Avenida Brasil, 456' },
  ]);
};


// Profile Services
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  return apiGet<StudentProfile>(`/alunos/${userId}`);
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  // This needs to also fetch the students associated with the guardian
  const guardian = await apiGet<GuardianProfile>(`/responsaveis/${userId}`);
  if (guardian && guardian.studentRa) {
    // Assuming you have an endpoint to find a student by RA
    // This part is a guess and may need adjustment based on your final API structure
    try {
        const allStudents = await apiGet<StudentProfile[]>('/alunos');
        const linkedStudent = allStudents.find(s => s.ra === guardian.studentRa);
        guardian.students = linkedStudent ? [linkedStudent] : [];
    } catch (e) {
        console.error("Could not fetch students to link to guardian", e);
        guardian.students = [];
    }
  }
  return guardian;
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    // This endpoint is not in the provided api.php, using mock.
    console.log(`Fetching canteens for school (mock): ${schoolId}`);
    return Promise.resolve([
        { id: '1', name: 'Cantina da Tia Joana', schoolId: '1' },
        { id: '2', name: 'Alpha Lanches', schoolId: '2' },
    ]);
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    // The API provides all products, so we fetch all and filter by canteenId on the client.
    const allProducts = await apiGet<Product[]>(`/produtos`);
    return allProducts.filter(p => p.canteenId === canteenId);
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    const allOrders = await apiGet<Order[]>(`/pedidos`);
    return allOrders.filter(o => o.userId === userId || o.studentId === userId);
}

// This function seems complex for the current API. Let's simplify.
export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    const allOrders = await apiGet<Order[]>('/pedidos');
    return allOrders.filter(o => studentIds.includes(o.studentId));
}

// No transaction endpoints were provided. Mocking these functions for now.
export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
     console.log(`Fetching transactions for user (mock): ${userId}`);
    return Promise.resolve([
        { id: 'tx_1', date: new Date().toISOString(), description: 'Recarga (Mock)', amount: 50.00, type: 'credit', origin: 'PIX', userId: userId, studentId: userId },
        { id: 'tx_2', date: new Date().toISOString(), description: 'Compra (Mock)', amount: 15.50, type: 'debit', origin: 'Cantina', userId: userId, studentId: userId },
    ]);
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users (mock): ${allUserIds.join(', ')}`);
     return Promise.resolve([
        { id: 'tx_g1', date: new Date().toISOString(), description: 'Recarga para Aluno (Mock)', amount: 100.00, type: 'credit', origin: 'Transferência', userId: allUserIds[0], studentId: allUserIds.length > 1 ? allUserIds[1] : undefined },
     ]);
}

export const postOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> => {
    console.log('Posting new order', orderData);
    // Assuming the backend auto-assigns id, date, and initial status.
    return apiPost<Order>('/pedidos', orderData);
}

// No transaction endpoints. Mocking this.
export const postTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) : Promise<Transaction> => {
    console.log('Posting new transaction (mock)', transactionData);
    return Promise.resolve({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        ...transactionData,
    });
}

// No wallet/recharge endpoints. Mocking these.
export const rechargeBalance = async (userId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Recharging balance for user (mock) ${userId} with amount ${amount}`);
    // Here you would update the balance in your state management
    return Promise.resolve({ success: true });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Transferring (mock) ${amount} from ${fromUserId} to ${toUserId}`);
    // Here you would update balances in your state management
    return Promise.resolve({ success: true });
}
