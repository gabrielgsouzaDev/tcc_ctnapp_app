
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-provider";
import { getFavoritesByUser, removeFavorite } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { type Product } from '@/lib/data';
import { Heart, Loader2, Search, ShoppingCart, X } from "lucide-react";
import { Badge } from '@/components/ui/badge';

type Category = 'Todos' | 'Salgado' | 'Doce' | 'Bebida' | 'Almoço';

const FavoriteProductCard = ({ product, onRemove, onAddToCart }: { product: Product, onRemove: (productId: string) => void, onAddToCart: (product: Product) => void }) => {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-4">
        <Image
          src={product.image.imageUrl}
          alt={product.name}
          width={64}
          height={64}
          className="rounded-md object-cover h-16 w-16 border"
        />
        <div className="space-y-1">
          <h3 className="font-semibold text-base">{product.name}</h3>
          <p className="text-sm font-semibold text-primary">R$ {product.price.toFixed(2)}</p>
          <div className="flex gap-1">
             <Button variant="outline" size="sm" className="h-8" onClick={() => onAddToCart(product)}>
                <ShoppingCart className="h-3.5 w-3.5 mr-2"/>
                Adicionar
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onRemove(product.id)}>
                <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const FavoritesSheet = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');

  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchFavorites = async () => {
        setIsLoading(true);
        try {
          const favorites = await getFavoritesByUser(user.id);
          // ✅ CORREÇÃO: Filtrar quaisquer produtos que possam ser nulos ou indefinidos
          const products = favorites.map(fav => fav.product).filter(Boolean) as Product[];
          setFavoriteProducts(products);
        } catch (error) {
          console.error("Failed to fetch favorites:", error);
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível buscar seus favoritos.' });
        }
        setIsLoading(false);
      };
      fetchFavorites();
    }
  }, [isOpen, user, toast]);

  const handleRemoveFavorite = async (productId: string) => {
      if(!user) return;
      try {
          await removeFavorite(user.id, productId);
          setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
          toast({ title: "Removido dos favoritos" });
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover o item.' });
      }
  }
  
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast({ variant: 'success', title: 'Adicionado ao carrinho!', description: `${product.name} está no seu carrinho.` });
  }

  const filteredProducts = useMemo(() => {
    return favoriteProducts
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory);
  }, [searchTerm, selectedCategory, favoriteProducts]);

  const categories: Category[] = ['Todos', 'Salgado', 'Doce', 'Bebida', 'Almoço'];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Favoritos">
            <Heart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Meus Favoritos</SheetTitle>
          <SheetDescription>
            Veja e gerencie seus produtos favoritos aqui.
          </SheetDescription>
        </SheetHeader>
        <Separator className="-mx-6" />

        <div className="py-4 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar favorito..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {categories.map(category => (
                    <Button 
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(category)}
                        className="transition-all text-xs h-8"
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
        <Separator className="-mx-6" />

        {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
            {filteredProducts.map(product => (
              <FavoriteProductCard key={product.id} product={product} onRemove={handleRemoveFavorite} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Heart className="h-20 w-20 text-muted-foreground/30" strokeWidth={1}/>
            <div className="space-y-1">
                <h3 className="text-lg font-medium">Sem favoritos ainda</h3>
                <p className="text-sm text-muted-foreground">Clique no coração dos produtos para adicioná-los.</p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
