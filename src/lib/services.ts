
import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order, type User, type Wallet, type Favorite } from '@/lib/data';
import { apiGet, apiPost, apiDelete } from './api';
import { PlaceHolderImages } from './placeholder-images';

// #region --- Mappers (From Backend Structure to Frontend Structure) ---

export const mapUser = (user: any): User => ({
    id: user.id.toString(),
    name: user.nome,
    email: user.email,
    telefone: user.telefone,
    data_nascimento: user.data_nascimento,
    ativo: user.ativo,
    schoolId: user.id_escola?.toString() || null,
    canteenId: user.id_cantina?.toString() || null,
    role: user.roles?.[0]?.nome_role || 'Aluno', 
    balance: parseFloat(user.carteira?.saldo ?? 0),
    students: user.dependentes?.map(mapUser) || [],
});

const mapSchool = (school: any): School => ({
    id: school.id_escola.toString(),
    name: school.nome,
    cnpj: school.cnpj,
    status: school.status,
    qtd_alunos: school.qtd_alunos,
});

const mapCanteen = (canteen: any): Canteen => ({
    id: canteen.id_cantina.toString(),
    name: canteen.nome,
    schoolId: canteen.id_escola.toString(),
    hr_abertura: canteen.hr_abertura,
    hr_fechamento: canteen.hr_fechamento,
    produtos: canteen.produtos?.map(mapProduct) || [], 
});

const mapProduct = (product: any): Product => ({
    id: product.id_produto.toString(),
    canteenId: product.id_cantina.toString(),
    name: product.nome,
    price: parseFloat(product.preco),
    ativo: product.ativo,
    category: product.categoria || 'Salgado',
    image: product.url_imagem
        ? { 
            id: product.id_produto.toString(), 
            imageUrl: product.url_imagem, 
            imageHint: `Image of ${product.nome}`,
            description: `Image for the product ${product.nome}`
          }
        : PlaceHolderImages[0],
    popular: false,
});

// ✅ NOVO: Mapper para os favoritos que vêm do backend.
const mapFavorite = (favorite: any): Favorite => ({
    id: favorite.id_favorito.toString(),
    userId: favorite.id_user.toString(),
    productId: favorite.id_produto.toString(),
    // O produto pode vir aninhado dentro do favorito
    product: favorite.produto ? mapProduct(favorite.produto) : undefined,
});

const mapOrder = (order: any): Order => ({
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
        image: p.produto.url_imagem ? { id: p.id_produto, imageUrl: p.produto.url_imagem, imageHint: '-', description: '-'} : PlaceHolderImages[0],
    })) || [],
    status: order.status || 'pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
    id: transaction.id_transacao.toString(),
    walletId: transaction.id_carteira.toString(),
    date: transaction.created_at,
    description: transaction.descricao || 'Transação sem descrição',
    amount: parseFloat(transaction.valor),
    type: ['PIX', 'Recarregar', 'Estorno'].includes(transaction.tipo) ? 'credit' : 'debit',
    origin: transaction.tipo,
    userId: transaction.id_user_autor?.toString() || '',
    status: transaction.status,
});

const mapWallet = (wallet: any): Wallet => ({
    id: wallet.id_carteira.toString(),
    userId: wallet.id_user.toString(),
    balance: parseFloat(wallet.saldo)
});

// #endregion


// #region --- API Service Functions ---

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
        if (user.students && user.students.length > 0) {
            guardianProfile.students = user.students as StudentProfile[];
        }
        return guardianProfile;
    }
    return null;
}

export const getSchools = async (): Promise<School[]> => {
  try {
    const response = await apiGet<any>('escolas');
    if (response && Array.isArray(response.data)) {
      return response.data.map(mapSchool);
    }
    if (Array.isArray(response)) {
      return response.map(mapSchool);
    }
    console.error("Unexpected response format for schools:", response);
    return [];
  } catch (e) {
    console.error("Failed to fetch schools:", e);
    return [];
  }
};

export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
    if (!schoolId) return [];
    try {
      const response = await apiGet<{ data: any[] }>(`cantinas/escola/${schoolId}`);
      return response.data.map(mapCanteen);
    } catch(e) {
      console.error(`Failed to fetch canteens for school ${schoolId}:`, e);
      return [];
    }
}

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
    if (!canteenId) return [];
    try {
      const response = await apiGet<{ data: any[] }>(`cantinas/${canteenId}/produtos`);
      return response.data.map(mapProduct);
    } catch(e) {
      console.error(`Failed to fetch products for canteen ${canteenId}:`, e);
      return [];
    }
}

// ✅ NOVO: Funções para interagir com a API de favoritos.
export const getFavoritesByUser = async (userId: string): Promise<Favorite[]> => {
    try {
        const response = await apiGet<{ data: any[] }>(`favoritos/${userId}`);
        return response.data.map(mapFavorite);
    } catch (e) {
        console.error(`Failed to fetch favorites for user ${userId}:`, e);
        return [];
    }
}

export const addFavorite = async (userId: string, productId: string): Promise<Favorite | null> => {
    try {
        const payload = { id_user: userId, id_produto: productId };
        const response = await apiPost<{ data: any }>('favoritos', payload);
        return mapFavorite(response.data);
    } catch (e) {
        console.error(`Failed to add favorite:`, e);
        return null;
    }
}

export const removeFavorite = async (userId: string, productId: string): Promise<void> => {
    try {
        await apiDelete(`favoritos/${userId}/${productId}`);
    } catch (e) {
        console.error(`Failed to remove favorite:`, e);
    }
}


export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    try {
      const response = await apiGet<{ data: any[] }>(`pedidos`);
      const allOrders = response.data.map(mapOrder);
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
        tipo: transactionData.origin,
        status: 'confirmada',
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

export const internalTransfer = async (fromWalletId: string, fromUserId: string, toWalletId: string, toUserId: string, amount: number): Promise<{success:boolean}> => {
    await postTransaction({
        walletId: fromWalletId,
        userId: fromUserId,
        description: `Transferência enviada para usuário ${toUserId}`,
        amount: -amount,
        origin: 'Debito',
    });
    await postTransaction({
        walletId: toWalletId,
        userId: fromUserId, 
        description: `Transferência recebida de usuário ${fromUserId}`,
        amount: amount,
        origin: 'Recarregar',
    });
    return { success: true };
}
// #endregion
