import { useEffect } from 'react'
import { IInvoiceProps } from '../pages/Invoices/types/InvoicesTypes'
import { IPaginationProps } from '../types/GlobalTypes'
import { getInvoices } from './helper/functions'

export const useGetInvoices = async (
  setInvoices: (data: IPaginationProps<IInvoiceProps>) => void,
  setFetching: (val: boolean) => void,
) => {
  useEffect(() => {
    getInvoices(setInvoices, setFetching)
  }, [])
}
