import { useEffect, useRef, useState } from 'react'
// Third Party
import { Select } from 'antd'
import { AxiosError } from 'axios'
import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { IconTablePlus } from '@tabler/icons-react'
// Types
import { IInventoryProps } from '@/pages/Inventories/types/InventoryTypes'
// Store
import { useCart } from '@/store/useCartStoreZustand'
// Helpers
import { getInventoriesNew } from '@/pages/Inventories/helpers/services'
// Data
import { TableData } from '../Data/TableData'
// Components
import { TableHeader } from './TableHeader'
import { TableRow } from './TableRow'
import { useKeyPress } from '@/hooks/useKeyPress'
import { formatDatatoIPOSData } from '@/utils/helpers'

export const AddItemsToPurchase = () => {
  const [value, setValue] = useState<string>()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])

  const moveToInput = () => {
    const input = document.getElementById('searchBar')
    input?.focus()
  }

  useKeyPress('F3', () => {
    moveToInput()
  })

  const queryClient = useQueryClient()

  const { addToCart, updateTotalPrice, cartItems } = useCart()

  const fetchInventoriesByKeyword = async (keyword: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['inventoriesByKeyword'],
        queryFn: async () => getInventoriesNew({ keyword, active: 'True', page: 1 }),
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
    <section className='w-full h-full'>
      <Select
        id='searchBar'
        loading={isLoadingSearch}
        size='large'
        showSearch
        style={{ width: '100%' }}
        value={value}
        placeholder='Buscar producto (F3 para volver al buscador)'
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
        <section className='h-full overflow-hidden overflow-y-auto scrollbar-hide'>
          <TableHeader tableColumnsData={TableData} />
          <ul className='p-0 divide-solid divide-y divide-gray-1'>
            {cartItems.map((product) => (
              <TableRow key={product.code} product={product} />
            ))}
          </ul>
        </section>
      ) : (
        <div className='w-full flex mt-40 justify-center flex-col items-center font-medium text-2xl text-gray-1'>
          <IconTablePlus size={80} />
          <p>Agregar productos </p>
        </div>
      )}
    </section>
  )
}
