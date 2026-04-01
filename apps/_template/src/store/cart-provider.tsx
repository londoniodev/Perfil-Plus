"use client";

import { createContext, useRef, useContext, useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { createCartStore, CartStore, CartState } from './use-cart';

export const CartStoreContext = createContext<ReturnType<typeof createCartStore> | null>(null);

export function CartProvider({ children, initialState }: { children: React.ReactNode, initialState?: CartState }) {
  const storeRef = useRef<ReturnType<typeof createCartStore>>();
  
  if (!storeRef.current) {
    storeRef.current = createCartStore(initialState);
  }

  // Resolver el Hydration Mismatch:
  // Zustand persist en SSR empieza vacío (o con initialState vacío). 
  // skipHydration evita que reemplace datos en el primer render del cliente.
  // Aquí le decimos a Zustand persist que hidrate localStorage DESPUÉS del primer render.
  useEffect(() => {
    storeRef.current?.persist.rehydrate();
  }, []);

  return (
    <CartStoreContext.Provider value={storeRef.current}>
      {children}
    </CartStoreContext.Provider>
  );
}

export function useCartContext<T>(selector: (state: CartStore) => T): T {
  const store = useContext(CartStoreContext);
  if (!store) {
      throw new Error('Missing CartProvider in the tree');
  }
  return useStore(store, selector);
}

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const store = useContext(CartStoreContext);
  
  useEffect(() => {
    if (!store) return;
    
    // Si ya hidrató antes del render, lo marcamos
    setHydrated(store.persist.hasHydrated());

    const unsubHydrated = store.persist.onHydrate(() => setHydrated(false));
    const unsubFinish = store.persist.onFinishHydration(() => setHydrated(true));
    
    return () => {
        if(unsubHydrated) unsubHydrated();
        if(unsubFinish) unsubFinish();
    };
  }, [store]);

  return hydrated;
}
