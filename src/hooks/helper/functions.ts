import { axiosRequest } from '../../api/api'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { IGroupsProps } from '../../pages/Groups/types/GroupTypes'
import { IInventoryProps } from '../../pages/Inventories/types/InventoryTypes'
import { IInvoiceProps } from '../../pages/Invoices/types/InvoicesTypes'
import { IPaginationProps } from '../../types/GlobalTypes'
import { groupURL, inventoryURL, invoiceURL, shopURL } from '../../utils/network'
import { IShopProps } from './../../pages/Shops/types/ShopTypes'

export const getGroups = async (
  setGroup: (data: IPaginationProps<IGroupsProps>) => void,
  setFetching: (val: boolean) => void,
  page?: number,
) => {
  try {
    setFetching(true)
    const finalURL = new URL(groupURL)
    if (page) finalURL.searchParams.append('page', String(page))
    const response = await axiosRequest<IPaginationProps<IGroupsProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        belongsTo: item.belongs_to ? item.belongs_to.name : 'No aplica',
      }))
      setGroup({ ...response.data, results: data })
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}

export const getInventories = async (
  setInventories: (data: IPaginationProps<IInventoryProps>) => void,
  setFetching: (val: boolean) => void,
  page = 1,
) => {
  try {
    setFetching(true)
    const finalURL = new URL(inventoryURL)
    finalURL.searchParams.append('page', String(page))
    const response = await axiosRequest<IPaginationProps<IInventoryProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        groupInfo: `${item.group?.belongs_to?.name ? `${item.group?.belongs_to?.name} /` : ''} ${
          item.group?.name
        }`,
        photoInfo: item.photo,
      }))
      setInventories({ ...response.data, results: data })
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}

export const getShops = async (
  setShops: (data: IPaginationProps<IShopProps>) => void,
  setFetching: (val: boolean) => void,
  page?: number,
) => {
  try {
    setFetching(true)
    const finalURL = new URL(shopURL)
    if (page) finalURL.searchParams.append('page', String(page))
    const response = await axiosRequest<IPaginationProps<IShopProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        created_by_email: String(item.created_by.email),
      }))
      setShops({ ...response.data, results: data })
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}

export const getInvoices = async (
  setInvoices: (data: IPaginationProps<IInvoiceProps>) => void,
  setFetching: (val: boolean) => void,
  page = 1,
) => {
  try {
    setFetching(true)
    const finalURL = new URL(invoiceURL)
    finalURL.searchParams.append('page', String(page))
    const response = await axiosRequest<IPaginationProps<IInvoiceProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const dataFormatted: IInvoiceProps[] = response.data.results.map((item: any) => ({
        ...item,
        key: item.id,
        created_by_email: item.created_by.email,
        shop_name: item.shop.name,
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        invoices_items: item.invoice_items.map((itemInvoice: any) => ({
          code: itemInvoice.item_code,
          id: itemInvoice.id,
          price: itemInvoice.item.price,
          qty: itemInvoice.quantity,
          item: itemInvoice.item_name,
          total: itemInvoice.amount,
        })),
        paymentMethods: item.payment_methods,
      }))
      setInvoices({ ...response.data, results: dataFormatted })
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}
