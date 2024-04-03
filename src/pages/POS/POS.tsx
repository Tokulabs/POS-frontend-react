import { Select } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import { getInventoriesNew } from '../Inventories/helpers/services'
import { useEffect, useRef, useState } from 'react'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { AxiosError } from 'axios'
import { TableHeader } from './components/TableHeader'
import { TableData } from './Data/TableData'
import { TableRow } from './components/TableRow'
import { IPosData } from './components/types/TableTypes'
import { useCart } from '../../store/useCartStoreZustand'
import { debounce } from 'lodash'

export const POS = () => {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)

  const queryClient = useQueryClient()

  const {
    subtotalCOP,
    subtotalUSD,
    discountCOP,
    discountUSD,
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
      photo: data.photo ?? '',
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

  const [data, setData] = useState<IInventoryProps[]>([])
  const [value, setValue] = useState<string>()

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    const item = data.filter((item) => item.code === newValue)[0]
    addToCart(formatDatatoIPOSData(item))
    updateTotalPrice()
    setValue('')
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
    <section className='w-full h-[calc(100vh-6.50rem)] flex'>
      <section className='w-3/4 h-full p-5 bg-white'>
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
                      {item.name} - {item.code}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </section>
        </header>
        <TableHeader tableColumnsData={TableData} />
        <ul className='p-0'>
          {cartItems.length > 0 ? (
            cartItems.map((product) => <TableRow key={product.code} product={product} />)
          ) : (
            <div className='w-full h-20 flex justify-center items-center font-medium text-2xl'>
              <p>No hay productos ... </p>
            </div>
          )}
        </ul>
        <footer></footer>
      </section>
      <nav className='w-1/4 h-full bg-green-1'>
        <h1>Carrito</h1>
        <section>
          <h2>subtotal: {subtotalCOP}</h2>
          <h2>subtotal USD: {subtotalUSD}</h2>
          <h2>Descuento COP: {discountCOP}</h2>
          <h2>Descuetno Dolares: {discountUSD}</h2>
          <h2>IVA: {taxesIVACOP}</h2>
          <h2>Total COP: {totalCOP}</h2>
          <h2>Total USD: {totalUSD}</h2>
        </section>
      </nav>
    </section>
  )
}
