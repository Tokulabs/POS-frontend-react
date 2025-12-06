import { FC, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvoiceByCode, getDownloadInvoicePdf } from '../Invoices/helpers/services'
import SimplePDFViewer from '@/components/PDFViewer/PDFViewer'
import { buildPrintDataFromInvoiceProps, calcTotalPrices } from '@/utils/helpers'
import { patchOverrideInvoice, postSendElectronicInvoice } from '../Invoices/helpers/services'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'
import PrintInvoice from '@/components/Print/PrintInvoice'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { UserRolesEnum } from '../Users/types/UserTypes'
import {
  InvoiceHeader,
  InvoiceDetailsPanel,
  InvoiceItemsTable,
  InvoiceTotals,
  InvoiceActions,
  InvoicePrintPreview,
} from './components'

export const InvoiceItem: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [invoiceToPrint, setInvoiceToPrint] = useState<string | null>(null)

  const decodedID = id ? id : ''

  // Permission roles - same as Invoices table
  const allowedRolesOverride = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.shopAdmin,
  ]
  const allowedRolesSendInvoice = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  
  const { hasPermission: canOverride } = useRolePermissions({ allowedRoles: allowedRolesOverride })
  const { hasPermission: canSendInvoice } = useRolePermissions({ allowedRoles: allowedRolesSendInvoice })

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', decodedID],
    queryFn: async () => await getInvoiceByCode(decodedID ?? ''),
    enabled: !!decodedID,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  })

  const { mutate: mutateOverride, isPending: isLoadingOverride } = useMutation({
    mutationFn: patchOverrideInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', decodedID] })
      toast.success('Factura anulada!')
      navigate(-1)
    },
  })

  const { mutate: mutateSendInvoice, isPending: isLoadingSendInvoice } = useMutation({
    mutationFn: postSendElectronicInvoice,
    onSuccess: (response) => {
      if (response?.data.success) {
        queryClient.invalidateQueries({ queryKey: ['invoice', decodedID] })
        toast.success('Factura electrónica enviada correctamente!')
      } else {
        toast.error('Ha ocurrido un error al enviar la factura electrónica')
      }
    },
  })

  const handlePrint = () => {
    if (invoiceData?.cufe && pdfUrl) {
      // Open PDF in new window and print
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
      return
    }
    if (invoiceData?.invoice_number) {
      setInvoiceToPrint(String(invoiceData.invoice_number))
    }
  }

  const handleOverride = () => {
    if (invoiceData?.invoice_number) {
      mutateOverride(String(invoiceData.invoice_number))
    }
  }

  const handleSendInvoice = () => {
    if (invoiceData?.id) {
      mutateSendInvoice(invoiceData.id)
    }
  }

  // Fetch PDF from backend if cufe exists (must be before early returns to follow hooks rules)
  const { data: pdfUrl, isLoading: isPdfLoading } = useQuery({
    queryKey: ['invoicePdf', invoiceData?.id],
    queryFn: async () => await getDownloadInvoicePdf(Number(invoiceData?.id)),
    enabled: !!invoiceData?.cufe,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  if (isLoading) {
    return <div className='flex items-center justify-center w-full h-full'>Loading...</div>
  }

  if (!invoiceData) {
    return <div className='flex items-center justify-center w-full h-full'>No invoice found</div>
  }

  const totals = calcTotalPrices(buildPrintDataFromInvoiceProps(invoiceData).dataItems)

  return (
    <>
      <div className='flex flex-col w-full h-full gap-4 overflow-y-auto lg:overflow-hidden'>
        <InvoiceHeader invoiceNumber={String(invoiceData.invoice_number)} />

        <div className='flex flex-col flex-1 gap-4 sm:gap-6 lg:flex-row lg:overflow-hidden min-h-0'>
          {/* Invoice Details Panel - Always shown */}
          <InvoiceDetailsPanel
            createdAt={invoiceData.created_at}
            customerName={invoiceData.customer?.name || ''}
            footer={
              <InvoiceActions
                onPrint={handlePrint}
                onDownload={() => {
                  if (pdfUrl) {
                    // Electronic invoice - download PDF directly
                    const link = document.createElement('a')
                    link.href = pdfUrl
                    link.download = `factura-${invoiceData.invoice_number}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } else {
                    // Non-electronic invoice - use print dialog to save as PDF
                    handlePrint()
                  }
                }}
                showDownload={true}
                canOverride={canOverride}
                canSendInvoice={canSendInvoice}
                onSendInvoice={handleSendInvoice}
                onOverride={handleOverride}
                isElectronicInvoiced={invoiceData.is_electronic_invoiced}
                isOverride={invoiceData.is_override}
                isLoading={isLoadingOverride || isLoadingSendInvoice}
              />
            }
          >
            <InvoiceItemsTable items={invoiceData.invoice_items} />
            <InvoiceTotals
              subtotal={totals.subtotalCOP}
              tax={totals.taxesIVACOP}
              discount={totals.discountCOP}
              total={totals.totalCOP}
            />
          </InvoiceDetailsPanel>

          {/* PDF Viewer or Print Preview */}
          {isPdfLoading && invoiceData.cufe ? (
            <div className='flex flex-col items-center justify-center flex-1 min-h-[500px] lg:min-h-0 bg-slate-100 rounded-lg gap-3'>
              <div className='animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent'></div>
              <p className='text-sm text-gray-600 font-medium'>Cargando PDF...</p>
            </div>
          ) : pdfUrl ? (
            <div className='flex-1 min-h-[500px] lg:min-h-0'>
              <SimplePDFViewer pdfFilePath={pdfUrl} />
            </div>
          ) : (
            <InvoicePrintPreview invoiceNumber={String(invoiceData.invoice_number)} />
          )}
        </div>
      </div>

      {invoiceToPrint &&
        createPortal(
          <div
            className='fixed w-0 h-0 overflow-hidden opacity-0 pointer-events-none'
            aria-hidden='true'
          >
            <PrintInvoice id={invoiceToPrint} onAfterPrint={() => setInvoiceToPrint(null)} />
          </div>,
          document.body,
        )}
    </>
  )
}
