import { useinventoryMovements } from '@/hooks/useInventoryMovements'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { FC, useState } from 'react'
import { MovementEventType, movementStates, storageTypes } from '../Purchase/types/PurchaseTypes'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { CreateMovement } from './components/CreateMovement'
import { useNavigate } from 'react-router-dom'
import { movementEventsDictionary } from '../InventoryMovementItem/types/InventoryMovementsTypes'
import { columnsDataMovement } from './data/TableData'
import PrintInventoryMovement from '@/components/PrintInfo/PrintInventoryMovement'
import { IconPrinter } from '@tabler/icons-react'
import { createPortal } from 'react-dom'

const movementEventType: Record<MovementEventType, string> = {
  purchase: 'Compras',
  return: 'Devoluciones',
  shipment: 'Remisiones',
}

interface InventoryMovementData {
  id: string
  state: string
  created_at: string
  state_reviewed_at: string | null
  origin: string
  destination: string
  event_type: string
}

export const InventoryMovement: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [createMovement, setCreateMovement] = useState(false)
  const [eventTypeSearch, setEventTypeSearch] =
    useState<Exclude<MovementEventType, 'purchase'>>('shipment')
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovementData | null>(null)

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

  const extendedColumns = [
    ...columnsDataMovement,
    {
      title: 'Acciones',
      key: 'actions',
      render: (item: InventoryMovementData) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSelectedMovement(item)
          }}
          className='p-2 text-blue-500 hover:text-blue-600 rounded-full hover:bg-secondary transition-colors'
        >
          <IconPrinter size={20} stroke={1.5} />
        </button>
      ),
    },
  ]
  const modalRoot = document.getElementById('root')

  return (
    <>
      {createMovement ? (
        <CreateMovement setCreateMovement={setCreateMovement} currentSearch={eventTypeSearch} />
      ) : (
        <>
          <ContentLayout
            pageTitle={`Movimientos de inventario - ${movementEventType[eventTypeSearch]}`}
            buttonTitle='Crear movimiento'
            setModalState={() => setCreateMovement(true)}
            dataSource={dataPurchaseModified ?? []}
            columns={extendedColumns}
            totalItems={inventoryMovementsData?.count ?? 0}
            onChangePage={setCurrentPage}
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
                  <span
                    className='flex items-center gap-3'
                    onClick={() => setEventTypeSearch('return')}
                  >
                    Devoluciones
                  </span>
                ),
                key: 1,
              },
            ]}
          />

          {selectedMovement && modalRoot &&
            createPortal(
              <div
                className='fixed w-0 h-0 overflow-hidden pointer-events-none opacity-0'
                aria-hidden='true'
              >
                <PrintInventoryMovement
                  id={selectedMovement.id}
                  onAfterPrint={() => setSelectedMovement(null)}
                />
              </div>,
              modalRoot
            )}
        </>
      )}
    </>
  )
}
