import { Button } from 'antd'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { store } from '../../store'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import {
  ICustomerDataProps,
  IPurchaseProps,
  PaymentMethodsEnum,
} from '../Purchase/types/PurchaseTypes'
import { useGetInvoices } from './../../hooks/useGetInvoices'
import { columns } from './data/columnsData'
import { IInvoiceProps, IPaymentMethodsProps } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { getInvoices } from '../../hooks/helper/functions'
import { formatNumberToColombianPesos } from '../../utils/helpers'

const Invoices: FC = () => {
  const [fetching, setFetching] = useState(false)
  const [invoices, setInvoices] = useState<IPaginationProps<IInvoiceProps>>()
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [shopName, setShopName] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [currentPage, setcurrentPage] = useState(1)
  const [customerData, setCustomerData] = useState<ICustomerDataProps>({} as ICustomerDataProps)
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodsProps[]>([])

  const { state } = useContext(store)

  const printOutRef = useRef<HTMLDivElement>(null)

  useGetInvoices(setInvoices, setFetching)

  const pushActionToList = () => {
    return invoices?.results.map((item) => ({
      ...item,
      created_at: formatDateTime(item.created_at as string),
      total: formatNumberToColombianPesos(
        item.invoice_items
          .map((itemInvoice: IPurchaseProps) => itemInvoice.total)
          .reduce((a, b) => a + b, 0),
      ),
      is_dollar: item.is_dollar ? 'Si' : 'No',
      paid_by: item.payment_methods.map((item) => PaymentMethodsEnum[item.name]).join(', '),
      action: (
        <Button
          onClick={() =>
            printData(
              item.invoice_items,
              item.shop_name,
              item.created_at,
              {
                customerName: item.customer_name,
                customerId: item.customer_id,
                customerEmail: item.customer_email,
                customerPhone: item.customer_phone,
              },
              item.payment_methods,
            )
          }
        >
          Imprimir
        </Button>
      ),
    }))
  }

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint() {
      console.log('impresion exitosa')
    },
  })

  const printData = (
    data: IPurchaseProps[],
    shopName: string,
    date: string,
    customerData: ICustomerDataProps,
    paymentMethods: IPaymentMethodsProps[],
  ) => {
    setDate(date)
    setShopName(shopName)
    setCustomerData(customerData)
    setPaymentMethods(paymentMethods)
    setPurchaseData(data)
    setShowPrintOut(true)
  }

  const onChangePagination = (page: number) => {
    getInvoices(setInvoices, setFetching, page)
    setcurrentPage(page)
  }

  useEffect(() => {
    if (showPrintOut) {
      handlePrint()
      setShowPrintOut(false)
    }
  }, [showPrintOut])

  return (
    <>
      <ContentLayout
        pageTitle='Facturas'
        dataSource={pushActionToList() as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
        disabledAddButton={true}
        totalItems={invoices?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => onChangePagination(page)}
      />
      <div ref={printOutRef}>
        {showPrintOut ? (
          <PrintOut
            data={purchaseData}
            user={state.user?.fullname || ''}
            shopName={shopName}
            date={date}
            customerData={customerData}
            paymentMethods={paymentMethods}
          />
        ) : null}
      </div>
    </>
  )
}
export default Invoices
