import { IPurchaseProps } from './../types/PurchaseTypes'

export const getTotal = (purchaseData: IPurchaseProps[]) => {
  const getTotalData = purchaseData.reduce((sum, item) => (sum += item.price * item.qty), 0)
  const getIva = getTotalData * 0.19
  const getSubTotalBase = getTotalData - getIva
  return {
    total: getTotalData,
    iva: getIva,
    subTotalBase: getSubTotalBase,
  }
}
