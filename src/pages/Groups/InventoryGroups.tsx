import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import AddGroupForm from './components/AddGroupForm'
import { columns } from './data/columnData'
import { useGroups } from '../../hooks/useGroups'
import { IGroupsProps } from './types/GroupTypes'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button, Popconfirm, Switch } from 'antd'
import { ModalStateEnum } from '../../types/ModalTypes'
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconTrash,
  IconSquareCheck,
} from '@tabler/icons-react'
import { toggleActiveGroups } from './helpers/services'
import { toast } from 'sonner'

const InventoryGroups: FC = () => {
  const [currentPage, setcurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const [editData, setEditData] = useState<IGroupsProps>({} as IGroupsProps)

  const { groupsData, isLoading } = useGroups('paginatedGroups', {
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })

  const queryClient = useQueryClient()

  const editGroupsData = (item: IGroupsProps) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toggleActiveGroups,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedGroups'] })
      toast.success(`Categoria ${item?.data.active ? 'Activado' : 'Desactivado'}`)
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
        setEditData({} as IGroupsProps)
        setModalState(ModalStateEnum.addItem)
      }}
      dataSource={formatEditAndDelete(groupsData?.results || [])}
      columns={columns}
      fetching={isLoading}
      totalItems={groupsData?.count || 0}
      currentPage={currentPage}
      onChangePage={(page) => setcurrentPage(page)}
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
