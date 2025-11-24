
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
    type Favorite 
} from '@/lib/data';
import { apiGet, apiPost, apiDelete, apiPatch } from './api';

export const mapUser = (user: any): User => ({
  id: user.id?.toString() ?? '',
  nome: user.nome ?? '',
  email: user.email ?? '',
  telefone: user.telefone ?? null,
  data_nascimento: user.data_nascimento ?? null,
  id_escola: user.id_escola?.toString() ?? null,
  id_cantina: user.id_cantina?.toString() ?? null,
  ativo: Boolean(user.ativo),
  role: user.roles?.[0]?.nome_role ?? 'Aluno',
  balance: parseFloat(user.carteira?.saldo ?? 0),
  dependentes: (user.dependentes || []).map((d: any) => mapUser(d)),
  codigo_aluno: user.codigo_aluno ?? null,
  carteira: user.carteira ? mapWallet(user.carteira) : null,
});

const mapSchool = (school: any): School => ({
    id: school.id_escola.toString(),
    nome: school.nome,
    cnpj: school.cnpj,
    status: school.status,
    id_endereco: school.id_endereco?.toString() || null,
    id_plano: school.id_plano?.toString() || null,
    qtd_alunos: school.qtd_alunos || 0,
});

const mapProduct = (product: any): Product => ({
    id_produto: product.id_produto?.toString() ?? '',
    id_cantina: product.id_cantina?.toString() ?? '',
    nome: product.nome ?? '',
    preco: parseFloat(product.preco ?? 0),
    ativo: Boolean(product.ativo),
    categoria: product.categoria ?? 'Salgado',
    url_imagem: product.url_imagem || null,
    popular: false, 
});

const mapCanteen = (canteen: any): Canteen => ({
    id: canteen.id_cantina.toString(),
    nome: canteen.nome,
    id_escola: canteen.id_escola.toString(),
    hr_abertura: canteen.hr_abertura,
    hr_fechamento: canteen.hr_fechamento,
    produtos: (canteen.produtos || []).map(mapProduct),
});

const mapFavorite = (favorite: any): Favorite => ({
    id: favorite.id_favorito?.toString() ?? '',
    id_user: favorite.id_user?.toString() ?? '',
    id_produto: favorite.id_produto?.toString() ?? '',
    produto: favorite.produto ? mapProduct(favorite.produto) : undefined,
});

const mapOrder = (order: any): Order => ({
    id: order.id_pedido?.toString() ?? '',
    id_destinatario: order.id_destinatario?.toString() ?? '',
    id_comprador: order.id_comprador?.toString() ?? '',
    id_cantina: order.id_cantina?.toString() ?? '',
    valor_total: parseFloat(order.valor_total ?? 0),
    created_at: order.created_at,
    items: (order.itens_pedido || order.items || []).map((p: any) => ({
        id_produto: p.id_produto?.toString() ?? '',
        nome_produto: p.produto?.nome ?? 'Produto desconhecido',
        quantidade: p.quantidade,
        preco_unitario: parseFloat(p.preco_unitario ?? 0),
        url_imagem: p.produto?.url_imagem || null,
    })),
    status: order.status ?? 'pendente',
});

const mapTransaction = (transaction: any): Transaction => ({
    id: transaction.id_transacao?.toString() ?? '',
    id_carteira: transaction.id_carteira?.toString() ?? '',
    created_at: transaction.created_at,
    descricao: transaction.descricao ?? 'Transação sem descrição',
    valor: parseFloat(transaction.valor ?? 0),
    tipo: transaction.tipo,
    id_user_autor: transaction.id_user_autor?.toString() ?? null,
    status: transaction.status,
});

const mapWallet = (wallet: any): Wallet => ({
    id: wallet.id_carteira?.toString() ?? '',
    id_user: wallet.id_user?.toString() ?? '',
    saldo: parseFloat(wallet.saldo ?? 0),
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
    const response = await apiGet<{ data: any[] }>('escolas');
    return response.data.map(mapSchool);
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

export const postOrder = async (orderData: { id_comprador: string; id_destinatario: string; id_cantina: string; valor_total: number; status: string, items: { id_produto: string; quantidade: number, preco_unitario: number }[] }): Promise<Order> => {
  const response = await apiPost<{ data: any }>('pedidos', orderData);
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
        nome: user.nome,
        carteira: user.carteira,
        balance: user.balance,
        dependentes: user.dependentes.map(s => ({
            id: s.id,
            nome: s.nome,
            balance: s.balance,
            carteira: s.carteira,
            escola: { nome: 'Escola não informada' } 
        })),
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
      nome: user.nome,
      carteira: user.carteira,
      balance: user.balance,
      codigo_aluno: user.codigo_aluno,
      id_escola: user.id_escola,
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
        id_user: userId,
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
