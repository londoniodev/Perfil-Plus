"use client";

import { createContext, useRef, useContext, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { createCartStore, CartStore, CartState, CartItem, CartActions } from './cart-store';
import { useAnalytics } from '@/hooks/use-analytics';

export type { CartStore, CartState, CartItem, CartActions };

export const CartStoreContext = createContext<ReturnType<typeof createCartStore> | null>(null);

export function CartProvider({ children, initialState }: { children: React.ReactNode, initialState?: CartState }) {
  const storeRef = useRef<ReturnType<typeof createCartStore> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = createCartStore(initialState);
  }

  useEffect(() => {
    // Si la referencia del store existe, forzamos la rehidratación en el cliente 
    // después del primer pintado (skipHydration: true en el middleware).
    if (storeRef.current) {
      storeRef.current.persist.rehydrate();
    }
  }, []);

  return (
    <CartStoreContext.Provider value={storeRef.current}>
      {children}
    </CartStoreContext.Provider>
  );
}

/**
 * Hook universal que reemplaza directamente el patrón singleton antiguo.
 * Mantiene la compatibilidad con todos los componentes como `cart-sheet`, `checkout-form`, etc.
 */
export function useCart(): CartStore;
export function useCart<T>(selector: (state: CartStore) => T): T;
export function useCart<T>(selector?: (state: CartStore) => T): T | CartStore {
  const store = useContext(CartStoreContext);
  const { trackAddToCart } = useAnalytics();

  if (!store) {
      throw new Error('Missing CartProvider in the React tree');
  }
  
  const cartStore = useStore(store, selector || ((state: CartStore) => state as any));

  // Si se solicitó el store completo, envolvemos addItem para incluir tracking
  if (!selector) {
    const originalAddItem = (cartStore as CartStore).addItem;
    return {
      ...cartStore as CartStore,
      addItem: (data: Omit<CartItem, 'cartItemId'>) => {
        trackAddToCart({
            id: data.productId,
            name: data.title,
            price: data.price,
            quantity: data.quantity
        });
        originalAddItem(data);
      }
    };
  }

  return cartStore;
}

/**
 * Hook para saber exactamente cuándo el carrito sincronizó su estado de la persistencia (localStorage)
 * Usa esto para no renderizar contenido montado puramente en cliente antes de tiempo.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const store = useContext(CartStoreContext);
  
  useEffect(() => {
    if (!store) return;
    
    setHydrated(store.persist.hasHydrated());

    const unsubHydrated = store.persist.onHydrate(() => setHydrated(false));
    const unsubFinish = store.persist.onFinishHydration(() => setHydrated(true));
    
    return () => {
        unsubHydrated();
        unsubFinish();
    };
  }, [store]);

  return hydrated;
}
