import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import AddUserForm from './components/AddUserForm'
import { columns } from './data/columsData'
import { useUsers } from '@/hooks/useUsers'
import { IUserProps, UserDocumentTypeEnum, UserRolesEnum } from './types/UserTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Popconfirm, Switch, Tooltip } from 'antd'
import { IconCircleCheck, IconCircleX, IconEdit, IconPower } from '@tabler/icons-react'
import { ModalStateEnum } from '@/types/ModalTypes'
import { toggleActiveUser } from './helpers/services'
import { toast } from 'sonner'
import { useRolePermissions } from '@/hooks/useRolespermissions'

const Users: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<IUserProps>({} as IUserProps)
  const { isLoading, usersData } = useUsers('paginatedUsers', {
    keyword: search,
    page: currentPage,
    is_active: showActive ? 'True' : undefined,
  })

  const queryClient = useQueryClient()

  const editUserData = (item: IUserProps) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toggleActiveUser,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedUsers'] })
      toast.success(`Usuario ${item?.data.is_active ? 'Activado' : 'Desactivado'}`)
    },
  })

  const toggleActive = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const allowedRolesDownload = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission: hasPermissionsToEdit } = useRolePermissions({
    allowedRoles: allowedRolesDownload,
  })

  const formatEditAndDelete = (userData: IUserProps[]) => {
    return userData.map((item) => ({
      ...item,
      is_active: item.is_active ? (
        <IconCircleCheck className='text-green-1' />
      ) : (
        <IconCircleX className='text-red-1' />
      ),
      document_type: (
        <Tooltip
          title={UserDocumentTypeEnum[item.document_type as keyof typeof UserDocumentTypeEnum]}
        >
          <span>{item.document_type}</span>
        </Tooltip>
      ),
      action: (
        <div className='flex justify-center items-center gap-2'>
          {hasPermissionsToEdit && (
            <Button type='link' className='p-0' onClick={editUserData(item)}>
              <IconEdit />
            </Button>
          )}

          <Popconfirm
            title={`${item.is_active ? 'Desactivar' : 'Activar'} Usuario`}
            description={`¿Estas seguro de ${item.is_active ? 'desactivar' : 'activar'} este usuario?`}
            onConfirm={() => toggleActive(item.id)}
            okText={`Si ${item.is_active ? 'Desactivar' : 'Activar'}`}
            cancelText='Cancelar'
          >
            <Button type='link' className='p-0'>
              <IconPower
                className={`${item.is_active ? 'text-red-1 hover:text-red-400' : 'text-green-1 hover:text-green-300'}`}
              />
            </Button>
          </Popconfirm>
        </div>
      ),
    }))
  }

  return (
    <>
      <ContentLayout
        pageTitle='Usuarios'
        buttonTitle={hasPermissionsToEdit ? 'Agregar Usuario' : undefined}
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
          setEditData({} as IUserProps)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={formatEditAndDelete(usersData?.results || [])}
        columns={columns}
        totalItems={usersData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
      >
        {modalState === ModalStateEnum.addItem && (
          <AddUserForm
            initialData={editData}
            onSuccessCallback={() => setModalState(ModalStateEnum.off)}
            isVisible={modalState === ModalStateEnum.addItem}
            onCancelCallback={() => setModalState(ModalStateEnum.off)}
          />
        )}
      </ContentLayout>
    </>
  )
}

export { Users }
