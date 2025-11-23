
import { CartProvider } from "@/hooks/use-cart";
import { ReactNode } from "react";

// Este componente envolve todas as páginas da área do aluno.
// Ao adicionar o CartProvider aqui, garantimos que qualquer página
// dentro de /student/* terá acesso ao estado e às funções do carrinho.

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
