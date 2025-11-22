
import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order, type User, type Wallet } from '@/lib/data';
import { apiGet, apiPost } from './api';
import { PlaceHolderImages } from './placeholder-images';

// #region --- Mappers (From Backend Structure to Frontend Structure) ---

const mapUser = (user: any): User => ({
    ...user,
    id: user.id, // ID is already a number
    name: user.nome,
    schoolId: user.id_escola,
    role: user.roles?.[0]?.nome_role || 'Aluno', 
    balance: parseFloat(user.carteira?.saldo ?? 0),
    students: user.dependentes?.map(mapUser) || [],
});

const mapSchool = (school: any): School => ({
    ...school,
    id: school.id_escola.toString(),
    name: school.nome,
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
    category: 'Salgado', // Placeholder - backend needs to provide this
    popular: [2, 4].includes(product.id_produto), // Mock popular items
});

const mapOrder = (order: any): Order => ({
    ...order,
    id: order.id_pedido.toString(),
    studentId: order.id_destinatario.toString(),
    userId: order.id_comprador.toString(),
    canteenId: order.id_cantina.toString(),
    total: parseFloat(order.valor_total),
    date: order.created_at,
    items: order.item_pedidos?.map((p: any) => ({
        productId: p.id_produto.toString(),
        productName: p.produto.nome,
        quantity: p.quantidade,
        unitPrice: parseFloat(p.preco_unitario),
        image: PlaceHolderImages.find(img => img.id.includes(p.produto.nome.split(' ')[0].toLowerCase())) || PlaceHolderImages[0],
    })) || [],
    status: order.status || 'pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
    ...transaction,
    id: transaction.id_transacao.toString(),
    walletId: transaction.id_carteira.toString(),
    date: transaction.created_at,
    description: transaction.descricao || 'Transação sem descrição',
    amount: parseFloat(transaction.valor),
    type: ['PIX', 'Recarregar', 'Estorno'].includes(transaction.tipo) ? 'credit' : 'debit',
    origin: transaction.tipo,
    userId: transaction.id_user_autor?.toString() || '',
});

const mapWallet = (wallet: any): Wallet => ({
    ...wallet,
    id: wallet.id_carteira.toString(),
    userId: wallet.id_user.toString(),
    balance: parseFloat(wallet.saldo)
});

// #endregion


// #region --- API Service Functions ---

// -- User and Profile Services --
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
  if (user && user.role === 'Aluno') {
    return user as StudentProfile;
  }
  return null;
}

export const getGuardianProfile = async (userId: string): Promise<GuardianProfile | null> => {
    const user = await getUser(userId);
    if (user && user.role === 'Responsavel') {
        const guardianProfile = user as GuardianProfile;
        
        // The `dependentes` relation from the backend is mapped to `students`
        if (user.students && user.students.length > 0) {
            guardianProfile.students = user.students as StudentProfile[];
        }
        
        return guardianProfile;
    }
    return null;
}

// -- School and Canteen Services --
export const getSchools = async (): Promise<School[]> => {
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
    try {
      // Uses the dedicated route from the final api.php
      const response = await apiGet<{ data: any[] }>(`cantinas/escola/${schoolId}`);
      return response.data.map(mapCanteen);
    } catch(e) {
      console.error(`Failed to fetch canteens for school ${schoolId}:`, e);
      return [];
    }
}

// -- Product Services --
export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    if (!canteenId) return [];
    try {
      // Uses the dedicated route from the final api.php
      const response = await apiGet<{ data: any[] }>(`cantinas/${canteenId}/produtos`);
      return response.data.map(mapProduct);
    } catch(e) {
      console.error(`Failed to fetch products for canteen ${canteenId}:`, e);
      return [];
    }
}

// -- Order Services --
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    try {
      const response = await apiGet<{ data: any[] }>(`pedidos`);
      const allOrders = response.data.map(mapOrder);
      // Filter orders where the user is either the buyer or the recipient
      return allOrders.filter(o => o.userId === userId || o.studentId === userId);
    } catch(e) {
      console.error(`Failed to fetch orders for user ${userId}:`, e);
      return [];
    }
}

