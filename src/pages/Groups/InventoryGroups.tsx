import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import AddGroupForm from './components/AddGroupForm'
import { columns } from './data/columnData'
import { useGroups } from '@/hooks/useGroups'
import { IGroupsProps } from './types/GroupTypes'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button, Popconfirm, Switch } from 'antd'
import { ModalStateEnum } from '@/types/ModalTypes'
import { IconCircleCheck, IconCircleX, IconEdit, IconPower } from '@tabler/icons-react'
import { toggleActiveGroups } from './helpers/services'
import { toast } from 'sonner'

const InventoryGroups: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<IGroupsProps & { belongs_to_id: number | undefined }>(
    {} as IGroupsProps & { belongs_to_id: number },
  )

  const { groupsData, isLoading } = useGroups('paginatedGroups', {
    keyword: search,
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })

  const queryClient = useQueryClient()

  const editGroupsData = (item: IGroupsProps) => () => {
    setEditData({ ...item, belongs_to_id: item.belongs_to?.id || undefined })
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toggleActiveGroups,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedGroups'] })
      toast.success(`Categoria ${item?.data.active ? 'Activada' : 'Desactivada'}`)
    },
  })

  const toggleActive = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (paymentTerminals: IGroupsProps[]) => {
    return paymentTerminals.map((item) => ({
      ...item,
      active: item.active ? (
        <IconCircleCheck className='text-green-1' />
      ) : (
        <IconCircleX className='text-red-1' />
      ),
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editGroupsData(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title={`${item.active ? 'Desactivar' : 'Activar'} Categoria`}
            description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este categoria?`}
            onConfirm={() => toggleActive(item.id)}
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

  return (
    <ContentLayout
      pageTitle='Categorias'
      buttonTitle='Categoria'
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
        setEditData({} as IGroupsProps & { belongs_to_id: number | undefined })
        setModalState(ModalStateEnum.addItem)
      }}
      dataSource={formatEditAndDelete(groupsData?.results || [])}
      columns={columns}
      fetching={isLoading}
      totalItems={groupsData?.count || 0}
      currentPage={currentPage}
      onChangePage={(page) => setCurrentPage(page)}
      onSearch={(value) => {
        setSearch(value)
        setCurrentPage(1)
      }}
    >
      {modalState === ModalStateEnum.addItem && (
        <AddGroupForm
          initialData={editData}
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      )}
    </ContentLayout>
  )
}

export { InventoryGroups }
