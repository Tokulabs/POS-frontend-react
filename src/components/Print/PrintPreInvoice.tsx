import { FC, useContext, useLayoutEffect } from 'react'
import { store } from '@/store'
import usePrintInfo from '@/hooks/usePrintInfo'
import { IRestaurantOrder } from '@/pages/Restaurant/types/RestaurantTypes'
import { formatNumberToColombianPesos, safeValue } from '@/utils/helpers'

interface PrintPreInvoiceProps {
  order: IRestaurantOrder
  tipPercent?: number
  onAfterPrint?: () => void
}

const PrintPreInvoice: FC<PrintPreInvoiceProps> = ({ order, tipPercent = 10, onAfterPrint }) => {
  const { state } = useContext(store)
  const { printContentRef, triggerPrint } = usePrintInfo({ documentTitle: 'Pre-cuenta', onAfterPrint })

  useLayoutEffect(() => {
    triggerPrint()
  }, [triggerPrint])

  const activeItems = order.order_items.filter((i) => i.status !== 'cancelled' && i.parent_item === null)
  const subtotal = activeItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const tipAmount = Math.round(subtotal * (tipPercent / 100))
  const total = subtotal + tipAmount

  return (
    <article
      ref={printContentRef}
      className='bg-transparent text-black flex flex-col w-74 justify-center items-center text-center p-2 gap-1'
    >
      {state.user?.company.logo && (
        <img
          src={safeValue(state.user?.company.logo)}
          alt='logo_company'
          className='object-contain w-full h-32'
        />
      )}
      <h4 className='m-0'>{safeValue(state.user?.company.name)}</h4>
      <h5 className='m-0'>{`NIT. ${safeValue(state.user?.company.nit)}`}</h5>
      {state.user?.company.invoice_subtitle && (
        <h5 className='m-0'>{state.user.company.invoice_subtitle}</h5>
      )}
      <p className='m-0 text-sm'>Tel. +57 {safeValue(state.user?.company.phone)}</p>

      <h3 className='m-0 font-bold uppercase border-0 border-y border-black border-solid w-full py-1'>
        PRE-CUENTA
      </h3>

      <section className='flex flex-col items-start w-full gap-0.5 text-xs mt-1'>
        <p className='m-0'>
          Comanda: <strong>{order.order_number}</strong>
        </p>
        {order.table_number && (
          <p className='m-0'>
            Mesa: <strong>{order.table_number}</strong>
          </p>
        )}
        <p className='m-0'>
          {new Date(order.created_at).toLocaleString('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </section>

      <section className='grid grid-cols-4 w-full p-1 border-0 border-b border-black border-solid mt-1'>
        <p className='m-0 text-sm font-bold text-left col-span-2'>Descripción</p>
        <p className='m-0 text-sm font-bold text-right'>Cant.</p>
        <p className='m-0 text-sm font-bold text-right'>Total</p>
      </section>

      <section className='border-0 border-b border-black border-solid p-1 w-full'>
        {activeItems.map((item, index) => (
          <div key={index} className='grid w-full grid-cols-4 gap-1'>
            <p className='m-0 text-xs text-left uppercase col-span-2'>{item.item_name}</p>
            <p className='m-0 text-xs text-right'>{item.quantity}</p>
            <p className='m-0 text-xs text-right'>
              {formatNumberToColombianPesos(item.unit_price * item.quantity)}
            </p>
          </div>
        ))}
      </section>

      <section className='flex flex-col pt-2 w-full p-1 border-0 border-b border-black border-solid gap-0.5'>
        <div className='flex justify-between text-sm'>
          <span>Subtotal</span>
          <span>{formatNumberToColombianPesos(subtotal)}</span>
        </div>
        <div className='flex justify-between text-sm'>
          <span>Propina sugerida ({tipPercent}%)</span>
          <span>{formatNumberToColombianPesos(tipAmount)}</span>
        </div>
        <div className='flex justify-between text-sm font-bold'>
          <span>Total a pagar</span>
          <span>{formatNumberToColombianPesos(total)}</span>
        </div>
      </section>

      {state.user?.company.invoice_footer && (
        <h4 className='font-bold uppercase'>{state.user.company.invoice_footer}</h4>
      )}
      <p className='m-0 text-xs mt-1'>* Documento no equivale a factura de venta</p>
    </article>
  )
}

export default PrintPreInvoice
