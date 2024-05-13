import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { columns } from './data/columsData'
import AddPaymentTerminalForm from './Components/AddPaymentTerminalForm'
import { usePaymentTerminals } from '../../hooks/usePaymentTerminals'
import { IPaymentTerminal } from './types/PaymentTerminalTypes'
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconSquareCheck,
  IconTrash,
} from '@tabler/icons-react'
import { Button, Popconfirm, Switch } from 'antd'
import { ModalStateEnum } from '../../types/ModalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleActivePaymentTemrinal } from './helpers/services'
import { toast } from 'sonner'

const PaymentTerminals: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const { isLoading, paymentTerminalsData } = usePaymentTerminals('paginatedPaymentTerminals', {
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })
  const [editData, setEditData] = useState<IPaymentTerminal>({} as IPaymentTerminal)

  const queryClient = useQueryClient()

  const editPaymentTerminal = (item: IPaymentTerminal) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toggleActivePaymentTemrinal,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedPaymentTerminals'] })
      toast.success(`Datafono ${item?.data.active ? 'Activado' : 'Desactivado'}`)
    },
  })

  const toggleActive = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (paymentTerminals: IPaymentTerminal[]) => {
    return paymentTerminals.map((item) => ({
      ...item,
      is_wireless: item.is_wireless ? 'Si' : 'No',
      active: item.active ? (
        <IconCircleCheck className='text-green-1' />
      ) : (
        <IconCircleX className='text-red-1' />
      ),
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editPaymentTerminal(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title={`${item.active ? 'Desactivar' : 'Activar'} datáfono`}
            description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este datáfono?`}
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
    <>
      <ContentLayout
        pageTitle='Datáfonos'
        buttonTitle='Crear Datafono'
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
          setEditData({} as IPaymentTerminal)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={formatEditAndDelete(paymentTerminalsData?.results || [])}
        columns={columns}
        totalItems={paymentTerminalsData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
      >
        {modalState === ModalStateEnum.addItem && (
          <AddPaymentTerminalForm
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

export { PaymentTerminals }
