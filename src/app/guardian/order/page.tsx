
"use client";

import { CreditCard, User, Wallet, Search, ShoppingBasket, ShoppingCart, Trash2, MinusCircle, PlusCircle, Heart, Check, Star, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { type Product, type Canteen, type Student } from '@/lib/data';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

type Category = 'Todos' | 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';
type CartItem = {
  product: Product;
  quantity: number;
};
type AddToCartState = {
  [productId: string]: 'idle' | 'added';
}

export default function GuardianOrderPage() {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolId, setSchoolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>('');
  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [addToCartState, setAddToCartState] = useState<AddToCartState>({});
  const [studentForOrder, setStudentForOrder] = useState<string>('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await api.get('/perfil/responsavel');
        const userSchoolId = profileRes.data.schoolId; // Assuming profile has schoolId
        const userStudents = profileRes.data.students;

        setSchoolId(userSchoolId);
        setStudents(userStudents);

        if (userStudents.length > 0) {
          setStudentForOrder(userStudents[0].id);
        }

        if (userSchoolId) {
          const canteensRes = await api.get(`/cantinas/${userSchoolId}`);
          setCanteens(canteensRes.data);

          if (canteensRes.data.length > 0) {
            setSelectedCanteen(canteensRes.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch order page data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar página",
          description: "Não foi possível buscar os dados de perfil e cantinas.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  useEffect(() => {
    // Fetch products whenever the selected canteen changes
    if (!selectedCanteen) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const productsRes = await api.get(`/produtos/${selectedCanteen}`);
        setProducts(productsRes.data);
      } catch (error) {
        console.error(`Failed to fetch products for canteen ${selectedCanteen}:`, error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar cardápio",
          description: "Não foi possível buscar os produtos desta cantina.",
        });
      }
    };
    fetchProducts();
  }, [selectedCanteen, toast]);

  useEffect(() => {
    // Check for items to repeat from local storage (e.g., from order history)
    const itemsToRepeat = localStorage.getItem('cart-repeat');
    if (itemsToRepeat) {
      try {
        const parsedItems: { product: Product; quantity: number }[] = JSON.parse(itemsToRepeat);
        setCart(currentCart => {
          const newCart = [...currentCart];
          parsedItems.forEach(itemToRepeat => {
            const existingItemIndex = newCart.findIndex(
              cartItem => cartItem.product.id === itemToRepeat.product.id
            );
            if (existingItemIndex > -1) {
              newCart[existingItemIndex].quantity += itemToRepeat.quantity;
            } else {
              newCart.push(itemToRepeat);
            }
          });
          return newCart;
        });
      } catch (e) {
        console.error("Failed to parse repeat items from storage", e);
      } finally {
        localStorage.removeItem('cart-repeat');
      }
    }
  }, []);

  const studentsMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach(student => {
      map.set(student.id, student.name);
    });
    return map;
  }, [students]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(searchTermProducts.toLowerCase())
      )
      .filter((p) => {
        if (selectedCategory === 'Todos') return true;
        return p.category === selectedCategory;
      });
  }, [searchTermProducts, selectedCategory, products]);

  const handleAddToCartVisuals = (product: Product) => {
    setAddToCartState(prev => ({ ...prev, [product.id]: 'added' }));
    setTimeout(() => {
       setAddToCartState(prev => ({ ...prev, [product.id]: 'idle' }));
    }, 1500);
     if (!cart.some(item => item.product.id === product.id)) {
        toast({
            title: `${product.name} adicionado!`,
            description: "O item está no seu carrinho.",
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

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    .toFixed(2);
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
        toast({ variant: "destructive", title: "Carrinho vazio!" });
        return;
    }
    if (!studentForOrder) {
       toast({
          variant: "destructive",
          title: "Selecione um aluno",
          description: "Você precisa escolher para qual aluno o pedido será feito.",
      });
      return;
    }
    
    try {
        await api.post('/pedido', {
            id_aluno: studentForOrder,
            items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
            total: parseFloat(cartTotal),
        });
        toast({
            title: "Pedido realizado com sucesso!",
            description: `O pedido foi feito para ${studentsMap.get(studentForOrder)} e pode ser acompanhado no histórico.`,
        });
        setCart([]);
    } catch (error: any) {
         toast({
          variant: "destructive",
          title: "Erro ao finalizar pedido",
          description: error.response?.data?.message || "Não foi possível completar o pedido. Tente novamente.",
      });
    }
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
          <h2 className="text-xl font-bold tracking-tight font-headline flex items-center gap-2">
              <ShoppingCart />
              Fazer um Pedido
          </h2>
          <p className="text-muted-foreground">
            Compre itens para seus alunos diretamente por aqui.
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
                <SheetTitle>Carrinho do Responsável</SheetTitle>
                <SheetDescription>Revise os itens antes de fazer o pedido para um aluno.</SheetDescription>
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
                            <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
                            <AlertDialogDescription>
                                Selecione o aluno e confirme os itens antes de finalizar.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="student-order-select">Fazer pedido para o aluno:</Label>
                              <Select value={studentForOrder} onValueChange={setStudentForOrder}>
                                <SelectTrigger id="student-order-select">
                                  <SelectValue placeholder="Selecione o aluno" />
                                </SelectTrigger>
                                <SelectContent>
                                  {students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Separator />
                            <div className="max-h-40 space-y-2 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={`confirm-${item.product.id}`} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                                        <span className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator/>
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
                <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
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
