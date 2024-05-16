import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import AddInventoryForm from './components/AddInventoryForm'
import { Button, Popconfirm, Switch } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { columns } from './data/columnsData'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { useGroups } from '../../hooks/useGroups'
import { useInventories } from '../../hooks/useInventories'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconSquareCheck,
  IconTrash,
} from '@tabler/icons-react'
import { toogleInventories } from '../Inventories/helpers/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalStateEnum } from '../../types/ModalTypes'
import { useProviders } from '../../hooks/useProviders'
import { toast } from 'sonner'

export const formatinventoryPhoto = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    photoInfo: item.photo ? (
      <img
        className='w-16 h-16 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
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
  const [editData, setEditData] = useState<IInventoryProps>({} as IInventoryProps)

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
      toast.success(`Prodcuto ${item?.data.active ? 'Activado' : 'Desactivado'}`)
    },
  })

  const confirmtoggle = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (inventories: IInventoryProps[]) => {
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
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editInventoryItem(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title={`${item.active ? 'Desactivar' : 'Activar'} Producto`}
            description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este producto?`}
            onConfirm={() => confirmtoggle(item.id)}
            okText={`Si ${item.active ? 'Desactivar' : 'Activar'}`}
            cancelText='Cancelar'
          >
            <Button type='link' className='p-0'>
              {item.active ? (
                <IconTrash className='text-red-1 hover:text-red-400' />
              ) : (
                <IconSquareCheck className='text-green-1 hover:text-green-400' />
              )}
            </Button>
          </Popconfirm>
        </div>
      ),
    }))
  }

  const editInventoryItem = (item: IInventoryProps) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='Agregar productos'
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
        setModalState={() => {
          setEditData({} as IInventoryProps)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={formatEditAndDelete(formatinventoryPhoto(inventoriesData?.results || []))}
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
      >
        {modalState === ModalStateEnum.addItem && (
          <AddInventoryForm
            initialData={editData}
            onSuccessCallback={() => setModalState(ModalStateEnum.off)}
            isVisible={modalState === ModalStateEnum.addItem}
            onCancelCallback={() => setModalState(ModalStateEnum.off)}
            groups={groupsData?.results ?? []}
            providers={providersData?.results ?? []}
          />
        )}
        <AddInventoryFormCSV
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItemsCSV}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      </ContentLayout>
    </>
  )
}

export { Storage }
