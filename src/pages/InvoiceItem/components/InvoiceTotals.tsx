import { FC } from 'react'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface InvoiceTotalsProps {
  subtotal: number
  tax: number
  discount: number
  total: number
  taxLines?: Record<string, number>
  tip?: number
}

export const InvoiceTotals: FC<InvoiceTotalsProps> = ({ subtotal, tax, discount, total, taxLines, tip }) => {
  const hasTaxLines = taxLines && Object.keys(taxLines).length > 0
  const tipAmount = tip ?? 0

  return (
    <div className='pt-4'>
      <div className='flex justify-end'>
        <div className='w-64 space-y-2'>
          <div className='flex justify-between'>
            <span className='font-semibold'>Subtotal base</span>
            <span>{formatNumberToColombianPesos(subtotal)}</span>
          </div>
          {hasTaxLines
            ? Object.entries(taxLines).map(([name, amount]) => (
                <div key={name} className='flex justify-between'>
                  <span className='font-semibold'>{name}</span>
                  <span>{formatNumberToColombianPesos(amount)}</span>
                </div>
              ))
            : (
              <div className='flex justify-between'>
                <span className='font-semibold'>IVA 19%</span>
                <span>{formatNumberToColombianPesos(tax)}</span>
              </div>
            )
          }
          <div className='flex justify-between'>
            <span className='font-semibold'>Descuento</span>
            <span>{formatNumberToColombianPesos(discount)}</span>
          </div>
          <div className='flex justify-between pt-2 text-lg font-bold border-t'>
            <span>Total</span>
            <span>{formatNumberToColombianPesos(total)}</span>
          </div>
          {tipAmount > 0 && (
            <div className='flex justify-between'>
              <span className='font-semibold'>Propina</span>
              <span>{formatNumberToColombianPesos(tipAmount)}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div className='flex justify-between pt-2 text-lg font-bold border-t'>
              <span>A pagar</span>
              <span>{formatNumberToColombianPesos(total + tipAmount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
