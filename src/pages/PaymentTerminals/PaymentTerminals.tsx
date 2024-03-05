import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { columns } from './data/columsData'
import AddPaymentTerminalForm from './Components/AddPaymentTerminalForm'
import { usePaymentTerminals } from '../../hooks/usePaymentTerminals'
import { IPaymentTerminal } from './types/PaymentTerminalTypes'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Button, Popconfirm, notification } from 'antd'
import { ModalStateEnum } from '../../types/ModalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePaymentTerminals } from './helpers/services'

const PaymentTerminals: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const { isLoading, paymentTerminalsData } = usePaymentTerminals('paginatedPaymentTerminals', {
    page: currentPage,
  })
  const [editData, setEditData] = useState<IPaymentTerminal>({} as IPaymentTerminal)

  const queryClient = useQueryClient()

  const editPaymentTerminal = (item: IPaymentTerminal) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isLoading: isLoadingDelete } = useMutation({
    mutationFn: deletePaymentTerminals,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedPaymentTerminals'])
      notification.success({
        message: 'Exito',
        description: 'Datafono eliminado!',
      })
    },
  })

  const confirmDelete = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (paymentTerminals: IPaymentTerminal[]) => {
    return paymentTerminals.map((item) => ({
      ...item,
      is_wireless: item.is_wireless ? 'Si' : 'No',
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editPaymentTerminal(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title='Eliminar Producto'
            description='¿Estas seguro de eliminar este producto?'
            onConfirm={() => confirmDelete(item.id)}
            okText='Si, Eliminar'
            cancelText='Cancelar'
          >
            <Button type='link' className='p-0'>
              <IconTrash className='text-red-1 hover:text-red-400' />
            </Button>{' '}
          </Popconfirm>
        </div>
      ),
    }))
  }

  return (
    <>
      <ContentLayout
        pageTitle='Datafono'
        buttonTitle='Agregar Datafono'
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

export default PaymentTerminals
