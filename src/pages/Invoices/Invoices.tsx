import { Button } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import {
  ICustomerDataProps,
  IPurchaseProps,
  PaymentMethodsEnum,
} from '../Purchase/types/PurchaseTypes'
import { columns } from './data/columnsData'
import { IPaymentMethodsProps } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { useInvoices } from '../../hooks/useInvoices'

const Invoices: FC = () => {
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [shopName, setShopName] = useState<string>('')
  const [saleName, setSaleName] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [currentPage, setcurrentPage] = useState(1)
  const [customerData, setCustomerData] = useState<ICustomerDataProps>({} as ICustomerDataProps)
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodsProps[]>([])

  const { isLoading, invoicesData } = useInvoices('paginatedInvoices', { page: currentPage })

  const printOutRef = useRef<HTMLDivElement>(null)

  const pushActionToList = () => {
    return invoicesData?.results.map((item) => ({
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
              item.sale_name,
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
    saleName: string,
    date: string,
    customerData: ICustomerDataProps,
    paymentMethods: IPaymentMethodsProps[],
  ) => {
    setDate(date)
    setShopName(shopName)
    setSaleName(saleName)
    setCustomerData(customerData)
    setPaymentMethods(paymentMethods)
    setPurchaseData(data)
    setShowPrintOut(true)
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
        fetching={isLoading}
        disabledAddButton={true}
        totalItems={invoicesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      />
      <div ref={printOutRef}>
        {showPrintOut ? (
          <PrintOut
            data={purchaseData}
            shopName={shopName}
            saleName={saleName}
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
