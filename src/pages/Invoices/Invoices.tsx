import { Button, Spin, notification } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPrintData } from '../../types/GlobalTypes'
import { columns } from './data/columnsData'
import { IInvoiceProps, IItemInvoice } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { calcTotalPrices, formatNumberToColombianPesos } from '../../utils/helpers'
import { useInvoices } from '../../hooks/useInvoices'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchOverrideInvoice } from './helpers/services'
import { UserRolesEnum } from '../Users/types/UserTypes'
import { useDianResolutions } from '../../hooks/useDianResolution'
import { IDianResolutionProps } from '../Dian/types/DianResolutionTypes'
import { useRolePermissions } from '../../hooks/useRolespermissions'
import { PaymentMethodsEnum } from '../POS/components/types/PaymentMethodsTypes'
import { IPosData } from '../POS/components/types/TableTypes'

const Invoices: FC = () => {
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [currentPage, setcurrentPage] = useState(1)
  const [printData, setPrintData] = useState<IPrintData>({} as IPrintData)
  const queryClient = useQueryClient()
  const { isLoading, invoicesData } = useInvoices('paginatedInvoices', { page: currentPage })

  const allowedRolesOverride = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.shopAdmin,
  ]
  const { hasPermission } = useRolePermissions(allowedRolesOverride)

  const printOutRef = useRef<HTMLDivElement>(null)

  const { mutate, isPending: isLoadingOverride } = useMutation({
    mutationFn: patchOverrideInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedInvoices', { page: 1 }] })
      notification.info({
        message: 'Exito',
        description: 'Factura anulada!',
      })
    },
  })
  const pushActionToList = () => {
    const invoiceData: IInvoiceProps[] = invoicesData?.results ?? ({} as IInvoiceProps[])
    // return invoicesData?.results.map((item) => ({
    //   ...item,
    //   sale_by_name: item.sale_by.fullname || 'SuperAdmin',
    //   created_at: formatDateTime(item.created_at as string),
    //   total:
    //   is_dollar: item.is_dollar ? 'Si' : 'No',
    //   is_override: item.is_override ? 'Si' : 'No',
    //   paid_by: item.payment_methods
    //     .map((item) => PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum])
    //     .join(', '),
    //   action: (
    //     <div className='flex'>
    //       <Button onClick={() => console.log('imprimir')}>Imprimir</Button>
    //       {isLoadingOverride ? (
    //         <Spin />
    //       ) : (
    //         hasPermission && (
    //           <Button onClick={() => overrideInvoice(item.invoice_number)}>Anular</Button>
    //         )
    //       )}
    //     </div>
    //   ),
    // }))
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

  const overrideInvoice = async (invoiceNumber: number) => {
    mutate(invoiceNumber)
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
        totalItems={invoicesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      />
    </>
  )
}
export default Invoices
