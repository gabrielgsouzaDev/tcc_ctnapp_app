
import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order, type User, type Wallet } from '@/lib/data';
import { apiGet, apiPost } from './api';
import { PlaceHolderImages } from './placeholder-images';

// #region Helper Mappers
// These functions convert backend snake_case keys to frontend camelCase keys and add any derived data.
const mapUser = (user: any): User => ({
    ...user,
    id: user.id.toString(),
    name: user.nome,
    balance: user.carteira?.saldo ?? 0,
    schoolId: user.id_escola?.toString(),
    // The backend now sends 'dependentes' for a guardian
    students: user.dependentes?.map(mapUser) || [],
});

const mapSchool = (school: any): School => ({
    ...school,
    id: school.id_escola.toString(),
    name: school.nome,
    address: school.endereco,
});

const mapCanteen = (canteen: any): Canteen => ({
    ...canteen,
    id: canteen.id_cantina.toString(),
    name: canteen.nome,
    schoolId: canteen.id_escola.toString(),
});

const mapProduct = (product: any): Product => ({
    ...product,
    id: product.id_produto.toString(),
    canteenId: product.id_cantina.toString(),
    name: product.nome,
    price: parseFloat(product.preco),
    image: PlaceHolderImages.find(img => img.id.includes(product.nome.split(' ')[0].toLowerCase())) || PlaceHolderImages[0],
    category: product.categoria || 'Salgado', 
});

const mapOrder = (order: any): Order => ({
    ...order,
    id: order.id.toString(),
    studentId: order.aluno_id?.toString() || '',
    userId: order.responsavel_id?.toString() || order.aluno_id?.toString() || '',
    total: parseFloat(order.valor_total),
    date: order.created_at,
    items: order.produtos?.map((p: any) => ({
        productId: p.id_produto.toString(),
        productName: p.nome,
        quantity: p.pivot.quantidade,
        unitPrice: parseFloat(p.preco),
        image: PlaceHolderImages.find(img => img.id.includes(p.nome.split(' ')[0].toLowerCase())) || PlaceHolderImages[0],
    })) || [],
    status: order.status || 'Pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
    ...transaction,
    id: transaction.id.toString(),
    walletId: transaction.id_carteira.toString(),
    date: transaction.data_transacao,
    description: transaction.descricao,
    amount: parseFloat(transaction.valor),
    type: transaction.tipo,
    origin: transaction.origem,
    userId: transaction.user_id, // Assuming backend provides this
});

const mapWallet = (wallet: any): Wallet => ({
    ...wallet,
    id: wallet.id_carteira.toString(),
    user_id: wallet.id_user.toString(),
    balance: parseFloat(wallet.saldo)
});
// #endregion


// #region User, Profile, and Auth Services
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const response = await apiGet<{ data: any }>(`users/${userId}`);
    return mapUser(response.data); 
  } catch (e) {
    console.error(`Failed to fetch user ${userId}:`, e);
    return null;
  }
}

export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  const user = await getUser(userId);
  if (user && user.role === 'student') {
    return user as StudentProfile;
  }
  return null;
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
    const user = await getUser(userId);
    if (user && user.role === 'guardian') {
        const guardianProfile = user as GuardianProfile;
        
        // With the new 'dependentes' structure, this mapping should be sufficient.
        // If 'dependentes' only contains IDs, a further fetch would be needed.
        // Assuming full dependent user objects are returned.
        if (user.students && user.students.length > 0) {
            const studentProfiles = await Promise.all(
                user.students.map(studentStub => getUser(studentStub.id))
            );
            guardianProfile.students = studentProfiles.filter(p => p !== null) as StudentProfile[];
        }
        
        return guardianProfile;
    }
    return null;
}
// #endregion


// #region School and Canteen Services
export const getSchools = async (): Promise<School[]> => {
  console.log("Fetching schools from API...");
  try {
    const response = await apiGet<{ data: any[] }>('escolas');
    return response.data.map(mapSchool);
  } catch (e) {
    console.error("Failed to fetch schools:", e);
    return [];
  }
};

export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    if (!schoolId) return [];
    console.log(`Fetching canteens for school: ${schoolId}`);
    try {
      const response = await apiGet<{ data: any[] }>(`cantinas/escola/${schoolId}`);
      return response.data.map(mapCanteen);
    } catch(e) {
      console.error(`Failed to fetch canteens for school ${schoolId}:`, e);
      return [];
    }
}
// #endregion


