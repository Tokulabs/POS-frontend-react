import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { axiosRequest } from '../../../api/api'
import { formatNumberToColombianPesos } from '../../../utils/helpers'
import { purchaseSummaryURL } from '../../../utils/network'
import { IPurchaseSummaryProps } from '../types/DashboardTypes'

const PurchasesInfo = () => {
  const [dataPurchaseSummary, setDataPurchaseSummary] = useState<IPurchaseSummaryProps>(
    {} as IPurchaseSummaryProps,
  )
  const [loading, setLoading] = useState(false)

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
    <div className='bg-white p-4 rounded-lg md:col-span-2 flex flex-col gap-4 shadow-md'>
      <h3 className='m-0 font-bold'>Ventas Totales</h3>
      {loading ? (
        <Spin />
      ) : (
        <section className='flex flex-col gap-5'>
          <div className='flex flex-col'>
            <p className='m-0 font-bold text-2xl'>
              {formatNumberToColombianPesos(dataPurchaseSummary.price)} COP
            </p>
            <span className='text-gray-2 text-sm'>(Valor)</span>
          </div>
          <div>
            <p className='m-0 font-bold text-2xl'>{dataPurchaseSummary.count}</p>
            <span className='text-gray-2 text-sm'>(Cantidad de productos)</span>
          </div>
        </section>
      )}
    </div>
  )
}

export default PurchasesInfo
