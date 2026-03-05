import { create } from 'zustand'
import { IPosData } from '@/pages/POS/components/types/TableTypes'
import { calcMetaDataProdudct, calcTotalPrices } from '@/utils/helpers'
import { toast } from 'sonner'

interface ICartStore {
  cartItems: IPosData[]
  subtotalCOP: number
  discountCOP: number
  taxesIVACOP: number
  subtotalUSD: number
  discountUSD: number
  totalCOP: number
  totalUSD: number
  saleById: number | null
  addToCart: (IPosData: IPosData) => void
  removeFromCart: (IPosData: IPosData, hardRemove?: boolean) => void
  clearCart: () => void
  updateTotalPrice: () => void
  addDiscountToItem: (code: string, discount: number) => void
  updateQuantity: (code: string, quantity: number | null) => void
  updateIsGift: (code: string, isGift: boolean) => void
  updateSaleById: (id: number) => void
}

export const useCart = create<ICartStore>((set, get) => ({
  cartItems: [],
  subtotalCOP: 0,
  discountCOP: 0,
  taxesIVACOP: 0,
  subtotalUSD: 0,
  discountUSD: 0,
  totalCOP: 0,
  totalUSD: 0,
  saleById: null,
  addToCart: (product: IPosData) => {
    const { cartItems, addDiscountToItem } = get()
    const index = cartItems.findIndex((item) => item.code === product.code)
    if (index !== -1) {
      const existing = cartItems[index]
      const newQuantity = existing.quantity + 1
      if (
        existing.total_in_shops === 0 ||
        newQuantity > (existing.total_in_shops || 0)
      ) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        return
      }
      const updatedItem = {
        ...existing,
        quantity: newQuantity,
        total: newQuantity * product.selling_price,
        usd_total: newQuantity * product.usd_price,
      }
      const newCartItems = cartItems.map((item, i) => (i === index ? updatedItem : item))
      set({ cartItems: newCartItems })
      if (updatedItem.discount > 0) {
        addDiscountToItem(product.code, updatedItem.discount)
      }
    } else {
      if (product.total_in_shops === 0) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        return
      }
      set({ cartItems: [product, ...cartItems] })
    }
  },
  removeFromCart: (product: IPosData, hardRemove: boolean = false) => {
    const { cartItems, addDiscountToItem } = get()
    if (hardRemove) {
      set({ cartItems: cartItems.filter((item) => item.code !== product.code) })
      return
    }
    const index = cartItems.findIndex((item) => item.code === product.code)
    if (index !== -1) {
      const existing = cartItems[index]
      if (existing.quantity > 1) {
        const newQuantity = existing.quantity - 1
        const updatedItem = {
          ...existing,
          quantity: newQuantity,
          total: newQuantity * product.selling_price,
          usd_total: newQuantity * product.usd_price,
        }
        const newCartItems = cartItems.map((item, i) => (i === index ? updatedItem : item))
        set({ cartItems: newCartItems })
        if (updatedItem.discount > 0) {
          addDiscountToItem(product.code, updatedItem.discount)
        }
      } else {
        set({ cartItems: cartItems.filter((item) => item.code !== product.code) })
      }
    }
  },
  clearCart: () => {
    set({
      cartItems: [],
      subtotalCOP: 0,
      discountCOP: 0,
      taxesIVACOP: 0,
      subtotalUSD: 0,
      discountUSD: 0,
      totalCOP: 0,
      totalUSD: 0,
      saleById: null,
    })
  },
  updateTotalPrice: () => {
    const { cartItems } = get()
    const { discountCOP, discountUSD, subtotalCOP, subtotalUSD, taxesIVACOP, totalCOP, totalUSD } =
      calcTotalPrices(cartItems)
    set({
      subtotalCOP,
      discountCOP,
      taxesIVACOP,
      subtotalUSD,
      discountUSD,
      totalCOP,
      totalUSD,
    })
  },
  addDiscountToItem: (code: string, discount: number) => {
    const { cartItems } = get()
    const newCartItems = cartItems.map((item) => {
      if (item.code === code) {
        const withDiscount = { ...item, discount }
        const { totalItemCOP, totalItemUSD } = calcMetaDataProdudct(withDiscount)
        return { ...withDiscount, total: totalItemCOP, usd_total: totalItemUSD }
      }
      return item
    })
    set({ cartItems: newCartItems })
  },
  updateQuantity: (code: string, quantity: number | null) => {
    const { cartItems } = get()
    const index = cartItems.findIndex((item) => item.code === code)
    if (index !== -1) {
      const existing = cartItems[index]
      const newQuantity = quantity ?? 0
      if (
        existing.total_in_shops === 0 ||
        newQuantity > (existing.total_in_shops || 0)
      ) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        return
      }
      const withQuantity = { ...existing, quantity: newQuantity }
      const { totalItemCOP, totalItemUSD } = calcMetaDataProdudct(withQuantity)
      const updatedItem = { ...withQuantity, total: totalItemCOP, usd_total: totalItemUSD }
      const newCartItems = cartItems.map((item, i) => (i === index ? updatedItem : item))
      set({ cartItems: newCartItems })
    }
  },
  updateIsGift: async (code: string, isGift: boolean) => {
    const { cartItems, updateTotalPrice } = get()
    const newCartItems = cartItems.map((item) =>
      item.code === code ? { ...item, is_gift: isGift } : item,
    )
    set({ cartItems: newCartItems })
    updateTotalPrice()
  },
  updateSaleById: (id: number) => {
    set({
      saleById: id,
    })
  },
}))
