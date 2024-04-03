import { create } from 'zustand'
import { IPosData } from '../pages/POS/components/types/TableTypes'
import { roundNumberToDecimals } from '../utils/helpers'

interface ICartStore {
  cartItems: IPosData[]
  subtotalCOP: number
  discountCOP: number
  taxesIVACOP: number
  subtotalUSD: number
  discountUSD: number
  totalCOP: number
  totalUSD: number
  addToCart: (IPosData: IPosData) => void
  removeFromCart: (IPosData: IPosData) => void
  clearCart: () => void
  updateTotalPrice: () => void
  addDiscountToItem: (code: string, discount: number) => void
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
    let subtotalCOP = 0
    let discountCOP = 0
    let taxesIVACOP = 0
    let subtotalUSD = 0
    let discountUSD = 0
    let totalCOP = 0
    let totalUSD = 0

    cartItems.forEach((item) => {
      const priceQuantityCOP = item.quantity * item.selling_price
      const priceQuantityUSD = item.quantity * item.usd_price

      const itemWithNoTaxCOP = priceQuantityCOP / 1.19
      const itemWithNoTaxUSD = priceQuantityUSD / 1.19

      const itemDiscountCOP = itemWithNoTaxCOP * item.discount
      const itemDiscountUSD = itemWithNoTaxUSD * item.discount

      const itemTaxesCOP = priceQuantityCOP - itemWithNoTaxCOP
      const itemTaxesUSD = priceQuantityUSD - itemWithNoTaxUSD

      const totalItemCOP = itemWithNoTaxCOP - itemDiscountCOP + itemTaxesCOP
      const totalItemUSD = itemWithNoTaxUSD - itemDiscountUSD + itemTaxesUSD

      subtotalCOP += Math.round(itemWithNoTaxCOP)
      subtotalUSD += Math.round(itemWithNoTaxUSD)
      discountCOP += Math.round(itemDiscountCOP)
      taxesIVACOP += Math.round(itemTaxesCOP)
      discountUSD += Math.round(itemDiscountUSD)
      totalCOP += Math.round(totalItemCOP)
      totalUSD += Math.round(totalItemUSD)
    })
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