export const getOrdersByGuardian = async (studentIds: string[]): Promise<Order[]> => {
    if (!studentIds || studentIds.length === 0) return Promise.resolve([]);
    try {
      const response = await apiGet<{ data: any[] }>('pedidos');
      const allOrders = response.data.map(mapOrder);
      const studentIdSet = new Set(studentIds.map(id => id.toString()));
      return allOrders.filter(o => o.studentId && studentIdSet.has(o.studentId));
    } catch(e) {
      console.error(`Failed to fetch orders for students:`, e);
      return [];
    }
}

export const postOrder = async (orderData: any): Promise<Order> => {
    const payload = {
        id_comprador: orderData.userId, 
        id_destinatario: orderData.studentId,
        id_cantina: orderData.canteenId,
        produtos: orderData.items.map((item: any) => ({ 
            id_produto: item.productId, 
            quantidade: item.quantity,
            preco_unitario: item.unitPrice,
        })),
        valor_total: orderData.total,
        status: 'pendente',
    };
    const response = await apiPost<{data: any}>('pedidos', payload);
    return mapOrder(response.data);
}

// -- Wallet and Transaction Services --
export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
    try {
        const response = await apiGet<{ data: any }>(`carteiras/${userId}`);
        return mapWallet(response.data);
    } catch (e) {
        console.error(`Failed to fetch wallet for user ${userId}:`, e);
        return null;
    }
}

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
    try {
        const response = await apiGet<{ data: any[] }>('transacoes');
        const allTransactions = response.data.map(mapTransaction);
        return allTransactions.filter(t => t.userId === userId);
    } catch (e) {
        console.error(`Failed to fetch transactions for user ${userId}:`, e);
        return [];
    }
}

export const getTransactionsByGuardian = async (allUserIds: string[]): Promise<Transaction[]> => {
     if (!allUserIds || allUserIds.length === 0) return Promise.resolve([]);
    try {
        const response = await apiGet<{ data: any[] }>('transacoes');
        const allTransactions = response.data.map(mapTransaction);
        const userIdSet = new Set(allUserIds.map(String));
        // A transaction belongs to a guardian view if the author is one of the users in the family
        return allTransactions.filter(t => t.userId && userIdSet.has(t.userId));
    } catch (e) {
        console.error(`Failed to fetch transactions for users:`, e);
        return [];
    }
}

export const postTransaction = async (transactionData: any) : Promise<Transaction> => {
    const payload = {
        id_carteira: transactionData.walletId,
        id_user_autor: transactionData.userId,
        descricao: transactionData.description,
        valor: transactionData.amount,
        tipo: transactionData.origin, // 'PIX', 'Debito', etc.
        status: 'confirmada', // Assuming direct confirmation for now
    };
    const response = await apiPost<{data: any}>('transacoes', payload);
    return mapTransaction(response.data);
}

export const rechargeBalance = async (walletId: string, userId: string, amount: number): Promise<{success: boolean}> => {
    await postTransaction({
        walletId: walletId,
        userId: userId,
        description: `Recarga PIX no valor de R$ ${amount.toFixed(2)}`,
        amount: amount,
        origin: 'PIX',
    });
    return { success: true };
}

export const internalTransfer = async (fromWalletId: string, fromUserId: string, toWalletId: string, toUserId: string, amount: number): Promise<{success: boolean}> => {
    // Debit from guardian's wallet
    await postTransaction({
        walletId: fromWalletId,
        userId: fromUserId,
        description: `Transferência enviada para usuário ${toUserId}`,
        amount: -amount, // Negative amount for debit
        origin: 'Debito',
    });
    // Credit to student's wallet
    await postTransaction({
        walletId: toWalletId,
        userId: fromUserId, // The author is still the guardian
        description: `Transferência recebida de usuário ${fromUserId}`,
        amount: amount,
        origin: 'Recarregar',
    });
    return { success: true };
}
// #endregion
