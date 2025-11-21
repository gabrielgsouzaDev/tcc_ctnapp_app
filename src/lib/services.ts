
import { type School, type StudentProfile, type GuardianProfile, Canteen, Product, Transaction, Order } from '@/lib/data';
import { apiGet, apiPost } from './api';

// School Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  return apiGet<School[]>('/escolas');
};


// Profile Services
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  return apiGet<StudentProfile>(`/alunos/${userId}`);
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  const guardian = await apiGet<GuardianProfile>(`/responsaveis/${userId}`);
  // Assuming the backend now returns linked students within the guardian object.
  // If not, this part needs adjustment based on final API response.
  return guardian;
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    return apiGet<Canteen[]>(`/cantinas/escola/${schoolId}`);
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    // The backend doesn't have a direct route, so we fetch all and filter client-side.
    const allProducts = await apiGet<Product[]>(`/produtos`);
    return allProducts.filter(p => p.canteenId === canteenId || p.id_cantina === canteenId);
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    const allOrders = await apiGet<Order[]>(`/pedidos`);
    return allOrders.filter(o => o.userId === userId || o.studentId === userId);
}

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
    const payload = {
        aluno_id: orderData.studentId,
        responsavel_id: orderData.userId, // User who is placing the order
        produtos: orderData.items.map(item => ({ id: item.productId, quantidade: item.quantity })),
    };
    return apiPost<Order>('/pedidos', payload);
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
    // Here you would call your API: e.g., apiPost(`/carteiras/${userId}/recarga`, { amount });
    return Promise.resolve({ success: true });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Transferring (mock) ${amount} from ${fromUserId} to ${toUserId}`);
    // Here you would call your API: e.g., apiPost('/transferencia-interna', { from_user_id: fromUserId, to_user_id: toUserId, amount });
    return Promise.resolve({ success: true });
}

