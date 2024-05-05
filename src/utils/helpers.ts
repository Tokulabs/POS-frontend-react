import { getDianResolutions } from '../pages/Dian/helpers/services'
import { IDianResolutionProps } from '../pages/Dian/types/DianResolutionTypes'
import { IInvoiceProps } from '../pages/Invoices/types/InvoicesTypes'
import { ICustomerProps } from '../pages/POS/components/types/CustomerTypes'
import { IPosData } from '../pages/POS/components/types/TableTypes'
import { IPrintData } from '../types/GlobalTypes'

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
  if (product.is_gift)
    return {
      itemWithNoTaxCOP: 0,
      itemWithNoTaxUSD: 0,
      itemDiscountCOP: 0,
      itemTaxesCOP: 0,
      itemDiscountUSD: 0,
      totalItemCOP: 0,
      totalItemUSD: 0,
    }
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

export const calcTotalPrices = (items: IPosData[]) => {
  let subtotalCOP = 0
  let discountCOP = 0
  let taxesIVACOP = 0
  let subtotalUSD = 0
  let discountUSD = 0
  let totalCOP = 0
  let totalUSD = 0

  items.forEach((item) => {
    const {
      itemDiscountCOP,
      itemDiscountUSD,
      itemTaxesCOP,
      itemWithNoTaxCOP,
      itemWithNoTaxUSD,
      totalItemCOP,
      totalItemUSD,
    } = calcMetaDataProdudct(item)

    subtotalCOP += Math.round(itemWithNoTaxCOP)
    subtotalUSD += Math.round(itemWithNoTaxUSD)
    discountCOP += Math.round(itemDiscountCOP)
    taxesIVACOP += Math.round(itemTaxesCOP)
    discountUSD += Math.round(itemDiscountUSD)
    totalCOP += Math.round(totalItemCOP)
    totalUSD += Math.round(totalItemUSD)
  })
  return {
    subtotalCOP,
    discountCOP,
    taxesIVACOP,
    subtotalUSD,
    discountUSD,
    totalCOP,
    totalUSD,
  }
}

export const checkIfObjectHasEmptyFields = (obj: {
  [key: string]: string | boolean | number
}): boolean => {
  return Object.values(obj).some((value) => value)
}

export const buildPrintDataFromInvoiceProps = async (
  invoice: IInvoiceProps,
): Promise<IPrintData> => {
  return {
    customerData: invoice?.customer ?? ({} as ICustomerProps),
    dataItems:
      invoice?.invoice_items.map((item) => {
        return {
          code: item.item_code,
          name: item.item_name,
          selling_price: item.item.selling_price,
          usd_price: item.item.usd_price,
          discount: item.discount,
          quantity: item.quantity,
          total: item.amount,
          usd_total: item.usd_amount,
          total_in_shops: item.original_amount,
          is_gift: item.is_gift,
          id: item.id,
        } as IPosData
      }) ?? ([] as IPosData[]),
    dianResolution:
      (await getDianResolutions({ document_number: invoice.dian_document_number }).then(
        (res) => res?.results[0],
      )) ?? ({} as IDianResolutionProps),
    invoiceNumber: invoice.invoice_number,
    isOverride: invoice.is_override,
    paymentMethods: invoice.payment_methods,
    saleBy: invoice.sale_by,
    created_at: invoice.created_at,
  }
}
