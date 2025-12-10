import { FC, useState, useContext } from 'react'
// External Libraries
import { Divider, InputNumber, Select } from 'antd'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IconArrowLeft, IconMinus, IconPlus } from '@tabler/icons-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
// Components
import Clock from '@/components/Clock/Clock'
import { Button } from '@/components/ui/button'
import { TableHeader } from '../../POS/components/TableHeader'
// Helpers
import { getNextPurchaseNumber, postNewMovement } from '@/pages/Purchase/helpers/services'
import { getInventoriesNew } from '../../Inventories/helpers/services'
import { formatDatatoIPOSData, formatNumberToColombianPesos } from '@/utils/helpers'
// Types
import { IInventoryProps } from '../../Inventories/types/InventoryTypes'
import { DataPropsForm } from '@/types/GlobalTypes'
import { movementEventsDictionary } from '@/pages/InventoryMovementItem/types/InventoryMovementsTypes'
import { ICreateMovement, MovementEventType } from '@/pages/Purchase/types/PurchaseTypes'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
// Store
import { useCartMovements } from '@/store/useCartStoreMovementsZustand'
// Hooks
import { useKeyPress } from '@/hooks/useKeyPress'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { useRolePermissions } from '@/hooks/useRolespermissions'
// Data
import { createMovementData } from '../data/TableData'
// Store
import { store } from '@/store'

interface CreatePurchaseInterface {
  setCreateMovement: (value: boolean) => void
  currentSearch: Exclude<MovementEventType, 'purchase'>
}

