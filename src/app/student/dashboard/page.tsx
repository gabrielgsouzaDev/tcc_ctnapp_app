
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-provider";
import { useCart } from "@/hooks/use-cart";
import { getCanteensBySchool, getFavoritesByUser, addFavorite, removeFavorite } from '@/lib/services';
import { type Product, type Canteen } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Check } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type Category = 'Todos' | 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
type AddToCartState = {
  [productId: string]: 'idle' | 'added';
}

export default function StudentDashboardPage() {
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useAuth();
  const { addItem, cartItems } = useCart();

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);

  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [addToCartState, setAddToCartState] = useState<AddToCartState>({});

  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(new Set());

  const fetchInitialData = useCallback(async () => {
    if (user?.schoolId && user.id) {
      setIsLoading(true);
      try {
        const [canteenList, userFavorites] = await Promise.all([
          getCanteensBySchool(user.schoolId),
          getFavoritesByUser(user.id)
        ]);

        setCanteens(canteenList);
        if (canteenList.length > 0) {
          const defaultCanteen = canteenList[0];
          setSelectedCanteenId(defaultCanteen.id);
          setProducts(defaultCanteen.produtos || []); 
        }
        
        setFavoriteProductIds(new Set(userFavorites.map(fav => fav.productId)));

      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar as informações da página.' });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, toast]);


  useEffect(() => {
    if (user && !isUserLoading) {
      fetchInitialData();
    }
  }, [user, isUserLoading, fetchInitialData]);

  const handleCanteenChange = (canteenId: string) => {
    const newSelectedCanteen = canteens.find(c => c.id === canteenId);
    if (newSelectedCanteen) {
        setSelectedCanteenId(newSelectedCanteen.id);
        setProducts(newSelectedCanteen.produtos || []);
    }
  };

  const handleToggleFavorite = useCallback(async (productId: string) => {
    if (!user?.id) return;

    const originalFavorites = new Set(favoriteProductIds);
    const isCurrentlyFavorite = originalFavorites.has(productId);

    // Atualização Otimista: muda a UI imediatamente
    setFavoriteProductIds(prev => {
      const newFavorites = new Set(prev);
      if (isCurrentlyFavorite) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });

    try {
      if (isCurrentlyFavorite) {
        await removeFavorite(user.id, productId);
        toast({ title: "Removido dos favoritos" });
      } else {
        await addFavorite(user.id, productId);
        toast({ title: "Adicionado aos favoritos!", variant: "success" });
      }
    } catch (error) {
      console.error("Failed to update favorites", error);
      toast({ variant: 'destructive', title: 'Erro de Rede', description: 'Não foi possível atualizar. Revertendo ação.' });
      // Reverte a UI em caso de erro
      setFavoriteProductIds(originalFavorites);
    }
  }, [user?.id, favoriteProductIds, toast]);


  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter(p => p.name.toLowerCase().includes(searchTermProducts.toLowerCase()))
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory);
  }, [searchTermProducts, selectedCategory, products]);
  
  const getCartItemQuantity = (productId: string) => {
    return cartItems.find(item => item.product.id === productId)?.quantity || 0;
  }

  const handleAddToCart = (product: Product) => {
    const quantityInCart = getCartItemQuantity(product.id);
    addItem(product, 1);
    
    setAddToCartState(prev => ({ ...prev, [product.id]: 'added' }));
    setTimeout(() => {
       setAddToCartState(prev => ({ ...prev, [product.id]: 'idle' }));
    }, 1500);

    if (quantityInCart === 0) {
        toast({
            title: `${product.name} adicionado!`,
            description: "O item está no seu carrinho.",
            variant: "success"
        });
    }
  };

  const categories: Category[] = ['Todos', 'Salgado', 'Doce', 'Bebida', 'Almoço'];
  const defaultImage = PlaceHolderImages.find(p => p.id === 'default-product')?.imageUrl || '/images/default.png';

  if (isLoading || isUserLoading) {
    return (
        <div className="space-y-6 animate-pulse"> { /* Skeleton loader */ } </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cardápio</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.name || 'aluno'}! Escolha os itens para o seu pedido.
          </p>
        </div>
        <Select value={selectedCanteenId} onValueChange={handleCanteenChange} disabled={canteens.length <= 1}>
            <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Selecionar Cantina" />
            </SelectTrigger>
            <SelectContent>
                {canteens.map((canteen) => (
                <SelectItem key={canteen.id} value={canteen.id}>
                    {canteen.name}
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar produto..."
                className="pl-10 bg-background/50"
                value={searchTermProducts}
                onChange={(e) => setSearchTermProducts(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(category => (
                <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all"
                >
                    {category}
                </Button>
            ))}
          </div>
      </div>

       {(filteredProducts.length === 0 && !isLoading) ? (
        <div className="col-span-full text-center text-muted-foreground py-20 space-y-4">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50" strokeWidth={1}/>
            <p>Nenhum produto encontrado para os filtros selecionados.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const quantityInCart = getCartItemQuantity(product.id);
          const isAdded = addToCartState[product.id] === 'added';
          const isFavorite = favoriteProductIds.has(product.id);
          
          return (
          <Card key={product.id} className="relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader className="p-0 relative">
                <button 
                    onClick={() => handleToggleFavorite(product.id)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-background/60 rounded-full backdrop-blur-sm transition-all duration-200 ease-in-out hover:bg-background/80 active:scale-125"
                    aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                    <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                </button>
              <Image
                src={product.image?.imageUrl || defaultImage}
                alt={product.name}
                width={400}
                height={200}
                className="h-56 w-full rounded-t-lg object-cover"
              />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-4">
              <div>
                <CardTitle className="text-lg font-medium">{product.name}</CardTitle>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-lg font-semibold text-primary">
                    R$ {product.price.toFixed(2)}
                  </p>
                  {quantityInCart > 0 && (
                    <Badge variant="secondary" className="font-normal">
                      No carrinho: {quantityInCart}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full transition-colors"
                onClick={() => handleAddToCart(product)}
                variant={isAdded ? 'secondary' : 'default'}
                disabled={isAdded}
              >
                {isAdded ? (
                    <><Check className="mr-2 h-4 w-4" /> Adicionado!</>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </CardFooter>
          </Card>
        )})}
      </div>
       )}
    </div>
  );
}
