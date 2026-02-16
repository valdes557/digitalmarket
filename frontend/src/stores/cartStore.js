import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      
      addItem: (product) => {
        const items = get().items || [];
        const productId = product.id || product._id;
        const exists = items.find((item) => (item.id || item._id) === productId);
        
        if (exists) {
          return false;
        }
        
        const cartItem = {
          id: productId,
          _id: productId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          sale_price: product.sale_price,
          thumbnail: product.thumbnail,
          store_name: product.store_name
        };
        
        set({ items: [...items, cartItem] });
        return true;
      },
      
      removeItem: (productId) => {
        const items = get().items || [];
        set({ items: items.filter((item) => (item.id || item._id) !== productId) });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        const items = get().items || [];
        return items.reduce((total, item) => {
          return total + (item.sale_price || item.price || 0);
        }, 0);
      },
      
      getCount: () => {
        const items = get().items || [];
        return items.length;
      },
      
      hasItem: (productId) => {
        const items = get().items || [];
        return items.some((item) => (item.id || item._id) === productId);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
