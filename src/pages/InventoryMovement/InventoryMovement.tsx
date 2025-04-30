import { useinventoryMovements } from '@/hooks/useInventoryMovements'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { FC, useState } from 'react'
import { MovementEventType, movementStates, storageTypes } from '../Purchase/types/PurchaseTypes'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { columnsDataPurchase } from '../Purchase/data/TableTitles'
import { CreateMovement } from './components/CreateMovement'
import { useNavigate } from 'react-router-dom'
import { movementEventsDictionary } from '../InventoryMovementItem/types/InventoryMovementsTypes'

const movementEventType: Record<MovementEventType, string> = {
  purchase: 'Compras',
  return: 'Devoluciones',
  shipment: 'Remisiones',
}

export const InventoryMovement: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createMovement, setCreateMovement] = useState(false)
  const [eventTypeSearch, setEventTypeSearch] =
    useState<Exclude<MovementEventType, 'purchase'>>('shipment')
  const { isLoading, inventoryMovementsData } = useinventoryMovements(
    'paginatedInventoryMovements',
    {
      keyword: search,
      page: currentPage,
      event_type: 'shipment',
      origin: movementEventsDictionary[eventTypeSearch].origin,
      destination: movementEventsDictionary[eventTypeSearch].destination,
    },
  )

  const navigate = useNavigate()

  const dataPurchaseModified = inventoryMovementsData?.results.map((item) => ({
    ...item,
    state: movementStates[item.state as keyof typeof movementStates],
    created_at: formatDateTime(item.created_at),
    state_reviewed_at: item.state_reviewed_at
      ? formatDateTime(item.state_reviewed_at)
      : 'Pendiente de aprobación',
    origin: storageTypes[item.origin as keyof typeof storageTypes],
    destination: storageTypes[item.destination as keyof typeof storageTypes],
  }))

  const newColums = [
    ...columnsDataPurchase,
    {
      title: 'Origen',
      dataIndex: 'origin',
      key: 'origin',
    },
    {
      title: 'Destino',
      dataIndex: 'destination',
      key: 'destination',
    },
  ]

  return createMovement ? (
    <CreateMovement setCreateMovement={setCreateMovement} currentSearch={eventTypeSearch} />
  ) : (
    <ContentLayout
      pageTitle={`Movimientos de inventario - ${movementEventType[eventTypeSearch]}`}
      buttonTitle='Crear movimiento'
      setModalState={() => {
        setCreateMovement(true)
      }}
      dataSource={dataPurchaseModified ?? []}
      columns={newColums}
      totalItems={inventoryMovementsData?.count ?? 0}
      onChangePage={(page) => setCurrentPage(page)}
      fetching={isLoading}
      currentPage={currentPage}
      onSearch={(value) => {
        setSearch(value)
        setCurrentPage(1)
      }}
      onRowClick={(record) => {
        navigate(`/inventory-movement/${btoa(String(record.id))}`)
      }}
      filterOptions={[
        {
          label: (
            <span
              className='flex items-center gap-3'
              onClick={() => setEventTypeSearch('shipment')}
            >
              Remisiones
            </span>
          ),
          key: 0,
        },
        {
          label: (
            <span className='flex items-center gap-3' onClick={() => setEventTypeSearch('return')}>
              Devoluciones
            </span>
          ),
          key: 1,
        },
      ]}
    />
  )
}
