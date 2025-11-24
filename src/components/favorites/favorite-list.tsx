// src/components/favorites/favorite-list.tsx
'use client';

import type { Product } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FavoriteListProps {
  favorites: Product[];
  setFavorites?: (favorites: Product[]) => void;
}

export function FavoriteList({ favorites, setFavorites }: FavoriteListProps) {
  if (!favorites || favorites.length === 0) {
    return <p className="text-center text-muted-foreground">Você ainda não tem favoritos.</p>;
  }

  return (
    <div className="space-y-3">
      {favorites.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
              <Image src={p.image.imageUrl} alt={p.name} width={48} height={48} className="object-cover" />
            </div>
            <div>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">R$ {p.price.toFixed(2)}</div>
            </div>
          </div>
          {setFavorites && (
            <Button variant="ghost" size="icon" onClick={() => {
              const remaining = favorites.filter(f => f.id !== p.id);
              setFavorites(remaining);
            }}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
