// src/components/favorites/favorites-sheet.tsx
'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/data';
import { FavoriteList } from './favorite-list';

interface FavoritesSheetProps {
  favorites: Product[];
  setFavorites: (favorites: Product[]) => void;
  isLoaded: boolean;
}

export function FavoritesSheet({ favorites, setFavorites, isLoaded }: FavoritesSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {isLoaded && favorites.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
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
        </SheetHeader>
        {isLoaded ? (
          <FavoriteList favorites={favorites} setFavorites={setFavorites} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
