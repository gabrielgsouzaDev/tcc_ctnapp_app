
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Product } from '@/lib/data';

// Define o formato de um item dentro do carrinho
export type CartItem = {
  product: Product;
  quantity: number;
};

// Define o que será exposto pelo nosso contexto
type CartContextType = {
  cartItems: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
};

// Chave para salvar/ler do localStorage
const CART_STORAGE_KEY = 'canteen-cart';

// Cria o contexto com um valor padrão inicial (será substituído pelo Provider)
const CartContext = createContext<CartContextType | undefined>(undefined);

// Componente Provedor que encapsulará nossa aplicação
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Efeito para carregar o carrinho do localStorage quando o componente montar
  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Falha ao carregar o carrinho do localStorage:', error);
    }
  }, []);

  // Efeito para salvar o carrinho no localStorage sempre que ele for alterado
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Falha ao salvar o carrinho no localStorage:', error);
    }
  }, [cartItems]);

  // Função para adicionar um item (ou incrementar a quantidade se já existir)
  const addItem = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        // Se o item já existe, atualiza a quantidade
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Se é um novo item, adiciona ao carrinho
        return [...prevItems, { product, quantity }];
      }
    });
  };

  // Função para remover um item do carrinho
  const removeItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  // Função para atualizar a quantidade de um item específico
  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Se a quantidade for 0 ou menos, remove o item
      removeItem(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Função para limpar completamente o carrinho
  const clearCart = () => {
    setCartItems([]);
  };

  // Valor calculado para a contagem total de itens
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Valor calculado para o preço total do carrinho
  const totalPrice = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    cartCount,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook customizado para facilitar o uso do contexto do carrinho
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