const CreateMovement: FC<CreatePurchaseInterface> = ({ setCreateMovement, currentSearch }) => {
  const {
    state: { user },
  } = useContext(store)

  const [value, setValue] = useState<string>()
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [data, setData] = useState<IInventoryProps[]>([])

  const userRoleEventTypeDefault =
    UserRolesEnum[user?.role as keyof typeof UserRolesEnum] === UserRolesEnum.storageAdmin
      ? 'shipment'
      : 'return'
  const [eventType, setEventType] = useState<'shipment' | 'return'>(userRoleEventTypeDefault)

  const allowedRolesShipment = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.storageAdmin,
  ]
  const allowedRolesReturn = [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin]

  const { hasPermission: hasPermissionShipment } = useRolePermissions({
    allowedRoles: allowedRolesShipment,
  })

  const { hasPermission: hasPermissionReturn } = useRolePermissions({
    allowedRoles: allowedRolesReturn,
  })

  const optionsEventType = [
    ...(hasPermissionReturn
      ? [
          {
            value: 'return',
            label: 'Devolución',
          },
        ]
      : []),
    ...(hasPermissionShipment
      ? [
          {
            value: 'shipment',
            label: 'Remisión',
          },
        ]
      : []),
  ]

  const moveToInput = () => {
    const input = document.getElementById('searchBar')
    input?.focus()
  }

  useKeyPress('F3', () => {
    moveToInput()
  })

  const queryClient = useQueryClient()

  const { addToCart, cartItemsOrders, removeFromCart, updateQuantity, clearCart } =
    useCartMovements()

  const { data: lastIdData, isLoading } = useQuery({
    queryKey: ['lastMovementId'],
    queryFn: async () => await getNextPurchaseNumber(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  })

  const fetchInventoriesByKeyword = async (keyword: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['inventories'],
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

  const { mutate: mutateMovementCreation, isPending } = useMutation({
    mutationFn: postNewMovement,
    onSuccess: () => {
      setCreateMovement(false)
      clearCart()
      toast.success('Movimiento creado correctamente')
      queryClient.invalidateQueries({
        queryKey: [
          'paginatedInventoryMovements',
          {
            page: 1,
            event_type: 'shipment',
            origin: movementEventsDictionary[currentSearch].origin,
            destination: movementEventsDictionary[currentSearch].destination,
          },
        ],
      })
    },
  })

  const handleChange = (newValue: string) => {
    const item = data.filter((item) => item.code === newValue)[0]
    setValue(newValue)
    addToCart(formatDatatoIPOSData(item))
    setValue(null as unknown as string)
  }

  const debouncedSearch = useDebouncedCallback<[string]>((criteria) => {
    fetchInventoriesByKeyword(criteria)
  }, 500)

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
  }

  const clearPurchaseData = () => {
    setCreateMovement(false)
    clearCart()
  }

  const createMovementPost = () => {
    const dataCreatePurchase: ICreateMovement = {
      inventory_movement_items: cartItemsOrders.map((item) => ({
        inventory_id: item.id,
        quantity: item.quantity,
        state: 'pending',
      })),
      event_type: 'shipment',
      event_date: new Date().toISOString(),
      origin: movementEventsDictionary[eventType].origin,
      destination: movementEventsDictionary[eventType].destination,
    }
    mutateMovementCreation(dataCreatePurchase as unknown as DataPropsForm)
  }

  return (
    <section className='w-full bg-card rounded-md p-5 grid h-full grid-rows-[auto_1fr_auto]'>
      <header className='flex flex-col gap-3'>
        <div
          className='flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground w-fit'
          onClick={clearPurchaseData}
        >
          <IconArrowLeft />
          <span className='text-sm'>Volver</span>
        </div>
        <p className='text-2xl font-bold'>Crear Movimiento</p>
        <div className='flex justify-between w-full'>
          <div className='flex flex-col gap-2'>
            <div>Para continuar debes seleccionar el tipo de movimiento.</div>
            <div className='flex flex-col w-56 gap-4'>
              <Select
                disabled={cartItemsOrders.length > 0}
                style={{ width: '100%' }}
                placeholder='Selecciona un tipo de movimiento'
                size='large'
                onChange={(item) => setEventType(item)}
                value={eventType}
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
                options={optionsEventType}
              />
            </div>
          </div>
          <div className='flex flex-col items-end gap-4'>
            <div className='text-xl font-bold text-green-1'>
              {isLoading ? (
                <span>Cargando...</span>
              ) : (
                <span>Movimiento # {String(lastIdData?.data.next_id).padStart(4, '0')}</span>
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
            <TableHeader tableColumnsData={createMovementData} />
            <ul className='p-0 overflow-hidden overflow-y-auto divide-y divide-solid divide-border scrollbar-hide'>
              {cartItemsOrders.map((item) => (
                <li
                  className={
                    'w-full grid grid-cols-13 gap-3 py-3 text-center text-base list-none place-items-center border-x-0 px-1 bg-card'
                  }
                  key={item.code}
                >
                  <span className='w-full'>{item.code}</span>
                  <span className='w-full col-span-3'>{item.name}</span>
                  <span className='w-full col-span-2 col-start-5'>
                    {formatNumberToColombianPesos(item.selling_price)}
                  </span>
                  <span className='w-full col-start-7'>
                    <InputNumber
                      style={{ width: '100%', minWidth: '3rem', padding: '0' }}
                      size='middle'
                      addonBefore={
                        <IconMinus
                          className='h-3 cursor-pointer max-w-3'
                          onClick={() => {
                            removeFromCart(item)
                          }}
                        />
                      }
                      addonAfter={
                        <IconPlus
                          className='h-3 cursor-pointer max-w-3'
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
                  <span className='w-full col-span-2 col-start-8'>{item.total_in_storage}</span>
                  <span className='w-full col-span-2 col-start-10'>{item.total_in_shops}</span>
                  <span className='w-full col-span-2 col-start-12'>
                    {formatNumberToColombianPesos(item.total)}
                  </span>
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
        <Button disabled={cartItemsOrders.length === 0 || isPending} onClick={createMovementPost}>
          {isPending ? 'Cargando...' : 'Crear Movimiento'}
        </Button>
      </footer>
    </section>
  )
}

export { CreateMovement }
