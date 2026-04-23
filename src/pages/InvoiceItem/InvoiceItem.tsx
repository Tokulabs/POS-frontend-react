import { FC, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getInvoiceByCode, getDownloadInvoicePdf } from '../Invoices/helpers/services'
import SimplePDFViewer from '@/components/PDFViewer/PDFViewer'
import { buildPrintDataFromInvoiceProps, calcTotalPrices } from '@/utils/helpers'
import { patchOverrideInvoice, postSendElectronicInvoice } from '../Invoices/helpers/services'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'
import PrintInvoice from '@/components/Print/PrintInvoice'
import { useHasPermission } from '@/hooks/useHasPermission'
import { axiosRequest } from '@/api/api'
import { restaurantOrderByInvoiceURL } from '@/utils/network'
import {
  InvoiceHeader,
  InvoiceDetailsPanel,
  InvoiceItemsTable,
  InvoiceTotals,
  InvoiceActions,
  InvoicePrintPreview,
} from './components'
import { CreateCreditNoteForm } from '@/pages/CreditNotes/Components/CreateCreditNoteForm'

export const InvoiceItem: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [invoiceToPrint, setInvoiceToPrint] = useState<string | null>(null)
  const [createCreditNoteOpen, setCreateCreditNoteOpen] = useState(false)
  const handleOpenCreateCreditNote = useCallback(() => setCreateCreditNoteOpen(true), [])

  const decodedID = id ? id : ''

  // Permission checks
  const canOverride = useHasPermission('can_void_invoice')
  const canSendInvoice = useHasPermission('can_send_electronic_invoice')
  const canCreateCreditNote = useHasPermission('can_create_credit_note')

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

  const handleOverride = (reason: string) => {
    if (invoiceData?.invoice_number) {
      mutateOverride({ invoiceNumber: String(invoiceData.invoice_number), reason })
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

  // Try to find a linked restaurant order for this invoice
  const { data: restaurantOrder } = useQuery({
    queryKey: ['restaurantOrderByInvoice', invoiceData?.invoice_number],
    queryFn: async () => {
      const url = new URL(restaurantOrderByInvoiceURL)
      url.searchParams.set('invoice_number', String(invoiceData!.invoice_number))
      const res = await axiosRequest<{ id: number; order_number: string; table_number: string | null }>({
        url,
        hasAuth: true,
        showError: false,
      })
      return res?.data ?? null
    },
    enabled: !!invoiceData?.invoice_number,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  if (isLoading) {
    return <div className='flex items-center justify-center w-full h-full'>Loading...</div>
  }

  if (!invoiceData) {
    return <div className='flex items-center justify-center w-full h-full'>No invoice found</div>
  }

  const totals = calcTotalPrices(buildPrintDataFromInvoiceProps(invoiceData).dataItems)

  const taxLines = invoiceData.invoice_items
    .filter((item) => !item.is_gift)
    .flatMap((item) => item.taxes_applied ?? [])
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.name] = (acc[t.name] ?? 0) + t.amount
      return acc
    }, {})

  return (
    <>
      <div className='flex flex-col w-full h-full gap-4 overflow-y-auto lg:overflow-hidden'>
        <InvoiceHeader invoiceNumber={String(invoiceData.invoice_number)} />

        <div className='flex flex-col flex-1 gap-4 sm:gap-6 lg:flex-row lg:overflow-hidden min-h-0'>
          {/* Invoice Details Panel - Always shown */}
          <InvoiceDetailsPanel
            createdAt={invoiceData.created_at}
            customerName={invoiceData.customer?.name || ''}
            cufe={invoiceData.cufe}
            eInvoiceNumber={invoiceData.e_invoice_number}
            dianPrefix={invoiceData.dian_resolution?.prefix}
            restaurantOrder={restaurantOrder}
            invoiceNumber={invoiceData.invoice_number}
            isElectronicInvoiced={invoiceData.is_electronic_invoiced}
            isOverride={invoiceData.is_override}
            overrideReason={invoiceData.override_reason}
            creditNotesCount={invoiceData.credit_notes_count ?? 0}
            canCreateCreditNote={canCreateCreditNote}
            onCreateCreditNote={handleOpenCreateCreditNote}
            footer={
              <InvoiceActions
                onPrint={handlePrint}
                onDownload={() => {
                  if (pdfUrl) {
                    const link = document.createElement('a')
                    link.href = pdfUrl
                    link.download = `factura-${invoiceData.invoice_number}.pdf`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } else {
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
              taxLines={taxLines}
              tip={invoiceData.tip}
            />
          </InvoiceDetailsPanel>

          {/* PDF Viewer or Print Preview */}
          {isPdfLoading && invoiceData.cufe ? (
            <div className='flex flex-col items-center justify-center flex-1 min-h-[500px] lg:min-h-0 bg-secondary rounded-lg gap-3'>
              <div className='animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent'></div>
              <p className='text-sm text-muted-foreground font-medium'>Cargando PDF...</p>
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

      <CreateCreditNoteForm
        open={createCreditNoteOpen}
        prefilledInvoiceNumber={String(invoiceData.invoice_number)}
        onSuccess={() => {
          setCreateCreditNoteOpen(false)
          queryClient.invalidateQueries({ queryKey: ['invoice', decodedID] })
        }}
        onCancel={() => setCreateCreditNoteOpen(false)}
      />

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
