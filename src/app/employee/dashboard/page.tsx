
'use client';

import { ShoppingCart, Trash2, Search, MinusCircle, PlusCircle, Heart, Check, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type Product, type Canteen, mockCanteens, mockProducts, type Order, type OrderItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type CartItem = {
  product: Product;
  quantity: number;
};

type Category = 'Todos' | 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';

type AddToCartState = {
  [productId: string]: 'idle' | 'added';
}

export default function EmployeeDashboard() {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCanteen, setSelectedCanteen] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['prod-1', 'prod-7']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [addToCartState, setAddToCartState] = useState<AddToCartState>({});
  const [favoriteCategory, setFavoriteCategory] = useState<Category>('Todos');

   useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      // Simulate API calls with setTimeout
      setTimeout(() => {
        setCanteens(mockCanteens);
        if (mockCanteens.length > 0) {
          setSelectedCanteen(mockCanteens[0].id);
        }
        setIsLoading(false);
      }, 500);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Fetch products whenever the selected canteen changes
    if (!selectedCanteen) {
        setProducts([]);
        return;
    };

    // Simulate API call
    const fetchProducts = async () => {
        const canteenProducts = mockProducts.filter(p => p.canteenId === selectedCanteen);
        setProducts(canteenProducts);
    };
    fetchProducts();
  }, [selectedCanteen]);


  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((p) => {
        if (selectedCategory === 'Todos') return true;
        return p.category === selectedCategory;
      });
  }, [searchTerm, selectedCategory, products]);

  const handleAddToCartVisuals = (product: Product) => {
    setAddToCartState(prev => ({ ...prev, [product.id]: 'added' }));
    setTimeout(() => {
       setAddToCartState(prev => ({ ...prev, [product.id]: 'idle' }));
    }, 1500);
     if (!cart.some(item => item.product.id === product.id)) {
        toast({
            title: `${product.name} adicionado!`,
            description: "Seu item está no carrinho.",
        });
    }
  }
  
  const updateCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > 0) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
        } else {
          return prevCart.filter((item) => item.product.id !== product.id);
        }
      }
      if (quantity > 0) {
        return [...prevCart, { product, quantity }];
      }
      return prevCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
     toast({
        variant: "destructive",
        title: "Item removido!",
        description: "O produto foi removido do seu carrinho.",
    })
  };

  const toggleFavorite = (productId: string) => {
    const isFavorited = favorites.includes(productId);
    const product = products.find(p => p.id === productId);
    if (!product) return;
  
    setFavorites(prev => {
      if (isFavorited) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  
    if (isFavorited) {
      toast({
        variant: 'destructive',
        title: `${product.name} removido dos favoritos!`,
      });
    } else {
      toast({
        title: `${product.name} adicionado aos favoritos!`,
      });
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);
  
  const favoriteProducts = useMemo(() => {
    return mockProducts
      .filter(p => favorites.includes(p.id))
      .filter(p => favoriteCategory === 'Todos' || p.category === favoriteCategory);
  }, [favorites, favoriteCategory]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    .toFixed(2);
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
        toast({ variant: "destructive", title: "Carrinho vazio!" });
        return;
    }
    
    // Create a new order object
    const newOrder: Order = {
        id: `#PED-${Math.floor(Math.random() * 900) + 100}`,
        date: new Date().toISOString(),
        studentId: 'emp-001', // Mock employee ID
        status: 'Pendente',
        total: Number(cartTotal),
        items: cart,
    };

    // Retrieve existing orders from localStorage, add the new one, and save back
    try {
        const existingOrdersJSON = localStorage.getItem('employeeOrderHistory');
        const existingOrders: Order[] = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem('employeeOrderHistory', JSON.stringify(updatedOrders));
    } catch (error) {
        console.error("Failed to save order to localStorage", error);
    }
    
    toast({
        title: "Pedido realizado com sucesso!",
        description: `Você pode acompanhar o status em 'Pedidos'.`,
    });
    setCart([]);
  }

  const getCartItemQuantity = (productId: string) => {
    return cart.find(item => item.product.id === productId)?.quantity || 0;
  }

  const categories: Category[] = ['Todos', 'Salgado', 'Doce', 'Bebida', 'Almoço'];
  
  if (isLoading) {
    return (
        <div className="space-y-6 animate-pulse">
             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-4 bg-muted rounded w-64 mt-2"></div>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="h-10 bg-muted rounded w-[200px]"></div>
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                 </div>
             </div>
             <div className="space-y-4">
                 <div className="h-10 bg-muted rounded w-full"></div>
                 <div className="flex flex-wrap items-center gap-2">
                    {[...Array(5)].map((_,i) => <div key={i} className="h-10 w-24 bg-muted rounded-md"></div>)}
                 </div>
             </div>
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => <Card key={i} className="h-80" />)}
             </div>
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Cardápio da Cantina
          </h1>
          <p className="text-muted-foreground">
            Escolha seus produtos e faça seu pedido.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
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

           <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative shrink-0">
                    <Heart className="h-4 w-4" />
                     {favorites.length > 0 && (
                        <Badge
                            variant="default"
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 p-0 text-xs text-primary-foreground"
                        >
                            {favorites.length}
                        </Badge>
                     )}
                    <span className="sr-only">Abrir favoritos</span>
                </Button>
            </SheetTrigger>
             <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Meus Favoritos</SheetTitle>
                    <SheetDescription>Seus produtos preferidos em um só lugar.</SheetDescription>
                </SheetHeader>
                 <div className="flex-1 overflow-y-auto py-4">
                    <div className="mb-4 px-1">
                        <Label htmlFor="favorite-category-select" className="mb-2 block text-sm font-medium">Filtrar por categoria</Label>
                        <Select value={favoriteCategory} onValueChange={(value) => setFavoriteCategory(value as Category)}>
                            <SelectTrigger id="favorite-category-select">
                                <SelectValue placeholder="Filtrar por categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={`fav-cat-select-${category}`} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {favoriteProducts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <Heart className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                            Você ainda não tem favoritos.
                        </p>
                         <p className="text-sm text-muted-foreground/80">
                            Clique no coração dos produtos para adicioná-los aqui.
                        </p>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {favoriteProducts.map((product) => (
                        <div key={`fav-${product.id}`} className="flex items-center gap-4">
                            <Image
                              src={product.image.imageUrl}
                              alt={product.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-md object-cover"
                              data-ai-hint={product.image.imageHint}
                            />
                            <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm font-semibold">
                                R$ {product.price.toFixed(2)}
                            </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {updateCart(product, 1); handleAddToCartVisuals(product);}}>
                                Add
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => toggleFavorite(product.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
            </SheetContent>
           </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <ShoppingCart className="h-4 w-4" />
                {totalCartItems > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground"
                  >
                    {totalCartItems}
                  </Badge>
                )}
                <span className="sr-only">Abrir carrinho</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Meu Carrinho</SheetTitle>
                <SheetDescription>Revise seus itens antes de finalizar o pedido.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                        Seu carrinho está vazio.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4">
                        <Image
                          src={item.product.image.imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-md object-cover"
                          data-ai-hint={item.product.image.imageHint}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateCart(item.product, -1)}><MinusCircle className="h-4 w-4"/></Button>
                                <span>{item.quantity}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateCart(item.product, 1)}><PlusCircle className="h-4 w-4"/></Button>
                          </div>
                           <p className="text-sm font-semibold">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <SheetFooter>
                <div className="w-full space-y-4 border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>R$ {cartTotal}</span>
                    </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full" disabled={cart.length === 0}>
                            Finalizar Pedido
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar seu Pedido</AlertDialogTitle>
                            <AlertDialogDescription>
                                Revise os itens do seu pedido antes de confirmar. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={`confirm-${item.product.id}`} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                                        <span className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4"/>
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>R$ {cartTotal}</span>
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCheckout}>Confirmar Pedido</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Buscar produto..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(category => (
                <Button 
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                >
                    {category}
                </Button>
            ))}
          </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const quantityInCart = getCartItemQuantity(product.id);
          const isAdded = addToCartState[product.id] === 'added';
          return (
          <Card key={product.id} className="relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
             {product.popular && (
                <Badge className="absolute top-2 left-2 z-10 bg-amber-400 text-amber-900 gap-1 hover:bg-amber-400">
                    <Star className="h-3 w-3" /> Popular
                </Badge>
             )}
             <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2 z-10 rounded-full bg-background/70 h-8 w-8 hover:bg-background"
                onClick={() => toggleFavorite(product.id)}
            >
                <Heart className={cn("h-4 w-4 transition-colors", isFavorite(product.id) ? "text-red-500 fill-red-500" : "text-foreground")}/>
             </Button>
            <CardHeader className="p-0">
              <Image
                src={product.image.imageUrl}
                alt={product.name}
                width={400}
                height={200}
                className="h-48 w-full rounded-t-lg object-cover"
                data-ai-hint={product.image.imageHint}
              />
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-4">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-md font-semibold text-primary">
                    R$ {product.price.toFixed(2)}
                  </CardDescription>
                  {quantityInCart > 0 && (
                    <Badge variant="secondary">
                      No carrinho: {quantityInCart}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => {updateCart(product, 1); handleAddToCartVisuals(product);}}
                variant={isAdded ? 'secondary' : 'default'}
              >
                 {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Adicionado!
                  </>
                ) : (
                  "Adicionar ao Carrinho"
                )}
              </Button>
            </CardFooter>
          </Card>
        )})}
      </div>
       {filteredProducts.length === 0 && !isLoading && (
        <div className="col-span-full text-center text-muted-foreground py-10">
          <p>Nenhum produto encontrado para os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
