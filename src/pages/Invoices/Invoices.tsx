import { Popconfirm, Spin, Tooltip } from 'antd'
import { FC, useRef, useState } from 'react'
import PrintOut from '../../components/Print/PrintOut'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPrintData } from '../../types/GlobalTypes'
import { columns } from './data/columnsData'
import { IInvoiceProps } from './types/InvoicesTypes'
import { useReactToPrint } from 'react-to-print'
import { formatDateTime } from '../../layouts/helpers/helpers'
import {
  buildPrintDataFromInvoiceProps,
  calcTotalPrices,
  formatNumberToColombianPesos,
  formatToUsd,
} from '../../utils/helpers'
import { useInvoices } from '../../hooks/useInvoices'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchOverrideInvoice } from './helpers/services'
import { UserRolesEnum } from '../Users/types/UserTypes'
import { useRolePermissions } from '../../hooks/useRolespermissions'
import { PaymentMethodsEnum } from '../POS/components/types/PaymentMethodsTypes'
import { IPosData } from '../POS/components/types/TableTypes'
import { IconCircleX, IconPrinter, IconX } from '@tabler/icons-react'
import { toast } from 'sonner'

const Invoices: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [printData, setPrintData] = useState<IPrintData>({} as IPrintData)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { isLoading, invoicesData } = useInvoices('paginatedInvoices', {
    keyword: search,
    page: currentPage,
  })

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
      queryClient.invalidateQueries({ queryKey: ['paginatedInvoices', { page: currentPage }] })
      toast.info('Factura anulada!')
    },
  })

  const confirmOverride = (id: number) => {
    if (isLoadingOverride) return
    mutate(id)
  }

  const pushActionToList = () => {
    const invoiceData: IInvoiceProps[] = invoicesData?.results ?? ([] as IInvoiceProps[])

    return invoiceData.map((item) => {
      const itemPOSDetails: IPosData[] = item.invoice_items.map((item) => ({
        code: item.item_code,
        name: item.item_name,
        selling_price: item.item.selling_price,
        usd_price: item.item.usd_price,
        discount: item.discount,
        quantity: item.quantity,
        total: item.amount,
        usd_total: item.usd_amount,
        is_gift: item.is_gift,
        id: item.id,
      }))

      const { totalCOP, totalUSD } = calcTotalPrices(itemPOSDetails)

      const isDebitOrCredit = item.payment_methods.some(
        (item) =>
          PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum] ===
            PaymentMethodsEnum.debitCard ||
          PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum] ===
            PaymentMethodsEnum.creditCard,
      )

      const methodsStrings = item.payment_methods
        .map((item) => PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum])
        .join(', ')

      return {
        ...item,
        sale_by_name: item.sale_by.fullname || 'SuperAdmin',
        created_at: formatDateTime(item.created_at as string),
        total: formatNumberToColombianPesos(totalCOP),
        is_dollar: item.is_dollar ? `USD (${formatToUsd(totalUSD)})` : 'COP',
        is_override: item.is_override ? (
          <div className='text-red-1'>
            <IconX />
          </div>
        ) : null,
        paid_by: isDebitOrCredit ? (
          <Tooltip
            mouseLeaveDelay={0.3}
            destroyTooltipOnHide={true}
            title={
              <div>
                <span>
                  Datáfono: <strong>{item.payment_terminal?.name}</strong>
                </span>
                <br />
                <span>
                  Código único: <strong>{item.payment_terminal?.account_code}</strong>
                </span>
              </div>
            }
          >
            <span className='truncate'>{methodsStrings}</span>
          </Tooltip>
        ) : (
          <span className='truncate'>{methodsStrings}</span>
        ),
        action: (
          <div className='flex text-3xl gap-3'>
            <div className='text-green-1 cursor-pointer'>
              <Popconfirm
                title='imprimir factua'
                description='¿Estas seguro deseas imprimir esta factura?'
                onOpenChange={() => setDataToprint(item)}
                onConfirm={() => printOut()}
                okText='Si, imprimir'
                cancelText='Cancelar'
              >
                <IconPrinter />
              </Popconfirm>
            </div>
            {isLoadingOverride ? (
              <Spin />
            ) : (
              hasPermission && (
                <div className='text-red-1 cursor-pointer'>
                  <Popconfirm
                    title='Anular factua'
                    description='¿Estas seguro de anular esta factura?'
                    onConfirm={() => confirmOverride(item.invoice_number)}
                    okText='Si, Anular'
                    cancelText='Cancelar'
                  >
                    <IconCircleX />
                  </Popconfirm>
                </div>
              )
            )}
          </div>
        ),
      }
    })
  }

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint: () => {
      toast.success('La factura se ha impreso correctamente')
    },
    onPrintError: () => {
      toast.error('Ha ocurrido un error al imprimir la factura')
    },
    removeAfterPrint: true,
  })

  const printOut = async () => {
    handlePrint()
  }

  const setDataToprint = async (invoiceData: IInvoiceProps) => {
    const dataTransformed = await buildPrintDataFromInvoiceProps(invoiceData)
    setPrintData(dataTransformed)
  }

  return (
    <section className='relative h-full'>
      <ContentLayout
        pageTitle='Facturas'
        dataSource={pushActionToList() as unknown as DataPropsForm[]}
        columns={columns}
        fetching={isLoading}
        totalItems={invoicesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
      />
      {printData?.dataItems?.length > 0 && (
        <div ref={printOutRef} className='flex absolute -z-10'>
          <PrintOut printDataComponent={printData} />
        </div>
      )}
    </section>
  )
}
export { Invoices }
