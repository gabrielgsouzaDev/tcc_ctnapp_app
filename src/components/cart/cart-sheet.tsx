'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-provider";
import { postOrder } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// ✅ NOVO: Função helper para criar um atraso.
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CartItemCard = ({ item }: { item: any }) => {
  const { updateItemQuantity } = useCart();

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
          <Image src={item.product.image.imageUrl} alt={item.product.name} width={64} height={64} className="object-cover" />
        </div>
        <div>
          <h3 className="font-semibold text-base">{item.product.name}</h3>
          <p className="text-sm text-muted-foreground">R$ {item.product.price.toFixed(2)}</p>
          <Button variant="ghost" size="icon" className="-ml-2 mt-1 h-8 w-8" onClick={() => updateItemQuantity(item.product.id, 0)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.product.id, item.quantity - 1)}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center font-medium">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const CartSheet = () => {
  const { user, refreshUser } = useAuth();
  const { cartItems, cartCount, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCheckout = async () => {
    if (!user || !user.id || !cartItems[0]?.product.canteenId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível identificar o usuário ou a cantina. Tente novamente.' });
      return;
    }

    if (user.balance < totalPrice) {
      toast({ variant: 'destructive', title: 'Saldo insuficiente', description: 'Por favor, recarregue sua carteira para continuar.' });
      return;
    }

    setIsCheckingOut(true);
    try {
      await postOrder({
        userId: user.id,
        studentId: user.id, // Em um cenário de responsável, este seria o ID do aluno selecionado
        canteenId: cartItems[0].product.canteenId,
        items: cartItems,
        total: totalPrice,
      });

      toast({ variant: 'success', title: 'Pedido realizado com sucesso!', description: 'Você pode acompanhar o status na página de pedidos.' });
      
      // ✅ CORRIGIDO: Adicionado atraso para evitar condição de corrida antes de atualizar os dados do usuário.
      await delay(1500);
      if (refreshUser) await refreshUser();
      
      clearCart();
      setIsSheetOpen(false);
      router.push('/student/orders');

    } catch (error: any) {
      console.error('Falha ao finalizar pedido:', error);
      const apiErrorMessage = error.data?.message || error.message
      const errorMessage = apiErrorMessage || 'Não foi possível completar seu pedido. Tente novamente mais tarde.';
      toast({ variant: 'destructive', title: 'Erro ao criar pedido', description: errorMessage });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {cartCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0" variant="destructive">
              {cartCount}
            </Badge>
          )}
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Carrinho de Compras</SheetTitle>
        </SheetHeader>

        <Separator className="-mx-6" />

        {cartItems.length > 0 ? (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
            {cartItems.map((item) => (
              <CartItemCard key={item.product.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Seu carrinho está vazio</h3>
              <p className="text-sm text-muted-foreground">Adicione itens para começar um pedido.</p>
            </div>
          </div>
        )}

        {cartItems.length > 0 && (
          <>
            <Separator className="-mx-6 mt-auto" />
            <SheetFooter className="pt-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold gap-4">
                <p>Total</p>
                <p className="whitespace-nowrap">R$ {totalPrice.toFixed(2)}</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={isCheckingOut} className="w-full">
                    {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Finalizar Pedido
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a finalizar seu pedido no valor de R$ {totalPrice.toFixed(2)}. O valor será debitado do seu saldo. Você confirma?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCheckingOut}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckout} disabled={isCheckingOut}>
                      {isCheckingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};