// src/lib/services.ts
import { type School, type StudentProfile, type GuardianProfile, type Canteen, type Product, type Transaction, type Order, type User, type Wallet, type Favorite } from '@/lib/data';
import { apiGet, apiPost, apiDelete, apiPatch } from './api';
import { PlaceHolderImages } from './placeholder-images';

const createLocalImageUrl = (remoteUrl: string | null | undefined): string => {
    if (!remoteUrl) {
      return PlaceHolderImages[0].imageUrl;
    }
    const fileName = remoteUrl.split('/').pop();
    return fileName ? `/images/${fileName}` : PlaceHolderImages[0].imageUrl;
};

const mapRole = (roleName: string | undefined | null): User['role'] => {
  if (!roleName) return 'Aluno';
  const normalized = String(roleName).trim().toLowerCase();
  if (['student', 'aluno', 'estudante'].includes(normalized)) return 'Aluno';
  if (['guardian', 'responsavel', 'responsável'].includes(normalized)) return 'Responsavel';
  if (['admin', 'administrator'].includes(normalized)) return 'Admin';
  if (['cantina', 'canteen'].includes(normalized)) return 'Cantina';
  if (['escola', 'school'].includes(normalized)) return 'Escola';
  return 'Aluno';
};

export const mapUser = (user: any): User => ({
  id: user.id?.toString() ?? '',
  walletId: user.carteira?.id_carteira?.toString() || null,
  name: user.nome ?? user.name ?? '',
  email: user.email ?? '',
  telefone: user.telefone ?? null,
  data_nascimento: user.data_nascimento ?? null,
  ativo: Boolean(user.ativo),
  schoolId: user.id_escola?.toString() ?? null,
  canteenId: user.id_cantina?.toString() ?? null,
  role: mapRole(user.roles?.[0]?.nome_role ?? user.role),
  balance: parseFloat(user.carteira?.saldo ?? 0),
  students: user.dependentes?.map((d: any) => mapUser(d)) || [],
  student_code: user.codigo_aluno ?? null,
});

const mapSchool = (school: any): School => ({
  id: school.id_escola.toString(),
  name: school.nome,
  cnpj: school.cnpj,
  status: school.status,
  qtd_alunos: school.qtd_alunos,
});

const mapProduct = (product: any): Product => ({
  id: product.id_produto?.toString() ?? '',
  canteenId: product.id_cantina?.toString() ?? '',
  name: product.nome ?? '',
  price: parseFloat(product.preco ?? 0),
  ativo: Boolean(product.ativo),
  category: product.categoria ?? 'Salgado',
  image: {
    id: product.id_produto?.toString() ?? '',
    imageUrl: createLocalImageUrl(product.url_imagem),
    imageHint: `Image of ${product.nome}`,
    description: `Image for the product ${product.nome}`,
  },
  popular: false,
});

const mapCanteen = (canteen: any): Canteen => ({
  id: canteen.id_cantina.toString(),
  name: canteen.nome,
  schoolId: canteen.id_escola.toString(),
  hr_abertura: canteen.hr_abertura,
  hr_fechamento: canteen.hr_fechamento,
  produtos: (canteen.produtos || []).map(mapProduct),
});

const mapFavorite = (favorite: any): Favorite => ({
  id: favorite.id_favorito?.toString() ?? '',
  userId: favorite.id_user?.toString() ?? '',
  productId: favorite.id_produto?.toString() ?? '',
  product: favorite.produto ? mapProduct(favorite.produto) : undefined,
});

const mapOrder = (order: any): Order => ({
  id: order.id_pedido?.toString() ?? '',
  studentId: order.id_destinatario?.toString() ?? '',
  userId: order.id_comprador?.toString() ?? '',
  canteenId: order.id_cantina?.toString() ?? '',
  total: parseFloat(order.valor_total ?? 0),
  date: order.created_at,
  items:
    order.item_pedidos?.map((p: any) => ({
      productId: p.id_produto?.toString() ?? '',
      productName: p.produto?.nome ?? '',
      quantity: p.quantidade,
      unitPrice: parseFloat(p.preco_unitario ?? 0),
      image: {
          id: p.id_produto?.toString() ?? '',
          imageUrl: createLocalImageUrl(p.produto?.url_imagem),
          imageHint: '-',
          description: '-'
      },
    })) || [],
  status: order.status ?? 'pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
  id: transaction.id_transacao?.toString() ?? '',
  walletId: transaction.id_carteira?.toString() ?? '',
  date: transaction.created_at,
  description: transaction.descricao ?? 'Transação sem descrição',
  amount: parseFloat(transaction.valor ?? 0),
  type: ['PIX', 'Recarregar', 'Estorno'].includes(transaction.tipo) ? 'credit' : 'debit',
  origin: transaction.tipo,
  userId: transaction.id_user_autor?.toString() ?? '',
  status: transaction.status,
});

const mapWallet = (wallet: any): Wallet => ({
  id: wallet.id_carteira?.toString() ?? '',
  userId: wallet.id_user?.toString() ?? '',
  balance: parseFloat(wallet.saldo ?? 0),
});

// --- API functions ---

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const response = await apiGet<{ data: any }>(`users/${userId}`);
    return mapUser(response.data);
  } catch (e) {
    console.error(`Failed to fetch user ${userId}:`, e);
    return null;
  }
};

