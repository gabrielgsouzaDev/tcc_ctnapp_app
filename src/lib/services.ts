
import { 
    type School, 
    type StudentProfile, 
    type GuardianProfile, 
    type Canteen, 
    type Product, 
    type Transaction, 
    type Order, 
    type User, 
    type Wallet, 
    type Favorite,
    type OrderItem,
    type StudentLite
} from '@/lib/data';
import { apiGet, apiPost, apiDelete, apiPatch } from './api';

export const mapUser = (user: any): User => ({
  id: user.id?.toString() ?? '',
  name: user.nome ?? user.name ?? 'Usuário',
  email: user.email ?? '',
  role: user.roles?.[0]?.nome_role ?? 'Aluno',
  balance: parseFloat(user.carteira?.saldo ?? 0),
  schoolId: user.id_escola?.toString() ?? null,
  canteenId: user.id_cantina?.toString() ?? null,
  students: (user.dependentes || []).map((s: any): StudentLite => ({
    id: s.id.toString(),
    name: s.nome,
    balance: parseFloat(s.carteira?.saldo ?? 0),
    walletId: s.carteira?.id_carteira?.toString() || null,
    school: s.escola ? { name: s.escola.nome } : null,
  })),
  telefone: user.telefone ?? null,
  data_nascimento: user.data_nascimento ?? null,
  ativo: Boolean(user.ativo),
  student_code: user.codigo_aluno ?? null,
  walletId: user.carteira?.id_carteira?.toString() || null,
});

const mapSchool = (school: any): School => ({
    id: school.id_escola.toString(),
    name: school.nome,
    cnpj: school.cnpj,
    status: school.status,
    qtd_alunos: school.qtd_alunos || 0,
});

const mapProduct = (product: any): Product => ({
    id: product.id_produto?.toString() ?? '',
    canteenId: product.id_cantina?.toString() ?? '',
    name: product.nome ?? 'Produto sem nome',
    price: parseFloat(product.preco ?? 0),
    ativo: Boolean(product.ativo),
    category: product.categoria ?? 'Salgado',
    image: {
      id: product.id_produto?.toString(),
      imageUrl: product.url_imagem || 'https://picsum.photos/seed/placeholder/400/200',
      imageHint: 'product image',
      description: product.nome
    },
    popular: false, // Este campo não vem do backend
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
    items: (order.itens_pedido || order.items || []).map((p: any): OrderItem => ({
        productId: p.id_produto?.toString() ?? '',
        productName: p.produto?.nome ?? 'Produto desconhecido',
        quantity: p.quantidade,
        unitPrice: parseFloat(p.preco_unitario ?? 0),
        image: {
            id: p.id_produto?.toString(),
            imageUrl: p.produto?.url_imagem || 'https://picsum.photos/seed/placeholder/400/200',
            imageHint: 'order item',
            description: p.produto?.nome,
        }
    })),
    status: order.status ?? 'pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
    id: transaction.id_transacao?.toString() ?? '',
    walletId: transaction.id_carteira?.toString() ?? '',
    date: transaction.created_at,
    description: transaction.descricao ?? 'Transação sem descrição',
    amount: parseFloat(transaction.valor ?? 0),
    type: transaction.tipo === 'CREDITO' ? 'credit' : 'debit',
    origin: transaction.tipo ?? 'Compra',
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
    // CORREÇÃO: A API de escolas retorna um array direto, não um objeto { data: [...] }
    const response = await apiGet<any[]>('escolas');
    // Aplica o .map diretamente na resposta
    return response.map(mapSchool);
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
    throw e;
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

export const postOrder = async (orderData: {
  id_comprador: string;
  id_destinatario: string;
  id_cantina: string;
  valor_total: number;
  status: string;
  items: { productId: string; quantity: number; unitPrice: number; }[];
}): Promise<Order> => {
  const payload = {
    ...orderData,
    items: orderData.items.map(item => ({
      id_produto: item.productId,
      quantidade: item.quantity,
      preco_unitario: item.unitPrice,
    }))
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
      const user = await getUser(guardianId);
      if (!user) return null;
  
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
    const user = await getUser(studentId);
    if (!user) return null;

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
    if (!userId) return null;
    try {
      const response = await apiGet<{ data: any }>(`carteiras/usuario/${userId}`);
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

export const rechargeBalance = async (userId: string, amount: number): Promise<{ success: boolean }> => {
    const payload = {
        user_id: userId,
        valor: amount
    };
    await apiPost('carteiras/recarregar', payload); 
    return { success: true };
}

export const linkStudentToGuardian = async (studentCode: string): Promise<void> => {
    const payload = {
        codigo_aluno: studentCode
    };
    try {
        await apiPost(`responsavel/vincular-aluno`, payload);
    } catch (error) {
        console.error(`Failed to link student with code ${studentCode}:`, error);
        throw error;
    }
};
