// Helpers
import { formatNumberToColombianPesos, formatToUsd } from '../../../utils/helpers'
// Components
import { AddDataAndPaymentMethods } from './AddDataAndPaymentMethods'
import Clock from '../../../components/Clock/Clock'
// Store
import { useCart } from '../../../store/useCartStoreZustand'
// Hooks
import { useDianResolutions } from '../../../hooks/useDianResolution'
// Third party
import { Spin } from 'antd'

export const SideBarDataPOS = () => {
  const { dianResolutionData, isPending: isLoadingResolution } = useDianResolutions(
    'getActiveDianResolution',
    { active: 'True' },
  )
  const currentNumber = dianResolutionData?.results[0]?.current_number ?? null
  const nextNumber = currentNumber !== null ? currentNumber + 1 : '0'

  const { subtotalCOP, discountCOP, taxesIVACOP, totalCOP, totalUSD } = useCart()

  return (
    <nav className='w-1/4 h-full flex flex-col justify-between bg-white shadow-lg rounded-sm border-solid border border-green-1'>
      {isLoadingResolution ? (
        <Spin />
      ) : (
        <section className='flex flex-col p-5 w-full justify-start gap-1bg-white  shadow-md'>
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
      )}
      <AddDataAndPaymentMethods />
      <section className='w-full bg-white'>
        <div className='bg-gray-100 shadow-inner flex justify-center flex-col items-center gap-4 text-sm font-semibold p-5'>
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
