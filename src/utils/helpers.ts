import { IPosData } from '../pages/POS/components/types/TableTypes'

export const formatNumberToColombianPesos = (num: number, showCurrency = false): string => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })

  return `${formatter.format(num)} ${showCurrency ? 'COP' : ''}`
}

export const formatToUsd = (num: number, showCurrency = false): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })

  return `${formatter.format(num)} ${showCurrency ? 'USD' : ''}`
}

export const roundNumberToDecimals = (number: number, decimals: number): number => {
  const factor = Math.pow(10, decimals)
  return parseFloat((Math.round(number * factor) / factor).toFixed(decimals))
}

export const calcMetaDataProdudct = (product: IPosData) => {
  const priceQuantityCOP = product.quantity * product.selling_price
  const priceQuantityUSD = product.quantity * product.usd_price

  const itemWithNoTaxCOP = priceQuantityCOP / 1.19
  const itemWithNoTaxUSD = priceQuantityUSD / 1.19

  const itemDiscountCOP = itemWithNoTaxCOP * (product.discount / 100)
  const itemDiscountUSD = itemWithNoTaxUSD * (product.discount / 100)

  const itemTaxesCOP = priceQuantityCOP - itemWithNoTaxCOP
  const itemTaxesUSD = priceQuantityUSD - itemWithNoTaxUSD

  const totalItemCOP = itemWithNoTaxCOP - itemDiscountCOP + itemTaxesCOP
  const totalItemUSD = itemWithNoTaxUSD - itemDiscountUSD + itemTaxesUSD

  return {
    itemWithNoTaxCOP: Math.round(itemWithNoTaxCOP),
    itemWithNoTaxUSD: Math.round(itemWithNoTaxUSD),
    itemDiscountCOP: Math.round(itemDiscountCOP),
    itemTaxesCOP: Math.round(itemTaxesCOP),
    itemDiscountUSD: Math.round(itemDiscountUSD),
    totalItemCOP: Math.round(totalItemCOP),
    totalItemUSD: Math.round(totalItemUSD),
  }
}
