// React
import { FC, useEffect, useState } from 'react'
// Third party
import { Button, Popconfirm, Spin, Tooltip } from 'antd'
import {
  IconCheck,
  IconFiles,
  IconEdit,
  IconFileCheck,
  IconFileOff,
  IconPrinter,
  IconSend,
  IconX,
  IconFileDollar,
  IconClipboardOff,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// Custom Components and Layouts
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { ChangePaymentMethodsInvoice } from './Components/ChangePaymentMethodsInvoice'
// Types
import { DataPropsForm } from '@/types/GlobalTypes'
import { IInvoiceMinimalProps } from './types/InvoicesTypes'
import { ModalStateEnum } from '@/types/ModalTypes'
import { PaymentMethodsEnum } from '../POS/components/types/PaymentMethodsTypes'
import { UserRolesEnum } from '../Users/types/UserTypes'
// Data
import { columns } from './data/columnsData'
// Helpers and Utilities
import { formatDateTime } from '@/layouts/helpers/helpers'
import { formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { patchOverrideInvoice, postSendElectronicInvoice } from './helpers/services'
// Hooks
import { useInvoices } from '@/hooks/useInvoices'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { createPortal } from 'react-dom'
import PrintOut from '@/components/Print/PrintInvoice'

const Invoices: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [invoiceIdToEdit, setInvoiceIdToEdit] = useState<number>(0)
  const [search, setSearch] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState<
    'all' | 'sent' | 'notSent' | 'toSent' | 'override'
  >('all')
  const [invoiceToPrint, setInvoiceToPrint] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const statusDictionary = {
    all: {},
    sent: { is_electronic_invoiced: 'True' },
    notSent: { is_electronic_invoiced: 'False' },
    toSent: { send_electronic_invoice: 'True', is_electronic_invoiced: 'False' },
    override: { is_override: 'True' },
  }

  const { isLoading, invoicesData } = useInvoices('paginatedInvoices', {
    keyword: search,
    page: currentPage,
    ...statusDictionary[invoiceStatus],
  })

  const allowedRolesOverride = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.shopAdmin,
  ]
  const allowedRolesEditPaymentMethods = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission } = useRolePermissions({ allowedRoles: allowedRolesOverride })
  const { hasPermission: hasPermissionEditPaymentMethods } = useRolePermissions({
    allowedRoles: allowedRolesEditPaymentMethods,
  })

  const { mutate: mutateOverride, isPending: isLoadingOverride } = useMutation({
    mutationFn: patchOverrideInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedInvoices', { page: currentPage }] })
      toast.info('Factura anulada!')
    },
  })

  const { mutate: mutateElectronicInvoice, isPending: isLoadingElectronicInvoice } = useMutation({
    mutationFn: postSendElectronicInvoice,
    onSuccess: (response) => {
      if (response?.data.success) {
        queryClient.invalidateQueries({ queryKey: ['paginatedInvoices', { page: currentPage }] })
        toast.info('Factura enviada correctamente!')
        setCurrentPage(1)
      } else {
        toast.error('Ha ocurrido un error al enviar la factura electrónica')
      }
    },
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [invoiceStatus])

  const confirmOverride = (id: string) => {
    if (isLoadingOverride) return
    mutateOverride(id)
  }

  const sendElectronicInvoice = (id: number) => {
    mutateElectronicInvoice(id)
  }

  const editPaymentInformation = (item: IInvoiceMinimalProps) => () => {
    setInvoiceIdToEdit(Number(item.invoice_number))
    setModalState(ModalStateEnum.addItem)
  }

  const pushActionToList = () => {
    const invoiceData: IInvoiceMinimalProps[] =
      invoicesData?.results ?? ([] as IInvoiceMinimalProps[])

    return invoiceData.map((item) => {
      const isDebitOrCredit = item.payment_methods.some(
        (pm) =>
          PaymentMethodsEnum[pm.name as keyof typeof PaymentMethodsEnum] ===
            PaymentMethodsEnum.debitCard ||
          PaymentMethodsEnum[pm.name as keyof typeof PaymentMethodsEnum] ===
            PaymentMethodsEnum.creditCard,
      )

      const methodsStrings = item.payment_methods
        .map((pm) => PaymentMethodsEnum[pm.name as keyof typeof PaymentMethodsEnum])
        .join(', ')

      return {
        ...item,
        sale_by_name: item.sale_by?.fullname ?? 'SuperAdmin',
        created_at: formatDateTime(item.created_at as string),
        total: formatNumberToColombianPesos(item.total_sum),
        is_dollar: item.is_dollar ? `USD (${formatToUsd(item.total_sum_usd)})` : 'COP',
        is_override: item.is_override ? (
          <div className='flex items-center justify-center w-full text-red-1'>
            <IconX />
          </div>
        ) : null,
        is_electronic_invoiced: item.is_electronic_invoiced ? (
          <div className='flex items-center justify-center w-full text-green-1'>
            <IconCheck />
          </div>
        ) : null,
        paid_by: (
          <div className='flex items-center justify-start'>
            {hasPermissionEditPaymentMethods && !item.is_electronic_invoiced && (
              <Button
                type='link'
                className='flex items-center justify-center p-0 m-0'
                onClick={editPaymentInformation(item)}
              >
                <IconEdit />
              </Button>
            )}
            {isDebitOrCredit ? (
              <Tooltip
                mouseLeaveDelay={0.3}
                destroyTooltipOnHide
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
            )}
          </div>
        ),
        action: (
          <div className='flex gap-3 text-3xl'>
            <div className='cursor-pointer text-green-1 hover:text-green-800'>
              <Popconfirm
                title='Imprimir factura'
                description='¿Estás seguro de que deseas imprimir esta factura?'
                onConfirm={() => setInvoiceToPrint(item.invoice_number)}
                okText='Sí, imprimir'
                cancelText='Cancelar'
              >
                <IconPrinter />
              </Popconfirm>
            </div>
            {isLoadingOverride || isLoadingElectronicInvoice ? (
              <Spin />
            ) : (
              <>
                {hasPermissionEditPaymentMethods &&
                  !item.is_electronic_invoiced &&
                  !item.is_override && (
                    <div>
                      <Popconfirm
                        title='Enviar factura electrónica'
                        description='¿Estás seguro de enviar esta factura?'
                        onConfirm={() => sendElectronicInvoice(Number(item.id))}
                        okText='Sí, enviar'
                        cancelText='Cancelar'
                      >
                        <IconSend className='text-blue-600 cursor-pointer hover:text-blue-400' />
                      </Popconfirm>
                    </div>
                  )}
                {hasPermission && !item.is_electronic_invoiced && !item.is_override && (
                  <div className='cursor-pointer text-red-1 hover:text-red-800'>
                    <Popconfirm
                      title='Anular factura'
                      description='¿Estás seguro de anular esta factura?'
                      onConfirm={() => confirmOverride(item.invoice_number)}
                      okText='Sí, anular'
                      cancelText='Cancelar'
                    >
                      <IconFileOff />
                    </Popconfirm>
                  </div>
                )}
              </>
            )}
          </div>
        ),
      }
    })
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
        filterOptions={[
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('toSent')}>
                <IconSend /> Pendientes por facturar
              </span>
            ),
            key: 0,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('sent')}>
                <IconFileCheck /> Facturas Electrónicas
              </span>
            ),
            key: 1,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('notSent')}>
                <IconFileDollar /> Facturas de venta
              </span>
            ),
            key: 2,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('all')}>
                <IconFiles /> Todas
              </span>
            ),
            key: 3,
          },
          {
            label: (
              <span
                className='flex items-center gap-3'
                onClick={() => setInvoiceStatus('override')}
              >
                <IconClipboardOff /> Anuladas
              </span>
            ),
            key: 4,
          },
        ]}
      />

      {modalState === ModalStateEnum.addItem && (
        <ChangePaymentMethodsInvoice
          invoiceId={invoiceIdToEdit}
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      )}

      {invoiceToPrint &&
        createPortal(
          <div
            className='fixed w-0 h-0 overflow-hidden pointer-events-none opacity-0'
            aria-hidden='true'
          >
            <PrintOut id={invoiceToPrint} onAfterPrint={() => setInvoiceToPrint(null)} />
          </div>,
          document.getElementById('root')!,
        )}
    </section>
  )
}

export { Invoices }
