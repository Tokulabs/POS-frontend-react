import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { columnsDataPurchase } from './data/TableTitles'
import { useinventoryMovements } from '@/hooks/useInventoryMovements'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { useNavigate } from 'react-router-dom'
import { CreatePurchase } from './Components/CreatePurchase'
import { movementStates, IPurchaseSimple } from './types/PurchaseTypes'
import PrintInventoryMovement from '@/components/PrintInfo/PrintInventoryMovement'
import { IconPrinter } from '@tabler/icons-react'
import { createPortal } from 'react-dom'
import { TableColumnsType } from 'antd'

const Purchase: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [createPurchase, setCreatePurchase] = useState(false)
  const [search, setSearch] = useState('')
  const [printId, setPrintId] = useState<number | null>(null)

  const navigate = useNavigate()

  const { isLoading, inventoryMovementsData } = useinventoryMovements(
    'paginatedInventoryMovements',
    {
      keyword: search,
      page: currentPage,
      event_type: 'purchase',
    },
  )

  const dataPurchaseModified = inventoryMovementsData?.results.map((item) => ({
    ...item,
    provider_name: item.provider?.legal_name ?? 'Sin proveedor',
    state: movementStates[item.state as keyof typeof movementStates],
    created_at: formatDateTime(item.created_at),
    state_reviewed_at: item.state_reviewed_at
      ? formatDateTime(item.state_reviewed_at)
      : 'Pendiente de aprobación',
  }))

  const columns: TableColumnsType<IPurchaseSimple> = [
    ...columnsDataPurchase,
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: unknown, record: IPurchaseSimple) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setPrintId(record.id)
          }}
          className='p-2 text-blue-500 hover:text-blue-600 rounded-full hover:bg-secondary transition-colors'
        >
          <IconPrinter size={20} stroke={1.5} />
        </button>
      ),
    },
  ]

  return createPurchase ? (
    <CreatePurchase setCreatePurchase={setCreatePurchase} />
  ) : (
    <>
      <ContentLayout
        pageTitle='Compras'
        buttonTitle='Crear compra'
        setModalState={() => setCreatePurchase(true)}
        dataSource={dataPurchaseModified ?? []}
        columns={columns}
        totalItems={inventoryMovementsData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
        onRowClick={(record) => {
          navigate(`/inventory-movement/${btoa(String(record.id))}`)
        }}
      />
      {/* Renderiza el componente de impresión de forma oculta cuando printId tenga valor */}
      {printId &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              width: 0,
              height: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              opacity: 0,
            }}
            aria-hidden='true'
          >
            <PrintInventoryMovement
              id={String(printId)}
              onAfterPrint={() => setPrintId(null)}
            />
          </div>,
          document.body,
        )}
    </>
  )
}

export { Purchase }
