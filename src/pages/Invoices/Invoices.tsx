// React
import { FC, useEffect, useRef, useState } from 'react'
// Third party
import { useReactToPrint } from 'react-to-print'
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
  IconFileAlert,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// Custom Components and Layouts
import PrintOut from '@/components/Print/PrintOut'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { ChangePaymentMethodsInvoice } from './Components/ChangePaymentMethodsInvoice'
// Types
import { DataPropsForm, IPrintData } from '@/types/GlobalTypes'
import { IInvoiceMinimalProps, IInvoiceProps } from './types/InvoicesTypes'
import { ModalStateEnum } from '@/types/ModalTypes'
import { PaymentMethodsEnum } from '../POS/components/types/PaymentMethodsTypes'
import { UserRolesEnum } from '../Users/types/UserTypes'
// Data
import { columns } from './data/columnsData'
// Helpers and Utilities
import { formatDateTime } from '@/layouts/helpers/helpers'
import {
  buildPrintDataFromInvoiceProps,
  formatNumberToColombianPesos,
  formatToUsd,
} from '@/utils/helpers'
import {
  getInvoiceByCode,
  patchOverrideInvoice,
  postSendElectronicInvoice,
} from './helpers/services'
// Hooks
import { useInvoices } from '@/hooks/useInvoices'
import { useRolePermissions } from '@/hooks/useRolespermissions'

const Invoices: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [printData, setPrintData] = useState<IPrintData>({} as IPrintData)
  const [isPrintReady, setIsPrintReady] = useState(false)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [invoiceIdToEdit, setInvoiceIdToEdit] = useState<number>(0)
  const [search, setSearch] = useState('')
  const [invoiceStatus, setInvoiceStatus] = useState<'all' | 'sent' | 'notSent' | 'toSent'>('all')

  const queryClient = useQueryClient()

  const statusDictionary = {
    all: {},
    sent: { is_electronic_invoiced: 'True' },
    notSent: { is_electronic_invoiced: 'False' },
    toSent: { send_electronic_invoice: 'True', is_electronic_invoiced: 'False' },
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

  const printOutRef = useRef<HTMLDivElement>(null)

  const { mutate, isPending: isLoadingOverride } = useMutation({
    mutationFn: patchOverrideInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedInvoices', { page: currentPage }] })
      toast.info('Factura anulada!')
    },
  })

  const { mutate: mutatePrint, isPending: isLoadingPrint } = useMutation({
    mutationFn: getInvoiceByCode,
    onSuccess: (invoiceData) => {
      const printData = buildPrintDataFromInvoiceProps(invoiceData as IInvoiceProps)
      setPrintData(printData)
      if (printData.invoiceNumber) {
        setIsPrintReady(true)
      }
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

  useEffect(() => {
    if (isPrintReady && !isLoadingPrint) {
      handlePrint()
      setIsPrintReady(false) // Reset the flag after printing
    }
  }, [isPrintReady, isLoadingPrint])

  const confirmOverride = (id: string) => {
    if (isLoadingOverride) return
    mutate(id)
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
        sale_by_name: item.sale_by?.fullname ?? 'SuperAdmin',
        created_at: formatDateTime(item.created_at as string),
        total: formatNumberToColombianPesos(item.total_sum),
        is_dollar: item.is_dollar ? `USD (${formatToUsd(item.total_sum_usd)})` : 'COP',
        is_override: item.is_override ? (
          <div className='text-red-1 w-full flex justify-center items-center'>
            <IconX />
          </div>
        ) : null,
        is_electronic_invoiced: item.is_electronic_invoiced ? (
          <div className='text-green-1 w-full flex justify-center items-center'>
            <IconCheck />
          </div>
        ) : null,
        paid_by: (
          <div className='flex justify-start items-center'>
            {hasPermissionEditPaymentMethods && !item.is_electronic_invoiced && (
              <Button
                type='link'
                className='p-0 m-0 flex justify-center items-center'
                onClick={editPaymentInformation(item)}
              >
                <IconEdit />
              </Button>
            )}
            {isDebitOrCredit ? (
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
            )}
          </div>
        ),
        action: (
          <div className='flex text-3xl gap-3'>
            <div className='text-green-1 cursor-pointer hover:text-green-800'>
              <Popconfirm
                title='imprimir factua'
                description='¿Estas seguro deseas imprimir esta factura?'
                onConfirm={() => setDataToprint(item.invoice_number)}
                okText='Si, imprimir'
                okButtonProps={{ disabled: isLoadingPrint }}
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
                        description='¿Estas seguro de enviar esta factura?'
                        onConfirm={() => sendElectronicInvoice(Number(item.id))}
                        okText='Si, Enviar'
                        cancelText='Cancelar'
                      >
                        <IconSend className='text-blue-600 hover:text-blue-400 cursor-pointer' />
                      </Popconfirm>
                    </div>
                  )}
                {hasPermission && !item.is_electronic_invoiced && !item.is_override && (
                  <div className='text-red-1 cursor-pointer hover:text-red-800'>
                    <Popconfirm
                      title='Anular factua'
                      description='¿Estas seguro de anular esta factura?'
                      onConfirm={() => confirmOverride(item.invoice_number)}
                      okText='Si, Anular'
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

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint: () => {
      toast.success('La factura se ha impreso correctamente')
      setPrintData({} as IPrintData)
    },
    onPrintError: () => {
      toast.error('Ha ocurrido un error al imprimir la factura')
      setPrintData({} as IPrintData)
    },
    removeAfterPrint: true,
  })

  const setDataToprint = (invoiceNumber: string) => {
    mutatePrint(invoiceNumber)
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
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('sent')}>
                <IconFileCheck />
                Enviadas
              </span>
            ),
            key: 0,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('notSent')}>
                <IconFileAlert /> No enviadas
              </span>
            ),
            key: 1,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('all')}>
                <IconFiles /> Todas
              </span>
            ),
            key: 2,
          },
          {
            label: (
              <span className='flex items-center gap-3' onClick={() => setInvoiceStatus('toSent')}>
                <IconSend /> Por Facturar
              </span>
            ),
            key: 3,
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
      {printData?.dataItems?.length > 0 && (
        <div ref={printOutRef} className='flex absolute -z-10'>
          <PrintOut printDataComponent={printData} />
        </div>
      )}
    </section>
  )
}
export { Invoices }
