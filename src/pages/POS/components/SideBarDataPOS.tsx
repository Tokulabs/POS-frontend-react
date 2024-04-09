// Helpers
import { formatNumberToColombianPesos, formatToUsd } from '../../../utils/helpers'
// Components
import { AddDataAndPaymentMethods } from './AddDataAndPaymentMethods'
// Store
import { useCart } from '../../../store/useCartStoreZustand'

export const SideBarDataPOS = () => {
  const { subtotalCOP, discountCOP, taxesIVACOP, totalCOP, totalUSD } = useCart()

  return (
    <nav className='w-1/4 h-full flex flex-col justify-between bg-white shadow-lg rounded-sm border-solid border border-green-1'>
      <section className='p-5 h-full'>
        <AddDataAndPaymentMethods />
      </section>
      <section>
        <div className='bg-gray-100 shadow-inner p-5 flex justify-center flex-col items-center gap-4 text-sm font-semibold'>
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
          <div className='flex w-full justify-between items-center'>
            <span>
              IVA <span className='text-green-1'>19%</span>
            </span>
            <span>{formatNumberToColombianPesos(taxesIVACOP)}</span>
          </div>
        </div>
        <div className='w-full border-solid border-t-[1px] border-x-0 border-b-0 border-green-1 rounded-b-sm p-5 flex flex-col gap-2 font-bold'>
          <div className='flex justify-between items-end w-full'>
            <span className='text-base'>Total a pagar COP</span>
            <span className='text-2xl text-green-1'>{formatNumberToColombianPesos(totalCOP)}</span>
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
