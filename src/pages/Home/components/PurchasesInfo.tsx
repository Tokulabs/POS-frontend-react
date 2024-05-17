import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { axiosRequest } from '../../../api/api'
import { formatNumberToColombianPesos, formatToUsd } from '../../../utils/helpers'
import { purchaseSummaryURL } from '../../../utils/network'
import { IPurchaseSummaryProps } from '../types/DashboardTypes'

const PurchasesInfo = () => {
  const [dataPurchaseSummary, setDataPurchaseSummary] = useState<IPurchaseSummaryProps>(
    {} as IPurchaseSummaryProps,
  )
  const [loading, setLoading] = useState(false)
  const showCurrency = false

  const getPurchaseSummary = async () => {
    try {
      setLoading(true)
      const response = await axiosRequest<IPurchaseSummaryProps>({
        url: purchaseSummaryURL,
        hasAuth: true,
      })
      if (response) {
        const result = response.data
        setDataPurchaseSummary(result)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPurchaseSummary()
  }, [])

  return (
    <div className='bg-white h-full p-4 rounded-lg md:col-span-2 flex flex-col gap-4 shadow-md'>
      <h3 className='m-0 font-bold'>Ventas Totales</h3>
      {loading ? (
        <Spin />
      ) : (
        <section className='flex flex-col gap-5'>
          <div className='grid grid-cols-2'>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {formatNumberToColombianPesos(dataPurchaseSummary.selling_price ?? 0, showCurrency)}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>(Valor COP)</span>
            </div>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {dataPurchaseSummary.count ?? 0}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Cantidad de productos)
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2'>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {formatNumberToColombianPesos(
                  dataPurchaseSummary.selling_price_gifts ?? 0,
                  showCurrency,
                )}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Valor regalos COP)
              </span>
            </div>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {dataPurchaseSummary.gift_count ?? 0}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Cantidad de regalos)
              </span>
            </div>
          </div>
          <div className='flex flex-col'>
            <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
              {formatToUsd(dataPurchaseSummary.price_dolar ?? 0, showCurrency)}
            </p>
            <span className='text-gray-2 text-sm overflow-hidden truncate'>(Venta USD)</span>
          </div>
        </section>
      )}
    </div>
  )
}

export default PurchasesInfo
