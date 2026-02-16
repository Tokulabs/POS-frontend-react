import React, { FC, useContext, useLayoutEffect } from 'react'
import { formatDateTime } from '@/layouts/helpers/helpers'
import {
  buildPrintDataFromInvoiceProps,
  calcTotalPrices,
  formatNumberToColombianPesos,
  safeValue,
} from '@/utils/helpers'
import OverrideImage from '@/assets/logos/images.png'
import { PaymentMethodsEnum } from '@/pages/POS/components/types/PaymentMethodsTypes'
import { store } from '@/store'
import usePrintInfo from '@/hooks/usePrintInfo'
import { useQuery } from '@tanstack/react-query'
import { getInvoiceByCode } from '@/pages/Invoices/helpers/services'
import { IPosData } from '@/pages/POS/components/types/TableTypes'

interface PrintInvoiceProps {
  id: string
  onAfterPrint?: () => void
  autoPrint?: boolean
}

const PrintOut: FC<PrintInvoiceProps> = ({ id, onAfterPrint, autoPrint = true }) => {
  const { state } = useContext(store)

  const { data: invoice } = useQuery({
    queryKey: ['printInvoice', id],
    queryFn: async () => await getInvoiceByCode(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  })

  const { printContentRef, triggerPrint } = usePrintInfo({
    documentTitle: 'Factura',
    onAfterPrint,
  })

  useLayoutEffect(() => {
    if (invoice && autoPrint) {
      triggerPrint()
    }
  }, [invoice, triggerPrint, autoPrint])

  if (!invoice) return null

  const {
    customer: customerData,
    invoice_items: dataItems,
    payment_methods: paymentMethods,
    sale_by: saleBy,
    dian_resolution: dianResolution,
    invoice_number: invoiceNumber,
    is_override: isOverride,
    created_at,
  } = invoice

  const showDataitems = buildPrintDataFromInvoiceProps(invoice)

  const { discountCOP, taxesIVACOP, totalCOP, subtotalCOP } = calcTotalPrices(
    showDataitems.dataItems,
  )

  return (
    <article
      ref={printContentRef}
      className='bg-transparent text-black flex flex-col w-[18.5rem] justify-center items-center text-center p-2 gap-1 relative'
    >
      {isOverride && (
        <img
          className='absolute left-0 top-24 -z-10 opacity-40 w-72 h-96'
          src={OverrideImage}
          alt='override_logo'
        />
      )}
      {state.user?.company.logo && (
        <img
          src={safeValue(state.user?.company.logo)}
          alt='logo_company'
          className='object-contain w-full h-32'
        />
      )}
      <h4 className='m-0'>{safeValue(state.user?.company.name)}</h4>
      <h5 className='m-0'>{`NIT. ${safeValue(state.user?.company.nit)}`}</h5>
      <h5 className='m-0'>COMPLEJO TURISTICO CATEDRAL DE SAL</h5>

      <section className='flex flex-col items-center justify-center gap-1'>
        <p className='m-0 text-sm'>Tel. +57 {safeValue(state.user?.company.phone)}</p>
        <p className='m-0 text-xs'>
          {`Documento informativo, pendiente expedición FE, ${safeValue(dianResolution?.document_number)}`}
        </p>
        <p className='m-0 text-xs'>
          {`del ${safeValue(dianResolution?.from_date)} Vigente hasta ${safeValue(dianResolution?.to_date)}`}
        </p>
        <p className='m-0 text-[0.75rem] mb-2'>
          habilita del {safeValue(dianResolution?.from_number)} al{' '}
          {safeValue(dianResolution?.to_number)}
        </p>
        <p className='self-start m-0 text-xs'>
          Nombre: {safeValue(customerData?.name)} ID: {safeValue(customerData?.document_id)}
        </p>
        <section className='flex items-center justify-between w-full'>
          <p className='m-0 text-xs text-start'>D. E ./P. O. S GUA-{safeValue(invoiceNumber)}</p>
          <p className='m-0 text-xs text-start'>
            Fec. {created_at ? formatDateTime(created_at, true, false) : safeValue(undefined)}
          </p>
        </section>
      </section>

      <article>
        <section className='grid grid-cols-4 w-full p-1 border-0 border-b-[1px] border-black border-solid'>
          <p className='m-0 text-sm font-bold text-left'>Cod.</p>
          <p className='m-0 text-sm font-bold text-left'>Descripción</p>
          <p className='m-0 text-sm font-bold text-right'>Cant.</p>
          <p className='m-0 text-sm font-bold text-right'>Subtotal</p>
        </section>

        <section className='border-0 border-b-[1px] border-black border-solid p-1'>
          {dataItems.map((item, index) => (
            <div key={index} className='grid w-full grid-cols-4 gap-2'>
              <p className='m-0 text-xs text-left truncate'>{safeValue(item.item_code)}</p>
              <p className='m-0 text-xs text-left uppercase'>{safeValue(item.item_name)}</p>
              <p className='m-0 text-xs text-right'>{safeValue(item.quantity)}</p>
              <p className='m-0 text-xs text-right'>
                {formatNumberToColombianPesos(item.original_amount ?? 0)}
              </p>
            </div>
          ))}
        </section>

        <section className='grid grid-cols-2 pt-3 border-0 border-b-[1px] border-black border-solid p-1'>
          <section className='text-xs font-bold text-right'>
            <p className='m-0 text-sm text-right'>Subtotal base</p>
            <p className='m-0 text-sm text-right'>IVA 19%</p>
            <p className='m-0 text-sm text-right'>Descuento</p>
            <p className='m-0 text-sm text-right'>Total</p>
          </section>
          <section className='text-xs text-right'>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(subtotalCOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(taxesIVACOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(discountCOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(totalCOP)}</p>
          </section>
        </section>

        <section className='grid w-full grid-cols-4 p-1'>
          <p className='m-0 text-xs font-bold text-left'>Medio pago</p>
          <p className='m-0 text-xs font-bold text-right'>pago</p>
          <p className='m-0 text-xs font-bold text-right'>recibe</p>
          <p className='m-0 text-xs font-bold text-right'>camb</p>
        </section>

        <section className='p-1'>
          {paymentMethods.map((item, index) => (
            <div key={index} className='grid w-full grid-cols-4 gap-2'>
              <p className='m-0 text-xs text-left'>
                {safeValue(
                  PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum],
                )}
                {item.transaction_code ? ` - ${safeValue(item.transaction_code)}` : ''}
              </p>
              <p className='m-0 text-xs text-right'>
                {formatNumberToColombianPesos(item.paid_amount ?? 0)}
              </p>
              <p className='m-0 text-xs text-right'>
                {formatNumberToColombianPesos(item.received_amount ?? 0)}
              </p>
              <p className='m-0 text-xs text-right'>
                {formatNumberToColombianPesos(item.back_amount ?? 0)}
              </p>
            </div>
          ))}
        </section>
      </article>

      <h5 className='self-start'>Vendedor: {safeValue(saleBy?.fullname)}</h5>
      <h4 className='font-bold uppercase'>GRACIAS POR SU COMPRA !!!!</h4>
    </article>
  )
}

export default PrintOut
