import { create } from 'zustand'
import { IPosData } from '@/pages/POS/components/types/TableTypes'
import { calcMetaDataProdudct } from '@/utils/helpers'

interface ICartOrdersStore {
  cartItemsOrders: IPosData[]
  addToCart: (IPosData: IPosData) => void
  removeFromCart: (IPosData: IPosData) => void
  clearCart: () => void
  updateQuantity: (code: string, quantity: number | null) => void
}

export const useCartOrders = create<ICartOrdersStore>((set, get) => ({
  cartItemsOrders: [],
  saleById: null,
  addToCart: (product: IPosData) => {
    const { cartItemsOrders } = get()
    const productExist = cartItemsOrders.find((item) => item.code === product.code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      productExist.quantity = originalQuantity + 1
      productExist.total = productExist.quantity * product.selling_price
      productExist.usd_total = productExist.quantity * product.usd_price
      set({
        cartItemsOrders: [...cartItemsOrders],
      })
      return
    }
    set({
      cartItemsOrders: [product, ...cartItemsOrders],
    })
  },
  removeFromCart: (product: IPosData) => {
    const { cartItemsOrders } = get()
    const productExist = cartItemsOrders.find((item) => item.code === product.code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      if (originalQuantity > 1) {
        productExist.quantity = originalQuantity - 1
        productExist.total = productExist.quantity * product.selling_price
        productExist.usd_total = productExist.quantity * product.usd_price
        set({
          cartItemsOrders: [...cartItemsOrders],
        })
      } else {
        set({
          cartItemsOrders: cartItemsOrders.filter((item) => item.code !== product.code),
        })
      }
    }
  },
  clearCart: () => {
    set({
      cartItemsOrders: [],
    })
  },
  updateQuantity: (code: string, quantity: number | null) => {
    const { cartItemsOrders } = get()
    const productExist = cartItemsOrders.find((item) => item.code === code)
    if (productExist) {
      productExist.quantity = quantity ?? 0
      set({
        cartItemsOrders: [...cartItemsOrders],
      })
      const { totalItemCOP, totalItemUSD } = calcMetaDataProdudct(productExist)
      productExist.total = totalItemCOP
      productExist.usd_total = totalItemUSD
      set({
        cartItemsOrders: [...cartItemsOrders],
      })
    }
  },
}))
