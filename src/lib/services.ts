import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order } from '@/lib/data';
import { apiGet, apiPost } from './api';

type ApiResponse<T> = {
  success: boolean;
  data: T;
}

// School Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  try {
    const response = await apiGet<ApiResponse<School[]>>('/escolas');
    return response.data;
  } catch(e) {
    console.error("Failed to fetch schools:", e);
    // Return empty array to prevent UI from breaking
    return [];
  }
};


// Profile Services
export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  const response = await apiGet<ApiResponse<StudentProfile>>(`/alunos/${userId}`);
  return response.data;
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
  console.log(`Fetching guardian profile for user: ${userId}`);
  const response = await apiGet<ApiResponse<GuardianProfile>>(`/responsaveis/${userId}`);
  return response.data;
}

// Canteen / Product Services
export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    // The backend route is /cantinas, and we filter client-side.
    const response = await apiGet<ApiResponse<Canteen[]>>(`/cantinas`);
    return response.data.filter(c => c.id_escola.toString() === schoolId.toString());
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    const response = await apiGet<ApiResponse<Product[]>>(`/produtos`);
    return response.data.filter(p => p.id_cantina.toString() === canteenId.toString());
}

// Transaction and Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    const response = await apiGet<ApiResponse<Order[]>>(`/pedidos`);
    return response.data.filter(o => o.aluno_id?.toString() === userId.toString() || o.responsavel_id?.toString() === userId.toString());
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    const response = await apiGet<ApiResponse<Order[]>>('/pedidos');
    const studentIdSet = new Set(studentIds.map(String));
    return response.data.filter(o => o.aluno_id && studentIdSet.has(o.aluno_id.toString()));
}


export const postOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>): Promise<Order> => {
    console.log('Posting new order', orderData);
    const payload = {
        aluno_id: orderData.studentId,
        responsavel_id: orderData.userId, // User who is placing the order
        produtos: orderData.items.map(item => ({ id: item.productId, quantidade: item.quantity })),
    };
    const response = await apiPost<ApiResponse<Order>>('/pedidos', payload);
    return response.data;
}

// Mocked transaction services as endpoints are not available
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

export const postTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) : Promise<Transaction> => {
    console.log('Posting new transaction (mock)', transactionData);
    return Promise.resolve({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        ...transactionData,
    });
}

// Mocked balance services as endpoints are not available
export const rechargeBalance = async (userId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Recharging balance for user (mock) ${userId} with amount ${amount}`);
    return Promise.resolve({ success: true });
}

export const internalTransfer = async (fromUserId: string, toUserId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Transferring (mock) ${amount} from ${fromUserId} to ${toUserId}`);
    return Promise.resolve({ success: true });
}
