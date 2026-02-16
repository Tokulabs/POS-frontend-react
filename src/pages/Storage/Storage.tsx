import { FC, useState, useMemo, useCallback } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { Button, Popconfirm, Switch } from 'antd'
import { columns } from './data/columnsData'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { useGroups } from '@/hooks/useGroups'
import { useInventories } from '@/hooks/useInventories'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { IconCircleCheck, IconCircleX, IconEdit, IconPower } from '@tabler/icons-react'
import { toogleInventories } from '../Inventories/helpers/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalStateEnum } from '@/types/ModalTypes'
import { useProviders } from '@/hooks/useProviders'
import { toast } from 'sonner'
import { AddProductsForm } from './components/AddProductsForm'

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

const Storage: FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [currentPage, setCurrentPage] = useState(1)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')

  const { isLoading, inventoriesData } = useInventories('paginatedInventories', {
    keyword: search,
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })
  const { groupsData } = useGroups('allGroups', { active: 'True' })
  const { providersData } = useProviders('allProviders', { active: 'True' })

  const queryClient = useQueryClient()

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toogleInventories,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedInventories'] })
      toast.success(`Producto ${item?.data.active ? 'Activado' : 'Desactivado'}`)
    },
  })

  // Memoized handlers to prevent unnecessary re-renders
  const confirmtoggle = useCallback(
    (id: number) => {
      if (isLoadingDelete) return
      mutate(id)
    },
    [isLoadingDelete, mutate],
  )

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }, [])

  const handleActiveToggle = useCallback(() => {
    setShowActive((prev) => !prev)
    setCurrentPage(1) // Reset to first page when changing filter
  }, [])

  // Memoized format function to prevent recreating on every render
  const formatEditAndDelete = useMemo(() => {
    return (inventories: IInventoryProps[]) => {
      const showCurrency = true
      return inventories.map((item) => ({
        ...item,
        active: item.active ? (
          <IconCircleCheck className='text-green-1' />
        ) : (
          <IconCircleX className='text-red-1' />
        ),
        selling_price: formatNumberToColombianPesos(item.selling_price ?? 0, showCurrency),
        buying_price: formatNumberToColombianPesos(item.buying_price ?? 0, showCurrency),
        action: (
          <div className='flex items-center justify-center gap-2'>
            <AddProductsForm
              key={`edit-${item.id}-${JSON.stringify([item.name, item.selling_price, item.buying_price])}`} // Force re-render when data changes
              triggerComponent={
                <Button type='link' className='p-0'>
                  <IconEdit className='text-blue-1 hover:text-blue-400' />
                </Button>
              }
              initialData={item}
              groups={groupsData?.results ?? []}
              providers={providersData?.results ?? []}
            />
            <Popconfirm
              title={`${item.active ? 'Desactivar' : 'Activar'} Producto`}
              description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este producto?`}
              onConfirm={() => confirmtoggle(item.id)}
              okText={`Si ${item.active ? 'Desactivar' : 'Activar'}`}
              cancelText='Cancelar'
            >
              <Button type='link' className='p-0'>
                <IconPower
                  className={`${item.active ? 'text-red-1 hover:text-red-400' : 'text-green-1 hover:text-green-300'}`}
                />
              </Button>
            </Popconfirm>
          </div>
        ),
      }))
    }
  }, [groupsData?.results, providersData?.results, confirmtoggle])

  // Memoized formatted data
  const formattedInventories = useMemo(() => {
    return formatEditAndDelete(formatinventoryPhoto(inventoriesData?.results || []))
  }, [formatEditAndDelete, inventoriesData?.results])

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        extraButton={
          <div className='flex items-end self-end gap-4'>
            <AddProductsForm
              key='create-product' // Stable key for create form
              triggerComponent={<Button type='primary'>Agregar producto</Button>}
              initialData={{} as IInventoryProps}
              groups={groupsData?.results ?? []}
              providers={providersData?.results ?? []}
            />
            <div className='flex flex-col items-center gap-2'>
              <span className='font-bold text-green-1'>Activos</span>
              <Switch value={showActive} loading={isLoading} onChange={handleActiveToggle} />
            </div>
          </div>
        }
        dataSource={formattedInventories}
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        onChangePage={handlePageChange}
        onSearch={handleSearch}
      ></ContentLayout>
    </>
  )
}

export { Storage }