// #region Product Services
export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    if (!canteenId) return [];
    console.log(`Fetching products for canteen: ${canteenId}`);
    try {
      const response = await apiGet<{ data: any[] }>(`cantinas/${canteenId}/produtos`);
      return response.data.map(mapProduct);
    } catch(e) {
      console.error(`Failed to fetch products for canteen ${canteenId}:`, e);
      return [];
    }
}
// #endregion


// #region Order Services
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    try {
      const response = await apiGet<{ data: any[] }>(`pedidos`);
      const allOrders = response.data.map(mapOrder);
      return allOrders.filter(o => o.studentId === userId || o.userId === userId);
    } catch(e) {
      console.error(`Failed to fetch orders for user ${userId}:`, e);
      return [];
    }
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    console.log(`Fetching orders for students: ${studentIds.join(', ')}`);
    try {
      const response = await apiGet<{ data: any[] }>('pedidos');
      const allOrders = response.data.map(mapOrder);
      const studentIdSet = new Set(studentIds.map(String));
      return allOrders.filter(o => o.studentId && studentIdSet.has(o.studentId));
    } catch(e) {
      console.error(`Failed to fetch orders for students:`, e);
      return [];
    }
}

export const postOrder = async (orderData: any): Promise<Order> => {
    console.log('Posting new order', orderData);
    const payload = {
        aluno_id: orderData.studentId,
        responsavel_id: orderData.userId, 
        produtos: orderData.items.map((item: any) => ({ id: item.productId, quantidade: item.quantity })),
        valor_total: orderData.total,
        status: 'Pendente',
    };
    const response = await apiPost<{data: any}>('pedidos', payload);
    return mapOrder(response.data);
}
// #endregion


// #region Wallet and Transaction Services
export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
    try {
        // Assuming API provides a way to get wallet by user ID
        // If the endpoint is /carteiras/{carteira_id}, this needs adjustment
        const response = await apiGet<{ data: any }>(`carteiras/user/${userId}`); // This route may need to be created
        return mapWallet(response.data);
    } catch (e) {
        console.error(`Failed to fetch wallet for user ${userId}:`, e);
        return null;
    }
}

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
    console.log(`Fetching transactions for user: ${userId}`);
    try {
        const response = await apiGet<{ data: any[] }>('transacoes');
        // This will require the backend to filter by user or return user_id in payload
        return response.data.map(mapTransaction).filter(t => t.userId === userId);
    } catch (e) {
        console.error(`Failed to fetch transactions for user ${userId}:`, e);
        return [];
    }
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
     console.log(`Fetching transactions for users: ${allUserIds.join(', ')}`);
    try {
        const response = await apiGet<{ data: any[] }>('transacoes');
        const allTransactions = response.data.map(mapTransaction);
        const userIdSet = new Set(allUserIds.map(String));
        return allTransactions.filter(t => t.userId && userIdSet.has(t.userId));
    } catch (e) {
        console.error(`Failed to fetch transactions for users:`, e);
        return [];
    }
}

export const postTransaction = async (transactionData: any) : Promise<Transaction> => {
    console.log('Posting new transaction', transactionData);
    const payload = {
        id_carteira: transactionData.walletId,
        descricao: transactionData.description,
        valor: transactionData.amount,
        tipo: transactionData.type,
        origem: transactionData.origin,
    };
    const response = await apiPost<{data: any}>('transacoes', payload);
    return mapTransaction(response.data);
}

export const rechargeBalance = async (targetId: string, amount: number): Promise<{success: boolean}> => {
    console.log(`Recharging balance for user ${targetId} with amount ${amount}`);
    // This assumes targetId is the user ID, and the backend can find the wallet.
    // If id_carteira is needed, we must fetch it first.
    await postTransaction({
        userId: targetId, // This might need to be translated to walletId by the backend
        description: `Recarga PIX no valor de R$ ${amount.toFixed(2)}`,
        amount: amount,
        type: 'credito',
        origin: 'PIX',
    });
    return { success: true };
}

export const internalTransfer = async (fromUserId: string, toUserId:string, amount: number): Promise<{success: boolean}> => {
    // This flow should ideally be a single, atomic endpoint in the backend.
    console.log(`Transferring ${amount} from ${fromUserId} to ${toUserId}`);
    
    // Debit from source
     await postTransaction({
        userId: fromUserId,
        description: `Transferência enviada para usuário ${toUserId}`,
        amount: amount,
        type: 'debito',
        origin: 'Transferência',
    });
    // Credit to destination
     await postTransaction({
        userId: toUserId,
        description: `Transferência recebida de usuário ${fromUserId}`,
        amount: amount,
        type: 'credito',
        origin: 'Transferência',
    });
    return { success: true };
}
// #endregion
