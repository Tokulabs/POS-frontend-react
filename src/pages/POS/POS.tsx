import { useEffect, useRef, useState } from 'react'
// Third Party
import { Select } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { debounce } from 'lodash'
import { IconTablePlus } from '@tabler/icons-react'
// Service Helper
import { getInventoriesNew } from '../Inventories/helpers/services'
// Types
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { IPosData } from './components/types/TableTypes'
// Components
import { TableHeader } from './components/TableHeader'
import { TableRow } from './components/TableRow'
import { AddDataAndPaymentMethods } from './components/AddDataAndPaymentMethods'
// Data
import { TableData } from './Data/TableData'
// Store
import { useCart } from '../../store/useCartStoreZustand'
// Helpers
import { formatNumberToColombianPesos, formatToUsd } from '../../utils/helpers'

export const POS = () => {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])
  const [value, setValue] = useState<string>()

  const queryClient = useQueryClient()

  const {
    subtotalCOP,
    discountCOP,
    taxesIVACOP,
    totalCOP,
    totalUSD,
    addToCart,
    cartItems,
    updateTotalPrice,
  } = useCart()

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

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
  }

  const handleChange = (newValue: string) => {
    const item = data.filter((item) => item.code === newValue)[0]
    setValue(newValue)
    addToCart(formatDatatoIPOSData(item))
    updateTotalPrice()
    setValue(null as unknown as string)
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
    <section className='w-full h-[calc(100vh-6.50rem)] flex gap-6'>
      <section className='w-3/4 h-full p-5 bg-white shadow-lg rounded-sm'>
        <header className='w-full'>
          <h1 className='text-2xl font-semibold'>Crear Venta</h1>
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
          </section>
        </header>

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

        <footer></footer>
      </section>
      <nav className='w-1/4 h-full flex flex-col justify-between bg-white shadow-lg rounded-sm'>
        <section className='p-5 h-full bg-green-1 text-white'>
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
              <span className='text-xl text-green-1'>{formatNumberToColombianPesos(totalCOP)}</span>
            </div>
            <div className='flex justify-between items-end w-full'>
              <span className='text-base'>Total a pagar USD</span>
              <span className='text-xl text-green-1'>{formatToUsd(totalUSD)}</span>
            </div>
          </div>
        </section>
      </nav>
    </section>
  )
}
