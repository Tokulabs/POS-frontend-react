import { useEffect, useRef, useState } from 'react'
// Third Party
import { Select } from 'antd'
import { AxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
// Types
import { IInventoryProps } from '../../Inventories/types/InventoryTypes'
import { IPosData } from './types/TableTypes'
// Store
import { useCart } from '../../../store/useCartStoreZustand'
// Helpers
import { getInventoriesNew } from '../../Inventories/helpers/services'
import { IconTablePlus } from '@tabler/icons-react'
import { TableData } from '../Data/TableData'
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'

export const AddItemsToPurchase = () => {
  const [value, setValue] = useState<string>()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])

  const queryClient = useQueryClient()

  const { addToCart, updateTotalPrice, cartItems } = useCart()

  const formatDatatoIPOSData = (data: IInventoryProps): IPosData => {
    return {
      code: data.code,
      name: data.name,
      selling_price: data.selling_price,
      usd_price: data.usd_price,
      discount: 0,
      quantity: 1,
      total: data.selling_price,
      usd_total: data.usd_price,
      photo: data.photo || '',
      total_in_shops: data.total_in_shops,
    }
  }

  const fetchInventoriesByKeyword = async (keyword: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['inventoriesByKeyword'],
        queryFn: async () => getInventoriesNew({ keyword }),
      })
      setData(data?.results || [])
    } catch (error) {
      const e = error as AxiosError
      console.error(e)
    } finally {
      setIsLoadingSearch(false)
    }
  }

  const handleChange = (newValue: string) => {
    const item = data.filter((item) => item.code === newValue)[0]
    setValue(newValue)
    addToCart(formatDatatoIPOSData(item))
    updateTotalPrice()
    setValue(null as unknown as string)
  }

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
  }

  const debouncedSearch = useRef(
    debounce(async (criteria) => {
      fetchInventoriesByKeyword(criteria)
    }, 300),
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <section className='w-full'>
      <Select
        loading={isLoadingSearch}
        size='large'
        showSearch
        style={{ width: '100%' }}
        value={value}
        placeholder='Buscar producto'
        suffixIcon={null}
        filterOption={false}
        onSearch={handleSearch}
        onChange={handleChange}
        notFoundContent={null}
      >
        {data.map((item) => (
          <Select.Option key={item.code} value={item.code}>
            <div className='flex gap-6 items-center my-2'>
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  className='w-10 h-10 object-cover rounded-md'
                />
              )}
              <span className='h-full'>
                {item.name} - {item.code} - Quedan: {item.total_in_shops}
              </span>
            </div>
          </Select.Option>
        ))}
      </Select>
      {cartItems.length > 0 ? (
        <section>
          <TableHeader tableColumnsData={TableData} />
          <ul className='p-0 divide-solid divide-y divide-gray-1'>
            {cartItems.map((product) => (
              <TableRow key={product.code} product={product} />
            ))}
          </ul>
        </section>
      ) : (
        <div className='w-full h-96 flex justify-center flex-col items-center font-medium text-2xl text-gray-1'>
          <IconTablePlus size={80} />
          <p>Agregar productos </p>
        </div>
      )}
    </section>
  )
}
