// Helpers
import { calcMetaDataProdudct, formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
// Components
import { AddDataAndPaymentMethods } from './AddDataAndPaymentMethods'
import Clock from '@/components/Clock/Clock'
// Store
import { useCart } from '@/store/useCartStoreZustand'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
// Types
import { IPaginationProps } from '@/types/GlobalTypes'
import { IDianResolutionProps } from '@/pages/Dian/types/DianResolutionTypes'

interface SideBarDataPOSProps {
  dianResolutionData: IPaginationProps<IDianResolutionProps> | undefined
}

export const SideBarDataPOS = ({ dianResolutionData }: SideBarDataPOSProps) => {
  const currentNumber = dianResolutionData?.results[0]?.current_number ?? null
  const nextNumber = currentNumber !== null ? currentNumber + 1 : '0'

  const { subtotalCOP, discountCOP, totalCOP, totalUSD, cartItems } = useCart()
  const { tipAmount } = usePaymentMethodsData()

  // Group taxes by rate label (INC 8%, IVA 19%, IVA 0%, etc.)
  const taxLines = cartItems.reduce<Record<string, number>>((acc, item) => {
    const { itemTaxesCOP } = calcMetaDataProdudct(item)
    if (itemTaxesCOP === 0) return acc
    const pct = item.tax?.percentage ?? 19
    const label = pct === 8 ? `INC ${pct}%` : `IVA ${pct}%`
    acc[label] = (acc[label] ?? 0) + itemTaxesCOP
    return acc
  }, {})

  return (
    <nav className='w-1/4 h-full flex flex-col justify-between bg-card shadow-lg rounded-sm border-solid border border-green-1'>
      <section className='flex flex-col p-5 w-full justify-start gap-1 bg-card shadow-md'>
        <div className='flex justify-between items-end'>
          <span className='text-xs'>Resolución activa:</span>
          <span className='text-green-1 font-bold truncate'>
            {dianResolutionData?.results[0].document_number}
          </span>
        </div>
        <div className='flex gap-1 justify-between items-end'>
          <span className='text-xs'># de factura:</span>

          <span className='text-green-1 font-bold truncate'>GUA-{nextNumber}</span>
        </div>
        <div className='flex gap-1 justify-between items-end'>
          <span className='text-xs'>Fecha y Hora:</span>
          <span className='text-green-1 font-bold truncate'>
            <Clock />
          </span>
        </div>
      </section>
      <AddDataAndPaymentMethods />
      <section className='w-full bg-card'>
        <div className='bg-secondary shadow-inner flex justify-center flex-col items-center gap-4 text-sm font-semibold p-5'>
          <div className='flex w-full justify-between items-center'>
            <span>Subtotal COP</span>
            <span>{formatNumberToColombianPesos(subtotalCOP)}</span>
          </div>
          <div className='flex w-full justify-between items-center'>
            <span>Descuento</span>
            <span className={discountCOP > 0 ? 'text-green-1' : ''}>
              {formatNumberToColombianPesos(discountCOP)}
            </span>
          </div>
          {Object.entries(taxLines).map(([label, amount]) => (
            <div key={label} className='flex w-full justify-between items-center'>
              <span>
                {label.split(' ')[0]} <span className='text-green-1'>{label.split(' ')[1]}</span>
              </span>
              <span>{formatNumberToColombianPesos(amount)}</span>
            </div>
          ))}
          {Object.keys(taxLines).length === 0 && (
            <div className='flex w-full justify-between items-center'>
              <span>Impuestos</span>
              <span>{formatNumberToColombianPesos(0)}</span>
            </div>
          )}
        </div>
        <div className='w-full border-solid border-t border-x-0 border-b-0 border-green-1 rounded-b-sm p-5 flex flex-col gap-2 font-bold'>
          {tipAmount > 0 && (
            <div className='flex justify-between items-end w-full text-sm font-semibold text-muted-foreground'>
              <span>Propina</span>
              <span>{formatNumberToColombianPesos(tipAmount)}</span>
            </div>
          )}
          <div className='flex justify-between items-end w-full'>
            <span className='text-base'>Total a pagar COP</span>
            <span className='text-2xl text-green-1'>{formatNumberToColombianPesos(totalCOP + tipAmount)}</span>
          </div>
          <div className='flex justify-between items-end w-full'>
            <span className='text-base'>Total a pagar USD</span>
            <span className='text-2xl text-green-1'>{formatToUsd(totalUSD)}</span>
          </div>
        </div>
      </section>
    </nav>
  )
}
