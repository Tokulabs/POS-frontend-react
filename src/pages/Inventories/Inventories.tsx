import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { columns } from './data/columnsData'
import { IInventoryProps } from './types/InventoryTypes'
import { formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { useInventories } from '@/hooks/useInventories'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { Switch } from 'antd'

export const formatinventoryPhoto = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    photoInfo: item.photo ? (
      <img
        className='object-contain w-16 h-16 overflow-hidden transition-all hover:scale-150 transform-gpu'
        src={item.photo}
      />
    ) : (
      'N/A'
    ),
  }))
}

const inventoriesDataFormated = (inventories: IInventoryProps[]) => {
  const showCurrency = true
  return inventories.map((item) => ({
    ...item,
    active: item.active ? (
      <IconCircleCheck className='text-green-1' />
    ) : (
      <IconCircleX className='text-red-1' />
    ),
    selling_price: formatNumberToColombianPesos(item.selling_price ?? 0, showCurrency),
    usd_price: formatToUsd(item.usd_price, showCurrency),
  }))
}

const Inventories: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')
  const { isLoading, inventoriesData } = useInventories('paginatedInventories', {
    keyword: search,
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        dataSource={inventoriesDataFormated(formatinventoryPhoto(inventoriesData?.results || []))}
        extraButton={
          <div className='flex flex-col items-center gap-2'>
            <span className='font-bold text-green-1'>Activos</span>
            <Switch
              value={showActive}
              loading={isLoading}
              onChange={() => setShowActive(!showActive)}
            />
          </div>
        }
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
        onChangePage={(page) => setCurrentPage(page)}
      ></ContentLayout>
    </>
  )
}

export { Inventories }
