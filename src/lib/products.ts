
export interface Product {
  id: string;
  name: string;
  price: number;
  canteenId: string;
  imageUrl: string;
  isFavorite: boolean;
}

// Dados mocados para simular a resposta do banco de dados
const MOCKED_FAVORITES: Product[] = [
    {
        id: '1',
        name: 'Suco de Laranja',
        price: 5.50,
        canteenId: 'canteen-1',
        imageUrl: '/images/suco-de-laranja.png', // Caminho da imagem de exemplo
        isFavorite: true,
    },
    {
        id: '2',
        name: 'Sanduíche Natural',
        price: 8.00,
        canteenId: 'canteen-1',
        imageUrl: '/images/sanduiche-natural.png', // Caminho da imagem de exemplo
        isFavorite: true,
    },
];


// ✅ CORREÇÃO: A função agora retorna os dados mocados em vez de uma lista vazia.
export async function getFavoriteProducts(): Promise<Product[]> {
  console.log("getFavoriteProducts: Retornando dados mocados. Implementar busca real no banco de dados.");
  // Simula um pequeno atraso de rede
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCKED_FAVORITES);
    }, 500);
  });
}
