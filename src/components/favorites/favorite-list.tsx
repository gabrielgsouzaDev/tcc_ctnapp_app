
// Placeholder file para resolver dependências de compilação.

import type { Product } from '@/lib/products';

interface FavoriteListProps {
  favorites: Product[];
  setFavorites: (favorites: Product[]) => void;
}

export function FavoriteList({ favorites }: FavoriteListProps) {
  if (favorites.length === 0) {
    return <p className="text-center text-muted-foreground">Você ainda não tem favoritos.</p>;
  }

  return (
    <div>
      {favorites.map((fav) => (
        <div key={fav.id}>{fav.name}</div>
      ))}
    </div>
  );
}
