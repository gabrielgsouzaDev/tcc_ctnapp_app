
"use client";

import {
  CreditCard, User, Wallet, Search, ShoppingCart,
  Trash2, MinusCircle, PlusCircle, Check, Star
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader,
  CardTitle, CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import {
  Sheet, SheetContent, SheetDescription, SheetFooter,
  SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  type Product, type Canteen,
  type OrderItem, type StudentLite, type StudentProfile
} from "@/lib/data";

import { getGuardianProfile, getStudentProfile, getCanteensBySchool, getProductsByCanteen, postOrder } from "@/lib/services";
import { useAuth } from "@/lib/auth-provider";

type Category = "Todos" | "Salgado" | "Doce" | "Bebida" | "Almoço";

type CartItem = {
  product: Product;
  quantity: number;
};

type AddToCartState = Record<string, "idle" | "added">;

export default function GuardianOrderPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [studentsLite, setStudentsLite] = useState<StudentLite[]>([]);
  const [studentsFull, setStudentsFull] = useState<StudentProfile[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("");

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTermProducts, setSearchTermProducts] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todos");
  const [addToCartState, setAddToCartState] = useState<AddToCartState>({});

useEffect(() => {
  const loadGuardian = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    const profile = await getGuardianProfile(user.id);
    if (!profile) {
      setIsLoading(false);
      return;
    }

    setStudentsLite(profile.students);

    if (profile.students.length > 0) {
      setSelectedStudent(profile.students[0].id);
    }

    setIsLoading(false);
  };

  if (!authLoading) loadGuardian();
}, [authLoading, user]);

useEffect(() => {
  const loadStudentsFull = async () => {
    if (studentsLite.length === 0) return;

    const fullProfiles: StudentProfile[] = [];

    for (const st of studentsLite) {
      const profile = await getStudentProfile(st.id);
      if (profile) fullProfiles.push(profile);
    }

    setStudentsFull(fullProfiles);

    if (!selectedStudent && fullProfiles.length > 0) {
      setSelectedStudent(fullProfiles[0].id);
    }
  };

  loadStudentsFull();
}, [studentsLite]);

useEffect(() => {
  const loadCanteens = async () => {
    if (!selectedStudent) return;

    const student = studentsFull.find((s) => s.id === selectedStudent);
    if (!student?.schoolId) return;

    const list = await getCanteensBySchool(student.schoolId);
    setCanteens(list);

    if (list.length > 0) {
      setSelectedCanteen(list[0].id);
    }
  };

  loadCanteens();
}, [selectedStudent, studentsFull]);

useEffect(() => {
  const loadProducts = async () => {
    if (!selectedCanteen) return;

    setIsLoadingProducts(true);

    const list = await getProductsByCanteen(selectedCanteen);
    setProducts(list);

    setIsLoadingProducts(false);
  };

  loadProducts();
}, [selectedCanteen]);

const getCartItemQuantity = (productId: string) => {
  return cart.find((item) => item.product.id === productId)?.quantity || 0;
};

const cartTotal = cart.reduce(
  (sum, item) => sum + item.product.price * item.quantity,
  0
);

const updateCart = (product: Product, qty: number) => {
  setCart((prev) => {
    const existing = prev.find((item) => item.product.id === product.id);

    if (existing) {
      const newQty = existing.quantity + qty;

      if (newQty <= 0) return prev.filter((i) => i.product.id !== product.id);

      return prev.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: newQty }
          : item
      );
    }

    if (qty > 0) return [...prev, { product, quantity: qty }];

    return prev;
  });
};

const removeFromCart = (productId: string) => {
  setCart((prev) => prev.filter((item) => item.product.id !== productId));

  toast({
    variant: "destructive",
    title: "Item removido",
    description: "O produto foi removido do carrinho.",
  });
};

