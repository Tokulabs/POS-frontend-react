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
    const productExist = cartItems.find((item) => item.code === product.code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      productExist.quantity = originalQuantity + 1
      if (
        productExist.total_in_shops === 0 ||
        productExist.quantity > (productExist.total_in_shops || 0)
      ) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        productExist.quantity = originalQuantity
        return
      }
      productExist.total = productExist.quantity * product.selling_price
      productExist.usd_total = productExist.quantity * product.usd_price
      set({
        cartItems: [...cartItems],
      })
      if (productExist.discount > 0) {
        addDiscountToItem(product.code, productExist.discount)
      }
    } else {
      if (product.total_in_shops === 0) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        return
      }
      set({
        cartItems: [product, ...cartItems],
      })
    }
  },
  removeFromCart: (product: IPosData, hardRemove: boolean = false) => {
    const { cartItems, addDiscountToItem } = get()
    if (hardRemove) {
      set({
        cartItems: cartItems.filter((item) => item.code !== product.code),
      })
      return
    }
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
          addDiscountToItem(product.code, productExist.discount)
        }
      } else {
        set({
          cartItems: cartItems.filter((item) => item.code !== product.code),
        })
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
    const productExist = cartItems.find((item) => item.code === code)
    if (productExist) {
      productExist.discount = discount
      set({
        cartItems: [...cartItems],
      })
      const { totalItemCOP, totalItemUSD } = calcMetaDataProdudct(productExist)
      productExist.total = totalItemCOP
      productExist.usd_total = totalItemUSD
      set({
        cartItems: [...cartItems],
      })
    }
  },
  updateQuantity: (code: string, quantity: number | null) => {
    const { cartItems } = get()
    const productExist = cartItems.find((item) => item.code === code)
    if (productExist) {
      const originalQuantity = productExist.quantity
      productExist.quantity = quantity ?? 0
      if (
        productExist.total_in_shops === 0 ||
        productExist.quantity > (productExist.total_in_shops || 0)
      ) {
        toast.error('Lo sentimos, este producto no cuenta más existencias en tienda')
        productExist.quantity = originalQuantity
        return
      }
      set({
        cartItems: [...cartItems],
      })
      const { totalItemCOP, totalItemUSD } = calcMetaDataProdudct(productExist)
      productExist.total = totalItemCOP
      productExist.usd_total = totalItemUSD
      set({
        cartItems: [...cartItems],
      })
    }
  },
  updateIsGift: async (code: string, isGift: boolean) => {
    const { cartItems, updateTotalPrice } = get()
    const productExist = cartItems.find((item) => item.code === code)
    if (productExist) {
      productExist.is_gift = isGift
      set({
        cartItems: [...cartItems],
      })
      updateTotalPrice()
    }
  },
  updateSaleById: (id: number) => {
    set({
      saleById: id,
    })
  },
}))
