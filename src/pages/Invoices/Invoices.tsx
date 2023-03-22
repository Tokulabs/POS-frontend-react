import { Button } from 'antd'
import { FC, useContext, useEffect, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { store } from '../../store'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import { IPurchaseProps } from '../Purchase/types/PurchaseTypes'
import { useGetInvoices } from './../../hooks/useGetInvoices'
import { columns } from './data/columnsData'
import { IInvoiceProps } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { getInvoices } from '../../hooks/helper/functions'

const Invoices: FC = () => {
  const [fetching, setFetching] = useState(false)
  const [invoices, setInvoices] = useState<IPaginationProps<IInvoiceProps>>()
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [shopName, setShopName] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [currentPage, setcurrentPage] = useState(1)

  const { state } = useContext(store)

  const printOutRef = useRef<HTMLDivElement>(null)

  useGetInvoices(setInvoices, setFetching)

  const pushActionToList = () => {
    return invoices?.results.map((item) => ({
      ...item,
      created_at: formatDateTime(item.created_at as string),
      action: (
        <Button onClick={() => printData(item.invoices_items, item.shop_name, item.created_at)}>
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

  const printData = (data: IPurchaseProps[], shopName: string, date: string) => {
    setDate(date)
    setShopName(shopName)
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
          />
        ) : null}
      </div>
    </>
  )
}
export default Invoices
