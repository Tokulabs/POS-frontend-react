import { FC, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { columnsDataInventoryMovemenets } from './data/TableTitles'
import { Switch } from 'antd'
import { ModalStateEnum } from '@/types/ModalTypes'
import { useQueryClient } from '@tanstack/react-query'
import { useinventoryMovements } from '@/hooks/useInventoryMovements'
import { IPurchaseSimple } from './types/PurchaseTypes'

const Purchase: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')
  const [editData, setEditData] = useState<IPurchaseSimple>({} as IPurchaseSimple)

  const { isLoading, inventoryMovementsData } = useinventoryMovements(
    'paginatedInventoryMovements',
    {
      keyword: search,
      page: currentPage,
      event_type: 'purchase',
    },
  )

  // const queryClient = useQueryClient()

  // const editProviderData = (item: IPurchaseSimple) => () => {
  //   setEditData(item)
  //   setModalState(ModalStateEnum.addItem)
  // }

  // const { mutate, isPending: isLoadingDelete } = useMutation({
  //   mutationFn: toggleActiveProvider,
  //   onSuccess: (item) => {
  //     queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
  //     toast.success(`Proveedor ${item?.data.active ? 'Activado' : 'Desactivado'}`)
  //   },
  // })

  // const toggleActive = (id: number) => {
  //   if (isLoadingDelete) return
  //   mutate(id)
  // }

  // const formatEditAndDelete = (paymentTerminals: IProvider[]) => {
  //   return paymentTerminals.map((item) => ({
  //     ...item,
  //     active: item.active ? (
  //       <IconCircleCheck className='text-green-1' />
  //     ) : (
  //       <IconCircleX className='text-red-1' />
  //     ),
  //     action: (
  //       <div className='flex justify-center items-center gap-2'>
  //         <Button type='link' className='p-0' onClick={editProviderData(item)}>
  //           <IconEdit />
  //         </Button>
  //         <Popconfirm
  //           title={`${item.active ? 'Desactivar' : 'Activar'} Proveedor`}
  //           description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este proveedor?`}
  //           onConfirm={() => toggleActive(item.id)}
  //           okText={`Si ${item.active ? 'Desactivar' : 'Activar'}`}
  //           cancelText='Cancelar'
  //         >
  //           <Button type='link' className='p-0'>
  //             <IconPower
  //               className={`${item.active ? 'text-red-1 hover:text-red-400' : 'text-green-1 hover:text-green-300'}`}
  //             />
  //           </Button>
  //         </Popconfirm>
  //       </div>
  //     ),
  //   }))
  // }

  return (
    <>
      <ContentLayout
        pageTitle='Compras'
        buttonTitle='Crear compra'
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
          setEditData({} as IPurchaseSimple)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={inventoryMovementsData?.results ?? []}
        columns={columnsDataInventoryMovemenets}
        totalItems={inventoryMovementsData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => {
          setSearch(value)
          setCurrentPage(1)
        }}
      >
        {/* {modalState === ModalStateEnum.addItem && (
          <AddProviderForm
            initialData={editData}
            onSuccessCallback={() => setModalState(ModalStateEnum.off)}
            isVisible={modalState === ModalStateEnum.addItem}
            onCancelCallback={() => setModalState(ModalStateEnum.off)}
          />
        )} */}
      </ContentLayout>
    </>
  )
}

export { Purchase }
