import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order } from '@/lib/data';
import { apiGet, apiPost } from './api';

// School Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  return await apiGet<School[]>('/escolas');
};


// Profile Services
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  return apiGet<StudentProfile>(`/alunos/${userId}`);
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  // Assuming the responsavel show route returns attached students.
  // This may need adjustment based on actual backend logic in a service layer.
  return await apiGet<GuardianProfile>(`/responsaveis/${userId}`);
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    return await apiGet<Canteen[]>(`/cantinas/escola/${schoolId}`);
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    // Backend doesn't have a direct route, so we fetch all and filter client-side.
    const allProducts = await apiGet<Product[]>(`/produtos`);
    return allProducts.filter(p => p.id_cantina === canteenId);
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    const allOrders = await apiGet<Order[]>(`/pedidos`);
    return allOrders.filter(o => o.aluno_id === userId || o.responsavel_id === userId);
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    const allOrders = await apiGet<Order[]>('/pedidos');
    return allOrders.filter(o => o.aluno_id && studentIds.includes(o.aluno_id));
}

// No transaction endpoints were provided. Mocking these functions for now.
export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
     console.log(`Fetching transactions for user (mock): ${userId}`);
    // This should call a real endpoint like: return apiGet<Transaction[]>(`/transacoes/usuario/${userId}`);
    return Promise.resolve([
        { id: 'tx_1', date: new Date().toISOString(), description: 'Recarga (Mock)', amount: 50.00, type: 'credit', origin: 'PIX', userId: userId, studentId: userId },
        { id: 'tx_2', date: new Date().toISOString(), description: 'Compra (Mock)', amount: 15.50, type: 'debit', origin: 'Cantina', userId: userId, studentId: userId },
    ]);
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users (mock): ${allUserIds.join(', ')}`);
    // This should call a real endpoint like: return apiPost<Transaction[]>('/transacoes/responsavel', { user_ids: allUserIds });
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
    // This should call a real endpoint like: return apiPost<Transaction>('/transacoes', transactionData);
    return Promise.resolve({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        ...transactionData,
    });
}

// No wallet/recharge endpoints. Mocking these.
export const rechargeBalance = async (userId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Recharging balance for user (mock) ${userId} with amount ${amount}`);
    // This should call a real endpoint like: return apiPost(`/carteiras/${userId}/recarga`, { amount });
    return Promise.resolve({ success: true });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Transferring (mock) ${amount} from ${fromUserId} to ${toUserId}`);
    // This should call a real endpoint like: return apiPost('/transferencia-interna', { from_user_id: fromUserId, to_user_id: toUserId, amount });
    return Promise.resolve({ success: true });
}
