import { Space, Input } from 'antd'
import { SearchProps } from 'antd/es/input/Search'
import { useQueryClient } from '@tanstack/react-query'
import { getInventoryByCode } from '../Inventories/helpers/services'
import { useState } from 'react'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { AxiosError } from 'axios'
import { TableHeader } from './components/TableHeader'
import { TableData } from './Data/TableData'
import { TableRow } from './components/TableRow'
import { IPosData } from './components/types/TableTypes'
import { useCart } from '../../store/useCartStoreZustand'

const { Search } = Input

export const POS = () => {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { addToCart, cartItems, totalPriceCOP, totalPriceUSD, updateTotalPrice } = useCart()

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
    }
  }

  const fetchInventoryByCode = async (code: string) => {
    try {
      setIsLoading(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['inventoriesByCode'],
        queryFn: async () => getInventoryByCode(code),
      })
      // update the producData state to use the formatDataToTable function
      addToCart(formatDatatoIPOSData(data as IInventoryProps))
      updateTotalPrice()
    } catch (error) {
      const e = error as AxiosError
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const onSearch: SearchProps['onSearch'] = async (
    value: string,
    event?:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    event?.preventDefault()
    fetchInventoryByCode(value)
  }

  return (
    <section className='w-full h-[calc(100vh-6.50rem)] flex'>
      <section className='w-3/4 h-full p-5 bg-white'>
        <header className='w-full'>
          <h1 className='text-2xl font-semibold'>Crear Venta</h1>
          <Space.Compact className='w-full'>
            <Search
              size='large'
              placeholder='Código de Producto'
              onSearch={onSearch}
              enterButton
              loading={isLoading}
            />
          </Space.Compact>
        </header>
        <TableHeader tableColumnsData={TableData} />
        <ul className='p-0'>
          {cartItems.length > 0 ? (
            cartItems.map((product) => <TableRow key={product.code} product={product} />)
          ) : (
            <p>No hay productos</p>
          )}
        </ul>
        <footer></footer>
      </section>
      <nav className='w-1/4 h-full bg-green-1'>
        <h1>Carrito</h1>
        <section>
          <h2>Total COP: {totalPriceCOP}</h2>
          <h2>Total USD: {totalPriceUSD}</h2>
        </section>
      </nav>
    </section>
  )
}
