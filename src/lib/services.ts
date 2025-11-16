import { type School, type StudentProfile, type GuardianProfile, Canteen, Product, Transaction, Order } from '@/lib/data';
import { apiGet, apiPost } from './api';

// # MOCK IMPLEMENTATIONS
// These functions are temporarily using mock data.
// They will be replaced with actual API calls to a Laravel backend.
import { MOCK_SCHOOLS, MOCK_CANTEENS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_TRANSACTIONS, MOCK_STUDENT_PROFILE, MOCK_GUARDIAN_PROFILE } from '@/mocks/data';

// School Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  // REAL: return apiGet<School[]>('/escolas');
  return Promise.resolve(MOCK_SCHOOLS);
};


// Profile Services
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  // REAL: return apiGet<StudentProfile>(`/perfil/aluno/${userId}`);
  return Promise.resolve(MOCK_STUDENT_PROFILE);
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  // REAL: return apiGet<GuardianProfile>(`/perfil/responsavel/${userId}`);
  return Promise.resolve(MOCK_GUARDIAN_PROFILE);
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    // REAL: return apiGet<Canteen[]>(`/escolas/${schoolId}/cantinas`);
    return Promise.resolve(MOCK_CANTEENS.filter(c => c.schoolId === schoolId));
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    // REAL: return apiGet<Product[]>(`/cantinas/${canteenId}/produtos`);
    return Promise.resolve(MOCK_PRODUCTS.filter(p => p.canteenId === canteenId));
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    // REAL: return apiGet<Order[]>(`/pedidos/usuario/${userId}`);
    return Promise.resolve(MOCK_ORDERS);
}

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
     console.log(`Fetching transactions for user: ${userId}`);
    // REAL: return apiGet<Transaction[]>(`/transacoes/usuario/${userId}`);
    return Promise.resolve(MOCK_TRANSACTIONS);
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    // REAL: return apiPost<Order[]>('/pedidos/responsavel', { student_ids: studentIds });
    return Promise.resolve(MOCK_ORDERS.filter(o => studentIds.includes(o.studentId)));
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users: ${allUserIds.join(', ')}`);
     // REAL: return apiPost<Transaction[]>('/transacoes/responsavel', { user_ids: allUserIds });
     return Promise.resolve(MOCK_TRANSACTIONS.filter(t => allUserIds.includes(t.userId)));
}

export const postOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> => {
    console.log('Posting new order', orderData);
    // REAL: return apiPost<Order>('/pedidos', orderData);
    const newOrder: Order = {
        id: `mock_order_${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Pendente',
        ...orderData,
    };
    return Promise.resolve(newOrder);
}

export const postTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) : Promise<Transaction> => {
    console.log('Posting new transaction', transactionData);
    // REAL: return apiPost<Transaction>('/transacoes', transactionData);
     const newTransaction: Transaction = {
        id: `mock_tx_${Date.now()}`,
        date: new Date().toISOString(),
        ...transactionData,
    };
    return Promise.resolve(newTransaction);
}

export const rechargeBalance = async (userId: string, amount: number) => {
    console.log(`Recharging balance for user ${userId} with amount ${amount}`);
    // REAL: return apiPost(`/carteiras/${userId}/recarga`, { amount });
    return Promise.resolve({ success: true, newBalance: 100 + amount });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number) => {
    console.log(`Transferring ${amount} from ${fromUserId} to ${toUserId}`);
    // REAL: return apiPost('/transferencia-interna', { fromUserId, toUserId, amount });
    return Promise.resolve({ success: true });
}
