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
  return apiGet<StudentProfile>(`/perfil/aluno/${userId}`);
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  return apiGet<GuardianProfile>(`/perfil/responsavel/${userId}`);
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    return apiGet<Canteen[]>(`/escolas/${schoolId}/cantinas`);
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    return apiGet<Product[]>(`/cantinas/${canteenId}/produtos`);
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    return apiGet<Order[]>(`/pedidos/usuario/${userId}`);
}

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
     console.log(`Fetching transactions for user: ${userId}`);
    return apiGet<Transaction[]>(`/transacoes/usuario/${userId}`);
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    return apiPost<Order[]>('/pedidos/responsavel', { student_ids: studentIds });
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users: ${allUserIds.join(', ')}`);
     return apiPost<Transaction[]>('/transacoes/responsavel', { user_ids: allUserIds });
}

export const postOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> => {
    console.log('Posting new order', orderData);
    return apiPost<Order>('/pedidos', orderData);
}

export const postTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) : Promise<Transaction> => {
    console.log('Posting new transaction', transactionData);
    return apiPost<Transaction>('/transacoes', transactionData);
}

export const rechargeBalance = async (userId: string, amount: number) => {
    console.log(`Recharging balance for user ${userId} with amount ${amount}`);
    return apiPost(`/carteiras/${userId}/recarga`, { amount });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number) => {
    console.log(`Transferring ${amount} from ${fromUserId} to ${toUserId}`);
    return apiPost('/transferencia-interna', { from_user_id: fromUserId, to_user_id: toUserId, amount });
}
