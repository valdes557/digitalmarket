import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const exists = items.find((item) => item.id === product.id);
        
        if (exists) {
          return false; // Product already in cart
        }
        
        set({ items: [...items, product] });
        return true;
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (item.sale_price || item.price);
        }, 0);
      },
      
      getCount: () => {
        return get().items.length;
      },
      
      hasItem: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
