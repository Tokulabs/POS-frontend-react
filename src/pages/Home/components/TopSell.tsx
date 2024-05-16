import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { axiosRequest } from '../../../api/api'
import { topSellURL } from '../../../utils/network'
import { IInventoryProps } from '../../Inventories/types/InventoryTypes'
import { IconCameraOff } from '@tabler/icons-react'

const TopSell = () => {
  const [dataTopSell, setDataTopSell] = useState<IInventoryProps[]>()
  const [loading, setLoading] = useState(false)

  const getTopSellData = async () => {
    try {
      setLoading(true)
      const response = await axiosRequest<IInventoryProps[]>({
        url: topSellURL,
        hasAuth: true,
      })
      if (response) {
        const result = response.data
        const data = result.map((item) => ({
          ...item,
          key: item.id,
          photoInfo: item.photo,
        }))
        setDataTopSell(data)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTopSellData()
  }, [])

  return (
    <div className='bg-white p-4 rounded-lg md:col-span-2 flex flex-col gap-4 shadow-md'>
      <h3 className='m-0 font-bold'>Productos más vendidos</h3>
      <div className='grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-4'>
        {loading ? (
          <Spin />
        ) : (
          dataTopSell?.map((item, index) => (
            <article className='min-w-0 min-w-md bg-[#f3f5ff] rounded-md' key={index}>
              {item.photo ? (
                <img
                  className='w-full h-40 lg:h-20 object-cover rounded-md'
                  src={item.photo}
                  alt='photo item'
                />
              ) : (
                <span className='text-green-1'>
                  <IconCameraOff
                    style={{
                      width: '100%',
                      height: '5rem',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                    }}
                  />
                </span>
              )}
              <section className='px-2 py-3'>
                <p className='m-0 text-xs text-[#262932] font-bold truncate'>{item.name}</p>
                <p className='m-0 text-sm text-[#5f626e]'>{item.sum_of_item}</p>
              </section>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default TopSell
