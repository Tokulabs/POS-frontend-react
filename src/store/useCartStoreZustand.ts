import { create } from 'zustand'
import { IPosData } from '../pages/POS/components/types/TableTypes'
import { roundNumberToDecimals } from '../utils/helpers'

interface ICartStore {
  cartItems: IPosData[]
  totalPriceCOP: number
  totalPriceUSD: number
  addToCart: (IPosData: IPosData) => void
  removeFromCart: (IPosData: IPosData) => void
  clearCart: () => void
  updateTotalPrice: () => void
  addDiscountToItem: (code: string, discount: number) => void
}

export const useCart = create<ICartStore>((set, get) => ({
  cartItems: [],
  totalPriceCOP: 0,
  totalPriceUSD: 0,
  addToCart: (product: IPosData) => {
    const { cartItems, addDiscountToItem } = get()
    const productExist = cartItems.find((item) => item.code === product.code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      productExist.quantity = originalQuantity + 1
      productExist.total = productExist.quantity * product.selling_price
      productExist.usd_total = productExist.quantity * product.usd_price
      set({
        cartItems: [...cartItems],
      })
      if (productExist.discount > 0) {
        addDiscountToItem(product.code, productExist.discount * 100)
      }
    } else {
      set({
        cartItems: [...cartItems, product],
      })
    }
  },
  removeFromCart: (product: IPosData) => {
    const { cartItems, addDiscountToItem } = get()
    const productExist = cartItems.find((item) => item.code === product.code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      if (originalQuantity > 1) {
        productExist.quantity = originalQuantity - 1
        productExist.total = productExist.quantity * product.selling_price
        productExist.usd_total = productExist.quantity * product.usd_price
        set({
          cartItems: [...cartItems],
        })
        if (productExist.discount > 0) {
          addDiscountToItem(product.code, productExist.discount * 100)
        }
      } else {
        set({
          cartItems: cartItems.filter((item) => item.code !== product.code),
        })
      }
    }
  },
  clearCart: () => {},
  updateTotalPrice: () => {
    const { cartItems } = get()
    let total = 0
    let totalUSD = 0
    cartItems.forEach((item) => {
      total += item.total
      totalUSD += item.usd_total
    })
    set({
      totalPriceCOP: total,
      totalPriceUSD: totalUSD,
    })
  },
  addDiscountToItem: (code: string, discount: number) => {
    const { cartItems } = get()
    const productExist = cartItems.find((item) => item.code === code)
    if (productExist) {
      productExist.discount = discount / 100
      const realTotal = productExist.quantity * productExist.selling_price
      productExist.total = Math.round(realTotal - realTotal * productExist.discount)
      const realUSDTotal = productExist.quantity * productExist.usd_price
      const totalUSDValue = Math.round(realUSDTotal - realUSDTotal * productExist.discount)
      productExist.usd_total = roundNumberToDecimals(totalUSDValue, 2)
      set({
        cartItems: [...cartItems],
      })
    }
  },
}))
