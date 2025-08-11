import React, { useEffect, useContext } from 'react'
import usePrintInfo from '@/hooks/usePrintInfo'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceByCode } from '@/pages/Invoices/helpers/services'
import { store } from '@/store'
import { formatDateTime } from '@/layouts/helpers/helpers'
import {
  formatNumberToColombianPesos,
  calcTotalPrices,
  buildPrintDataFromInvoiceProps,
} from 'src/utils/helpers'
import { PaymentMethodsEnum } from '@/pages/POS/components/types/PaymentMethodsTypes'

interface PrintInvoiceProps {
  id: string
  onAfterPrint?: () => void
}

const PrintInvoice: React.FC<PrintInvoiceProps> = ({ id, onAfterPrint }) => {
  const { printContentRef, triggerPrint } = usePrintInfo()
  const { state } = useContext(store)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['printInvoice', id],
    queryFn: async () => await getInvoiceByCode(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  useEffect(() => {
    if (invoice) {
      triggerPrint()
      if (onAfterPrint) onAfterPrint()
    }
  }, [invoice, onAfterPrint, triggerPrint])

  if (isLoading || !invoice) return null

  const company = state.user?.company
  const printData = buildPrintDataFromInvoiceProps(invoice)
  const totals = calcTotalPrices(printData.dataItems)

  return (
    <div ref={printContentRef} className='p-20'>
      {state.user?.company.logo && (
        <img
          src={state.user?.company.logo}
          alt='logo_company'
          className='object-contain w-full h-32'
        />
      )}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <div className='text-3xl font-bold mb-2'>Factura #{invoice.invoice_number}</div>
          <div className='flex justify-between mb-1'>
            <strong>Fecha de emisión </strong>
            <span className='text-right'>{formatDateTime(invoice.created_at)}</span>
          </div>
          <div className='flex justify-between mb-1'>
            <strong>Cliente</strong>
            <span className='text-right'>{invoice.customer?.name}</span>
            <strong>ID </strong> {invoice.customer?.document_id}
          </div>
          <div className='flex justify-between mb-1'>
            <strong>Resolución DIAN</strong>
            <span className='text-right'>{invoice.dian_resolution?.document_number}</span>
          </div>
          <div className='flex justify-between mb-1'>
            <strong>Rango</strong>
            <span className='text-right'>
              {invoice.dian_resolution?.from_number} - {invoice.dian_resolution?.to_number}
            </span>
          </div>
          <div className='flex justify-between mb-1'>
            <strong>Vendedor</strong>
            <span className='text-right'>{invoice.sale_by?.fullname}</span>
          </div>
          <div className='flex justify-between mb-1'>
            <strong>Total</strong>
            <span className='text-right'>{formatNumberToColombianPesos(totals.totalCOP)}</span>
          </div>
        </div>
        <div className='justify-self-end text-right'>
          <span className='text-xl font-semibold mb-1'>{company?.name}</span>
          <br />
          <span className='text-sm mb-1'>{company?.nit}</span>
          <br />
          <span className='text-xs mb-1'>Tel: {company?.phone}</span>
          <br />
          <span className='text-xs mb-1 text-cyan-600 underline'>{company?.email}</span>
        </div>
      </div>

      <table className='w-full border-t border-black mt-8 text-sm'>
        <thead className='border-b border-black'>
          <tr className='text-left'>
            <th className='py-2 px-2 font-semibold'>Producto</th>
            <th className='py-2 px-2 font-semibold'>Cantidad</th>
            <th className='py-2 px-2 font-semibold'>Precio</th>
            <th className='py-2 px-2 font-semibold'>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {printData.dataItems.map((item) => (
            <tr key={item.id} className='align-top'>
              <td className='py-1 px-2'>{item.name}</td>
              <td className='py-1 px-2'>{item.quantity}</td>
              <td className='py-1 px-2'>{formatNumberToColombianPesos(item.selling_price)}</td>
              <td className='py-1 px-2'>
                {formatNumberToColombianPesos(item.total_in_shops ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='mt-4 flex justify-between items-center'>
        {/* Métodos de pago */}
        <div>
          <h3 className='font-bold mb-2'>Métodos de pago:</h3>
          <ul className='space-y-3'>
            {invoice.payment_methods?.map((pm, idx) => {
              const methodKey = pm.name as keyof typeof PaymentMethodsEnum
              const displayName = PaymentMethodsEnum[methodKey] ?? pm.name

              return (
                <li key={idx}>
                  <div className='font-semibold mb-1'>{displayName}</div>
                  <ul className='text-sm'>
                    <li>
                      <span className='font-medium'>Pagado:</span>{' '}
                      {pm.paid_amount ? formatNumberToColombianPesos(pm.paid_amount) : '-'}
                    </li>
                    <li>
                      <span className='font-medium'>Recibido:</span>{' '}
                      {pm.received_amount ? formatNumberToColombianPesos(pm.received_amount) : '-'}
                    </li>
                    <li>
                      <span className='font-medium'>Cambio:</span>{' '}
                      {pm.back_amount ? formatNumberToColombianPesos(pm.back_amount) : '$ 0'}
                    </li>
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
        <div className='flex justify-end'>
          <div className='text-right space-y-1'>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>Subtotal base:</span>
              <span>{formatNumberToColombianPesos(totals.subtotalCOP)}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>IVA 19%:</span>
              <span>{formatNumberToColombianPesos(totals.taxesIVACOP)}</span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='font-semibold'>Descuento:</span>
              <span>{formatNumberToColombianPesos(totals.discountCOP)}</span>
            </div>
            <div className='flex justify-between gap-4 font-bold text-lg pt-2 border-t border-dashed mt-2'>
              <span>Total:</span>
              <span>{formatNumberToColombianPesos(totals.totalCOP)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-6 text-center font-bold uppercase'>¡GRACIAS POR SU COMPRA!</div>

      <span className='text-center w-[40%] block mt-[15%] text-sm border-black border-t'>
        Firma Recibido
      </span>
    </div>
  )
}

export default PrintInvoice
