import { Button, notification } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPrintData } from '../../types/GlobalTypes'
import {
  ICustomerDataProps,
  IPurchaseProps,
  PaymentMethodsEnum,
} from '../Purchase/types/PurchaseTypes'
import { columns } from './data/columnsData'
import { IInvoiceProps } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { useInvoices } from '../../hooks/useInvoices'
import { useDianResolutions } from '../../hooks/useDianResolution'
import { IDianResolutionProps } from '../Dian/types/DianResolutionTypes'

const Invoices: FC = () => {
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [currentPage, setcurrentPage] = useState(1)
  const [printData, setPrintData] = useState<IPrintData>({} as IPrintData)

  const { isLoading, invoicesData } = useInvoices('paginatedInvoices', { page: currentPage })
  const { dianResolutionData } = useDianResolutions('allDianResolutions', {})

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
      action: <Button onClick={() => formatDataToPrint(item)}>Imprimir</Button>,
    }))
  }

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint: () => {
      notification.success({
        message: 'Impresión exitosa',
        description: 'La factura se ha impreso correctamente',
      })
    },
    onPrintError: () => {
      notification.error({
        message: 'Error al imprimir',
        description: 'Ha ocurrido un error al imprimir la factura',
      })
    },
  })

  const formatDataToPrint = (data: IInvoiceProps) => {
    const customerData: ICustomerDataProps = {
      customerName: data.customer_name,
      customerId: data.customer_id,
      customerEmail: data.customer_email,
      customerPhone: data.customer_phone,
    }

    const dianInformation: IDianResolutionProps = {
      ...(dianResolutionData?.data[0] as IDianResolutionProps),
      current_number: Number(data.invoice_number),
    }

    setPrintData({
      data: data.invoice_items,
      saleName: data.sale_name,
      date: data.created_at,
      customerData,
      paymentMethods: data.payment_methods,
      dianInformation,
    })
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
      <div ref={printOutRef}>{showPrintOut ? <PrintOut printData={printData} /> : null}</div>
    </>
  )
}
export default Invoices
