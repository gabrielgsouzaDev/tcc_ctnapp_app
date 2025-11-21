import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order, type User } from '@/lib/data';
import { apiGet, apiPost } from './api';

// #region User, Profile, and Auth Services
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const response = await apiGet<User>(`/users/${userId}`);
    // The laravel API returns the user object directly, not nested in `data` for this specific endpoint.
    return response; 
  } catch (e) {
    console.error(`Failed to fetch user ${userId}:`, e);
    return null;
  }
}

export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  console.log(`Fetching student profile for user: ${userId}`);
  // Assuming the user model includes profile data or there's a specific endpoint
  const user = await getUser(userId);
  if (user && user.role === 'student') {
    return user as StudentProfile;
  }
  return null;
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
    console.log(`Fetching guardian profile for user: ${userId}`);
    const user = await getUser(userId);
    if (user && user.role === 'guardian') {
        // Here, we would ideally get the list of associated students from the backend.
        // For now, we will assume the user object contains this or we fetch them separately.
        // This part may need refinement based on the exact API response for a guardian.
        const guardianProfile = user as GuardianProfile;
        guardianProfile.students = []; // Placeholder, needs to be populated
        return guardianProfile;
    }
    return null;
}
// #endregion


// #region School and Canteen Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  try {
    const response = await apiGet<School[]>('/escolas');
    return response;
  } catch (e) {
    console.error("Failed to fetch schools:", e);
    return [];
  }
};

export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    console.log(`Fetching canteens for school: ${schoolId}`);
    try {
      const response = await apiGet<Canteen[]>(`/cantinas/escola/${schoolId}`);
      return response;
    } catch(e) {
      console.error(`Failed to fetch canteens for school ${schoolId}:`, e);
      return [];
    }
}
// #endregion


// #region Product Services
export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    console.log(`Fetching products for canteen: ${canteenId}`);
    try {
      const response = await apiGet<Product[]>(`/cantinas/${canteenId}/produtos`);
      return response;
    } catch(e) {
      console.error(`Failed to fetch products for canteen ${canteenId}:`, e);
      return [];
    }
}
// #endregion


// #region Order and Transaction Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    try {
      const allOrders = await apiGet<Order[]>(`/pedidos`);
      // Filter client-side as the API returns all orders
      return allOrders.filter(o => o.aluno_id?.toString() === userId.toString() || o.responsavel_id?.toString() === userId.toString());
    } catch(e) {
      console.error(`Failed to fetch orders for user ${userId}:`, e);
      return [];
    }
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    try {
      const allOrders = await apiGet<Order[]>('/pedidos');
      const studentIdSet = new Set(studentIds.map(String));
      return allOrders.filter(o => o.aluno_id && studentIdSet.has(o.aluno_id.toString()));
    } catch(e) {
      console.error(`Failed to fetch orders for students:`, e);
      return [];
    }
}

export const postOrder = async (orderData: any): Promise<Order> => {
    console.log('Posting new order', orderData);
    const payload = {
        aluno_id: orderData.studentId,
        responsavel_id: orderData.userId, // User who is placing the order
        produtos: orderData.items.map((item: any) => ({ id: item.productId, quantidade: item.quantity })),
    };
    const response = await apiPost<Order>('/pedidos', payload);
    return response;
}
// #endregion

// #region Wallet and Transaction Services
export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
     console.log(`Fetching transactions for user: ${userId}`);
    try {
        const allTransactions = await apiGet<Transaction[]>('/transacoes');
        return allTransactions.filter(t => t.user_id?.toString() === userId.toString());
    } catch (e) {
        console.error(`Failed to fetch transactions for user ${userId}:`, e);
        return [];
    }
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users: ${allUserIds.join(', ')}`);
    try {
        const allTransactions = await apiGet<Transaction[]>('/transacoes');
        const userIdSet = new Set(allUserIds.map(String));
        return allTransactions.filter(t => t.user_id && userIdSet.has(t.user_id.toString()));
    } catch (e) {
        console.error(`Failed to fetch transactions for users:`, e);
        return [];
    }
}

export const postTransaction = async (transactionData: Omit<Transaction, 'id' | 'date'>) : Promise<Transaction> => {
    console.log('Posting new transaction', transactionData);
    const response = await apiPost<Transaction>('/transacoes', transactionData);
    return response;
}

export const rechargeBalance = async (userId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Recharging balance for user ${userId} with amount ${amount}`);
    // This needs a dedicated endpoint, for now we will simulate it via a generic transaction
    await postTransaction({
        user_id: userId,
        descricao: `Recarga PIX no valor de R$ ${amount.toFixed(2)}`,
        valor: amount,
        tipo: 'credito' as const,
        origem: 'PIX',
    });
    return { success: true };
}

export const internalTransfer = async (fromUserId: string, toUserId:string, amount: number): Promise<{success: boolean}> => {
    console.log(`Transferring ${amount} from ${fromUserId} to ${toUserId}`);
    // This also needs a dedicated endpoint or specific transaction handling
     await postTransaction({
        user_id: fromUserId,
        descricao: `Transferência enviada para usuário ${toUserId}`,
        valor: -amount, // Debit from guardian
        tipo: 'debito' as const,
        origem: 'Transferência',
    });
     await postTransaction({
        user_id: toUserId,
        descricao: `Transferência recebida de usuário ${fromUserId}`,
        valor: amount, // Credit to student
        tipo: 'credito' as const,
        origem: 'Transferência',
    });
    return { success: true };
}
// #endregion
