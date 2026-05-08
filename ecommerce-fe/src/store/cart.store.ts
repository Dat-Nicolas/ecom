// src/store/cart.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProductVariant, Product } from '@/types'

export interface CartItem {
  id: string
  variantId: string
  productId: string
  productName: string
  variantName: string
  sku: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant, qty?: number) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, qty = 1) => {
        const items = get().items
        const existing = items.find((i) => i.variantId === variant.id)
        if (existing) {
          set({ items: items.map((i) => i.variantId === variant.id ? { ...i, quantity: i.quantity + qty } : i) })
        } else {
          set({
            items: [...items, {
              id: `${variant.id}-${Date.now()}`,
              variantId: variant.id,
              productId: product.id,
              productName: product.name,
              variantName: variant.name,
              sku: variant.sku,
              price: Number(variant.salePrice ?? variant.price),
              imageUrl: variant.imageUrl ?? product.images?.[0]?.url ?? '/placeholder.png',
              quantity: qty,
            }],
          })
        }
      },
      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      updateQty: (variantId, qty) => {
        if (qty <= 0) { get().removeItem(variantId); return }
        set({ items: get().items.map((i) => i.variantId === variantId ? { ...i, quantity: qty } : i) })
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'cart-store' }
  )
)
