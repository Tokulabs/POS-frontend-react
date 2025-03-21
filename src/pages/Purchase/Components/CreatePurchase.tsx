import { Divider, InputNumber, Select } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { IProvider } from '../../Providers/types/ProviderTypes'
import { useProviders } from '@/hooks/useProviders'
import Clock from '@/components/Clock/Clock'
import { debounce } from 'lodash'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getInventoriesNew } from '../../Inventories/helpers/services'
import { IInventoryProps } from '../../Inventories/types/InventoryTypes'
import { AxiosError } from 'axios'
import { TableHeader } from '../../POS/components/TableHeader'
import { createPurchaseTableTitles } from '../data/TableTitles'
import { useCartOrders } from '@/store/useCartStoreOrdersZustand'
import { formatDatatoIPOSData, formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { IconArrowLeft, IconMinus, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { getNextPurchaseNumber, postPurchaseNew } from '../helpers/services'
import { ICreatePurchase } from '../types/PurchaseTypes'
import { DataPropsForm } from '@/types/GlobalTypes'
import { toast } from 'sonner'

interface CreatePurchaseInterface {
  setCreatePurchase: (value: boolean) => void
}

const CreatePurchase: FC<CreatePurchaseInterface> = ({ setCreatePurchase }) => {
  const [providerID, setProviderID] = useState()
  const { providersData } = useProviders('allProviders', { active: 'True' })
  const [currentProvider, setCurrentProvider] = useState<IProvider>()
  const [value, setValue] = useState<string>()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])

  const queryClient = useQueryClient()

  const { addToCart, cartItemsOrders, removeFromCart, updateQuantity, clearCart } = useCartOrders()

  const { data: lastIdData, isLoading } = useQuery({
    queryKey: ['lastMovementId'],
    queryFn: async () => await getNextPurchaseNumber(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  })

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

  const { mutate: mutatePurchase, isPending } = useMutation({
    mutationFn: postPurchaseNew,
    onSuccess: () => {
      setCreatePurchase(false)
      clearCart()
      toast.success('Compra creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['paginatedInventoryMovements', { page: 1 }] })
    },
  })

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

  const clearPurchaseData = () => {
    setCreatePurchase(false)
    clearCart()
  }

  const createPurchase = () => {
    const dataCreatePurchase: ICreatePurchase = {
      inventory_movement_items: cartItemsOrders.map((item) => ({
        inventory_id: item.id,
        quantity: item.quantity,
        state: 'pending',
      })),
      event_type: 'purchase',
      event_date: new Date().toISOString(),
      provider_id: providerID ?? 0,
      origin: null,
      destination: 'warehouse',
    }
    mutatePurchase(dataCreatePurchase as unknown as DataPropsForm)
  }

  const providers: IProvider[] = providersData?.results ?? ([] as IProvider[])
  return (
    <section className='w-full bg-white rounded-md p-5 grid h-full grid-rows-[auto_1fr_auto]'>
      <header className='flex flex-col gap-3'>
        <div
          className='flex items-center gap-2 cursor-pointer text-gray-2 hover:text-gray-1 w-fit'
          onClick={clearPurchaseData}
        >
          <IconArrowLeft />
          <span className='text-sm'>Volver</span>
        </div>
        <p className='text-2xl font-bold'>Crear compra</p>
        <div className='flex justify-between w-full'>
          <div className='flex flex-col gap-2'>
            <div>Para continuar debes seleccionar el proveedor.</div>
            <div className='flex flex-col w-56 gap-4'>
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
          <div className='flex flex-col items-end gap-4'>
            <div className='text-xl font-bold text-green-1'>
              {isLoading ? (
                <span>Cargando...</span>
              ) : (
                <span>Compra # {String(lastIdData?.data.next_id).padStart(4, '0')}</span>
              )}
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <span className='font-bold text-end'>Fecha:</span>
              <Clock />
            </div>
          </div>
        </div>
        <Divider />
      </header>
      <main className='flex flex-col overflow-hidden overflow-y-scroll scrollbar-hide'>
        <section className='flex items-center w-full gap-4 mb-4'>
          <h3 className='m-0 text-xl font-bold text-green-1 text-nowrap'>Agregar productos</h3>
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
                <div className='flex items-center gap-6 my-2'>
                  {item.photo && (
                    <img
                      src={item.photo}
                      alt={item.name}
                      className='object-cover w-10 h-10 rounded-md'
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
            <TableHeader tableColumnsData={createPurchaseTableTitles} />
            <ul className='p-0 overflow-hidden overflow-y-auto divide-y divide-solid divide-gray-1 scrollbar-hide'>
              {cartItemsOrders.map((item) => (
                <li
                  className={
                    'w-full grid grid-cols-13 gap-3 py-3 text-center text-base list-none place-items-center border-x-0 px-1'
                  }
                  key={item.code}
                >
                  <span className='w-full'>{item.code}</span>
                  <span className='w-full col-span-3'>{item.name}</span>
                  <span className='w-full col-span-2 col-start-5'>
                    {formatNumberToColombianPesos(item.selling_price)}
                  </span>
                  <span className='w-full col-start-7'>{formatToUsd(item.usd_price)}</span>
                  <span className='w-full col-span-3 col-start-8'>
                    <InputNumber
                      style={{ width: '7.5rem' }}
                      size='middle'
                      addonBefore={
                        <IconMinus
                          className='w-3 h-3 cursor-pointer'
                          onClick={() => {
                            removeFromCart(item)
                          }}
                        />
                      }
                      addonAfter={
                        <IconPlus
                          className='w-3 h-3 cursor-pointer'
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
                  <span className='col-span-2 col-start-11 w-ful'>
                    {formatNumberToColombianPesos(item.total)}
                  </span>
                  <span className='w-full col-start-13'>{formatToUsd(item.usd_total)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Divider />
      <footer className='flex justify-end gap-4'>
        <Button variant='secondary' onClick={clearPurchaseData}>
          Cancelar
        </Button>
        <Button disabled={cartItemsOrders.length === 0 || isPending} onClick={createPurchase}>
          {isPending ? 'Cargando...' : 'Crear compra'}
        </Button>
      </footer>
    </section>
  )
}

export { CreatePurchase }