const handleCheckout = async () => {
  if (cart.length === 0) {
    toast({ variant: "destructive", title: "Carrinho vazio!" });
    return;
  }

  const student = studentsFull.find((s) => s.id === selectedStudent);

  if (!student || !user) {
    toast({
      variant: "destructive",
      title: "Usuário ou aluno inválido",
    });
    return;
  }

  if (!student.schoolId) {
    toast({
      variant: "destructive",
      title: "Aluno sem escola vinculada!",
    });
    return;
  }

  if (!selectedCanteen) {
    toast({
      variant: "destructive",
      title: "Selecione uma cantina.",
    });
    return;
  }

  if (student.balance < cartTotal) {
    toast({
      variant: "destructive",
      title: "Saldo insuficiente",
      description: "O aluno não tem saldo suficiente.",
    });
    return;
  }

  try {
    const orderPayload = {
      id_comprador: user.id,
      id_destinatario: student.id,
      id_cantina: selectedCanteen,
      valor_total: cartTotal,
      status: 'pendente', // <<< ADICIONADO
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price
      })),
    };

    await postOrder(orderPayload);

    setStudentsFull((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? { ...s, balance: s.balance - cartTotal }
          : s
      )
    );

    setCart([]);

    toast({
      variant: "success",
      title: "Pedido realizado!",
      description: "Acompanhe no seu dashboard.",
    });
  } catch (e: any) {
    console.error("Checkout error:", e);
    toast({
      variant: "destructive",
      title: "Erro ao finalizar pedido",
      description: e.data?.message || e.message || 'Ocorreu um erro.'
    });
  }
};

const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

const categories: Category[] = ["Todos", "Salgado", "Doce", "Bebida", "Almoço"];

const filteredProducts = useMemo(() => {
  return products
    .filter((product) =>
      selectedCategory === "Todos"
        ? true
        : product.category === selectedCategory
    )
    .filter((product) =>
      product.name.toLowerCase().includes(searchTermProducts.toLowerCase())
    );
}, [products, selectedCategory, searchTermProducts]);

const handleAddToCartVisuals = (product: Product) => {
  setAddToCartState((prev) => ({ ...prev, [product.id]: "added" }));
  setTimeout(() => {
    setAddToCartState((prev) => ({ ...prev, [product.id]: "idle" }));
  }, 800);
};


return (
  <div className="space-y-6">

    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart />
          Fazer Pedido
        </h2>
        <p className="text-muted-foreground">
          Escolha um aluno, selecione a cantina e faça o pedido.
        </p>
      </div>

      <div className="flex items-center gap-2">

        <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Cantina" />
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
              {cart.length > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs"
                >
                  {totalCartItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Carrinho</SheetTitle>
              <SheetDescription>
                Revise os itens antes de finalizar.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio.</p>
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
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCart(item.product, -1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>

                          <span>{item.quantity}</span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCart(item.product, 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-sm font-semibold">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
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
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={cart.length === 0} className="w-full">
                      Finalizar Pedido
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
                      <AlertDialogDescription>
                        Escolha o aluno e confirme os itens.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="my-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Pedido para o aluno:</Label>
                        <Select
                          value={selectedStudent}
                          onValueChange={setSelectedStudent}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o aluno" />
                          </SelectTrigger>
                          <SelectContent>
                            {studentsFull.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={`confirm-${item.product.id}`}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-medium">
                              R$ {(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>R$ {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCheckout}>
                        Confirmar Pedido
                      </AlertDialogAction>
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
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>

    {isLoadingProducts ? (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-80" />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const qty = getCartItemQuantity(product.id);
          const added = addToCartState[product.id] === "added";

          return (
            <Card
              key={product.id}
              className="relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
            >
              {product.popular && (
                <Badge className="absolute top-2 left-2 z-10 bg-amber-400 text-amber-900 gap-1">
                  <Star className="h-3 w-3" /> Popular
                </Badge>
              )}

              <CardHeader className="p-0">
                <Image
                  src={product.image?.imageUrl || '/images/default.png'}
                  alt={product.name}
                  width={400}
                  height={200}
                  className="h-48 w-full rounded-t-lg object-cover"
                />
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-md font-semibold text-primary">
                      R$ {product.price.toFixed(2)}
                    </CardDescription>

                    {qty > 0 && (
                      <Badge variant="secondary">No carrinho: {qty}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full"
                  onClick={() => {
                    updateCart(product, 1);
                    handleAddToCartVisuals(product);
                  }}
                  variant={added ? "secondary" : "default"}
                >
                  {added ? (
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
          );
        })}
      </div>
    )}

    {filteredProducts.length === 0 && !isLoadingProducts && (
      <div className="col-span-full text-center text-muted-foreground py-10">
        Nenhum produto encontrado.
      </div>
    )}
  </div>
  );
}
