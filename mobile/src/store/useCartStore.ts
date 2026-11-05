import { create } from 'zustand';

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: 'BEER' | 'WHISKY' | 'VODKA' | 'RUM' | 'WINE' | 'TEQUILA' | 'MIXERS_AND_SODA';
  abv: number;
  volumeMl: number;
  priceLegalMrp: number;
  imageUrl: string;
  tastingNotes?: string;
  minAge: number;
}

export interface CartEntry {
  product: ProductItem;
  quantity: number;
}

interface CartState {
  items: CartEntry[];
  addItem: (product: ProductItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  hasSafeRideCredit: () => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((acc, i) => acc + i.product.priceLegalMrp * i.quantity, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const deliveryFee = 50.0;
    const packagingFee = 20.0;
    return subtotal + deliveryFee + packagingFee;
  },

  hasSafeRideCredit: () => {
    return get().items.length > 0;
  },
}));
