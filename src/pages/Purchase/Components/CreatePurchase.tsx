import { Divider, InputNumber, Select } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { IProvider } from '../../Providers/types/ProviderTypes'
import { useProviders } from '@/hooks/useProviders'
import { IPurchaseCart } from '../types/PurchaseTypes'
import Clock from '@/components/Clock/Clock'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import { getInventoriesNew } from '../../Inventories/helpers/services'
import { IInventoryProps } from '../../Inventories/types/InventoryTypes'
import { AxiosError } from 'axios'
import { TableHeader } from '../../POS/components/TableHeader'
import { TableData } from '../data/TableTitles'
import { useCartOrders } from '@/store/useCartStoreOrdersZustand'
import { formatDatatoIPOSData, formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { IconMinus, IconPlus } from '@tabler/icons-react'

const Purchase: FC = () => {
  const [providerID, setProviderID] = useState()
  const [purchaseItems, setPurchaseItems] = useState([] as IPurchaseCart[])
  const { providersData } = useProviders('allProviders', { active: 'True' })
  const [currentProvider, setCurrentProvider] = useState<IProvider>()
  const [value, setValue] = useState<string>()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])

  const queryClient = useQueryClient()

  const { addToCart, cartItemsOrders, removeFromCart, updateQuantity } = useCartOrders()

  const fetchInventoriesByKeyword = async (keyword: string, providerId: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['inventoriesByProvider'],
        queryFn: async () =>
          getInventoriesNew({ keyword, active: 'True', page: 1, provider_id: providerId }),
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
    setValue(null as unknown as string)
  }

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue, providerID)
  }

  const debouncedSearch = useRef(
    debounce(async (criteria, providerId) => {
      fetchInventoriesByKeyword(criteria, providerId)
    }, 500),
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  useEffect(() => {
    setData([])
    if (providerID) {
      setCurrentProvider(providers.find((item) => item.id === providerID))
    }
  }, [providerID])

  const providers: IProvider[] = providersData?.results ?? ([] as IProvider[])
  return (
    <section className='w-full bg-white rounded-md p-5 grid h-full grid-rows-[auto_1fr_auto]'>
      <header className='flex flex-col'>
        <p className='font-bold text-lg'>Crear compra</p>
        <div className='flex w-full justify-between'>
          <div className='flex flex-col gap-2'>
            <div>Para continuar debes seleccionar el proveedor.</div>
            <div className='w-56 flex flex-col gap-4'>
              <Select
                disabled={cartItemsOrders.length > 0}
                style={{ width: '100%' }}
                placeholder='Selecciona un proveedor'
                onChange={(item) => setProviderID(item)}
                value={providerID}
                listHeight={200}
                showSearch
                optionFilterProp='children'
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={[
                  {
                    value: '',
                    label: 'Selecciona un proveedor',
                  },
                  ...providers.map((item) => ({
                    value: item.id,
                    label: item.legal_name,
                  })),
                ]}
              />
              {providerID && (
                <div className='grid grid-cols-2 gap-y-2'>
                  <span className='font-bold'>Nit:</span>
                  <span>{currentProvider?.nit ?? 'N/A'}</span>
                  <span className='font-bold'>Telefono:</span>
                  <span>{currentProvider?.phone ?? 'N/A'}</span>
                  <span className='font-bold'>Correo:</span>
                  <span>{currentProvider?.email ?? 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-4 items-end'>
            <div className='text-green-1 font-bold text-xl'>Order Numero 001</div>
            <div className='grid grid-cols-2 gap-2'>
              <span className='font-bold content-center'>Fecha:</span>
              <Clock />
            </div>
          </div>
        </div>
        <Divider />
      </header>
      <main className='flex flex-col'>
        <section className='flex gap-4 items-center w-full'>
          <h3 className='text-green-1 font-bold text-xl m-0 text-nowrap'>Agregar productos</h3>
          <Select
            id='searchBar'
            style={{ width: '100%' }}
            loading={isLoadingSearch}
            size='large'
            showSearch
            value={value}
            placeholder='Buscar producto (F3 para volver al buscador)'
            suffixIcon={null}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={null}
            disabled={!providerID}
          >
            {data?.map((item) => (
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
        {cartItemsOrders.length > 0 && (
          <section className='h-full overflow-hidden overflow-y-auto scrollbar-hide'>
            <TableHeader tableColumnsData={TableData} />
            <ul className='p-0 divide-solid divide-y divide-gray-1 overflow-hidden overflow-y-auto scrollbar-hide'>
              {cartItemsOrders.map((item) => (
                <li
                  className={
                    'w-full grid grid-cols-13 gap-3 py-4 text-center text-base list-none place-items-center border-x-0 px-1'
                  }
                  key={item.code}
                >
                  <span className='w-full'>{item.code}</span>
                  <span className='w-full col-span-2'>{item.name}</span>
                  <span className='w-full col-span-2'>
                    {formatNumberToColombianPesos(item.selling_price)}
                  </span>
                  <span className='w-full col-span-2'>{formatToUsd(item.usd_price)}</span>
                  <span className='w-full col-span-2'>
                    <InputNumber
                      style={{ width: '7.5rem' }}
                      size='middle'
                      addonBefore={
                        <IconMinus
                          className='cursor-pointer h-3 w-3'
                          onClick={() => {
                            removeFromCart(item)
                          }}
                        />
                      }
                      addonAfter={
                        <IconPlus
                          className='cursor-pointer h-3 w-3'
                          onClick={() => {
                            addToCart(item)
                          }}
                        />
                      }
                      value={item.quantity}
                      controls={false}
                      parser={(value) => (value ? +value : 0)}
                      onChange={(event) => updateQuantity(item.code, event)}
                      autoComplete='off'
                    />
                  </span>
                  <span className='w-full col-span-2'>
                    {formatNumberToColombianPesos(item.total)}
                  </span>
                  <span className='w-full col-span-2'>{formatToUsd(item.usd_total)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <footer className=''>
        <h4>footer</h4>
      </footer>
    </section>
  )
}

export { Purchase }