export const getSchools = async (): Promise<School[]> => {
  try {
    const response = await apiGet<any>('escolas');
    if (response && Array.isArray(response.data)) return response.data.map(mapSchool);
    if (Array.isArray(response)) return response.map(mapSchool);
    console.error('Unexpected response format for schools:', response);
    return [];
  } catch (e) {
    console.error('Failed to fetch schools:', e);
    return [];
  }
};

export const getCanteensBySchool = async (schoolId: string): Promise<Canteen[]> => {
  if (!schoolId) return [];
  try {
    const response = await apiGet<{ data: any[] }>(`cantinas/escola/${schoolId}`);
    return response.data.map(mapCanteen);
  } catch (e) {
    console.error(`Failed to fetch canteens for school ${schoolId}:`, e);
    return [];
  }
};

export const getProductsByCanteen = async (canteenId: string): Promise<Product[]> => {
  if (!canteenId) return [];
  try {
    const response = await apiGet<{ data: any[] }>(`cantinas/${canteenId}/produtos`);
    return response.data.map(mapProduct);
  } catch (e) {
    console.error(`Failed to fetch products for canteen ${canteenId}:`, e);
    return [];
  }
};

export const getFavoritesByUser = async (userId: string): Promise<Favorite[]> => {
  if (!userId) return [];
  try {
    const response = await apiGet<{ data: any[] }>(`favoritos/${userId}`);
    return response.data.map(mapFavorite);
  } catch (e) {
    console.error(`Failed to fetch favorites for user ${userId}:`, e);
    return [];
  }
};

export const addFavorite = async (userId: string, productId: string): Promise<Favorite | null> => {
  try {
    const payload = { id_user: userId, id_produto: productId };
    const response = await apiPost<{ data: any }>('favoritos', payload);
    return mapFavorite(response.data);
  } catch (e) {
    console.error('Failed to add favorite:', e);
    return null;
  }
};

export const removeFavorite = async (userId: string, productId: string): Promise<void> => {
  try {
    await apiDelete(`favoritos/${userId}/${productId}`);
  } catch (e) {
    console.error('Failed to remove favorite:', e);
  }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  if (!userId) return [];
  try {
    const response = await apiGet<{ data: any[] }>(`pedidos/usuario/${userId}`);
    return response.data.map(mapOrder);
  } catch (e) {
    console.error(`Failed to fetch orders for user ${userId}:`, e);
    return [];
  }
};

export const postOrder = async (orderData: any): Promise<Order> => {
  const payload = {
    id_comprador: orderData.userId,
    id_destinatario: orderData.studentId,
    id_cantina: orderData.canteenId,
    items: orderData.items.map((item: any) => ({
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price,
      id_produto: item.product.id,
      quantidade: item.quantity,
      preco_unitario: item.product.price,
    })),
    valor_total: orderData.total,
    status: 'pendente',
  };
  const response = await apiPost<{ data: any }>('pedidos', payload);
  return mapOrder(response.data);
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const payload = { status };
  const response = await apiPatch<{ data: any }>(`pedidos/${orderId}/status`, payload);
  return mapOrder(response.data);
};

export const getGuardianProfile = async (guardianId: string): Promise<GuardianProfile | null> => {
    if (!guardianId) return null;
    try {
      const response = await apiGet<{ data: any }>(`users/${guardianId}`);
      const user = mapUser(response.data);
  
      return {
        id: user.id,
        name: user.name,
        walletId: user.walletId,
        balance: user.balance,
        students: user.students,
      };
    } catch (e) {
      console.error(`Failed to fetch guardian profile ${guardianId}:`, e);
      return null;
    }
  };
  
  export const getStudentProfile = async (studentId: string): Promise<StudentProfile | null> => {
    if (!studentId) return null;
    try {
      const response = await apiGet<{ data: any }>(`users/${studentId}`);
      const user = mapUser(response.data);
  
      return {
        id: user.id,
        name: user.name,
        walletId: user.walletId,
        balance: user.balance,
        student_code: user.student_code,
        schoolId: user.schoolId,
      };
    } catch (e) {
      console.error(`Failed to fetch student profile ${studentId}:`, e);
      return null;
    }
  };
  

export const getWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  try {
    const response = await apiGet<{ data: any }>(`carteiras/${userId}`);
    return mapWallet(response.data);
  } catch (e) {
    console.error(`Failed to fetch wallet for user ${userId}:`, e);
    return null;
  }
};

export const getTransactionsByUser = async (userId: string): Promise<Transaction[]> => {
  if (!userId) return [];
  try {
    const response = await apiGet<{ data: any[] }>(`transacoes/usuario/${userId}`);
    return response.data.map(mapTransaction);
  } catch (e) {
    console.error(`Failed to fetch transactions for user ${userId}:`, e);
    return [];
  }
};


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
        uuid: transactionData.uuid,
        descricao: transactionData.description,
        valor: transactionData.amount,
        tipo: transactionData.origin,
        status: 'confirmada',
    };
    const response = await apiPost<{data: any}>('transacoes', payload);
    return mapTransaction(response.data);
}

export const rechargeBalance = async (walletId: string, userId: string, amount: number, uuid: string): Promise<{success: boolean}> => {
    await postTransaction({
        walletId: walletId,
        userId: userId,
        uuid: uuid,
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

export const linkStudentToGuardian = async (guardianId: string, studentCode: string): Promise<void> => {
    const payload = {
        id_responsavel: guardianId,
        codigo_aluno: studentCode
    };
    try {
        await apiPost('responsavel/vincular-aluno', payload);
    } catch (error) {
        console.error(`Failed to link student with code ${studentCode} to guardian ${guardianId}:`, error);
        throw error;
    }
};
