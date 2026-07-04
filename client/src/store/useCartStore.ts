import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface CartItem {
  id: string; // Typically productId + variantId
  productId: string;
  productVariantId?: string;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
  stock?: number;
  isActive?: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      fetchCart: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) return;

          const res = await api.get('/cart');
          if (res.data.success) {
            const serverItems = res.data.data.items.map((item: any) => ({
              id: `${item.productId}-${item.variant?.name || 'default'}`,
              productId: item.productId,
              productVariantId: item.productVariantId,
              name: item.product.name,
              price: Number(item.variant?.price || item.price),
              quantity: item.quantity,
              image: item.product.images?.[0]?.url || item.product.primaryImage || '',
              variant: item.variant?.name || ''
            }));
            set({ items: serverItems });
          }
        } catch (error) {
          console.error('Failed to fetch cart from server', error);
        }
      },
      
      addItem: (item) => {
        set((state) => {
          const itemId = `${item.productId}-${item.variant}`;
          const existingItem = state.items.find((i) => i.id === itemId);
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === itemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          
          return {
            items: [...state.items, { ...item, id: itemId }],
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'ultrashop-cart-storage',
    }
  )
);
