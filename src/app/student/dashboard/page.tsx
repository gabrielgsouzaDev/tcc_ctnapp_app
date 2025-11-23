
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-provider";
import { useCart } from "@/hooks/use-cart";
import { getCanteensBySchool } from '@/lib/services';
import { type Product, type Canteen } from '@/lib/data';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Check } from 'lucide-react';

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

  useEffect(() => {
    const fetchCanteenData = async () => {
      if (user?.schoolId) {
        setIsLoading(true);
        try {
          const canteenList = await getCanteensBySchool(user.schoolId);
          setCanteens(canteenList);
          if (canteenList.length > 0) {
            const defaultCanteen = canteenList[0];
            setSelectedCanteenId(defaultCanteen.id);
            setProducts(defaultCanteen.produtos || []); 
          }
        } catch (error) {
          console.error("Failed to fetch canteen data:", error);
          toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: 'Não foi possível buscar as informações da cantina.' });
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (user && !isUserLoading) {
      fetchCanteenData();
    }
  }, [user, isUserLoading, toast]);

  const handleCanteenChange = (canteenId: string) => {
    const newSelectedCanteen = canteens.find(c => c.id === canteenId);
    if (newSelectedCanteen) {
        setSelectedCanteenId(newSelectedCanteen.id);
        setProducts(newSelectedCanteen.produtos || []);
    }
  };

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

  if (isLoading || isUserLoading) {
    return (
        <div className="space-y-6 animate-pulse">
             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-4 bg-muted rounded w-64 mt-2"></div>
                </div>
                 <div className="h-10 bg-muted rounded w-[200px]"></div>
             </div>
             <div className="space-y-4">
                 <div className="h-10 bg-muted rounded w-full"></div>
                 <div className="flex flex-wrap items-center gap-2">
                    {[...Array(5)].map((_,i) => <div key={i} className="h-10 w-24 bg-muted rounded-md"></div>)}
                 </div>
             </div>
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => <Card key={i} className="h-96" />)}
             </div>
        </div>
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
          return (
          <Card key={product.id} className="relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
            {product.popular && (
                <Badge className="absolute top-2 left-2 z-10 bg-amber-400 text-amber-900 gap-1 hover:bg-amber-400 border-amber-500">
                    <Star className="h-3 w-3" /> Popular
                </Badge>
            )}
            <CardHeader className="p-0">
              <Image
                src={product.image.imageUrl}
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
