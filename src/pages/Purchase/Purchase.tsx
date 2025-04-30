import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { columnsDataPurchase } from './data/TableTitles'
import { useinventoryMovements } from '@/hooks/useInventoryMovements'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { useNavigate } from 'react-router-dom'
import { CreatePurchase } from './Components/CreatePurchase'
import { movementStates } from './types/PurchaseTypes'

const Purchase: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [createPurchase, setCreatePurchase] = useState(false)
  const [search, setSearch] = useState('')

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
    state: movementStates[item.state as keyof typeof movementStates],
    created_at: formatDateTime(item.created_at),
    state_reviewed_at: item.state_reviewed_at
      ? formatDateTime(item.state_reviewed_at)
      : 'Pendiente de aprobación',
  }))

  return createPurchase ? (
    <CreatePurchase setCreatePurchase={setCreatePurchase} />
  ) : (
    <ContentLayout
      pageTitle='Compras'
      buttonTitle='Crear compra'
      setModalState={() => {
        setCreatePurchase(true)
      }}
      dataSource={dataPurchaseModified ?? []}
      columns={columnsDataPurchase}
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
  )
}

export { Purchase }
