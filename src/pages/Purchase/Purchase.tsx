import { ChangeEvent, FC, useState, useRef, useEffect } from 'react'
// Antd
import { Button, Input, notification, Table } from 'antd'
import Search from 'antd/es/input/Search'
// Hooks
import { formatinventoryPhoto } from '../Inventories/Inventories'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUsers } from '../../hooks/useUsers'
import { useShops } from '../../hooks/useShops'
import { useInventories } from '../../hooks/useInventories'
// Types
import { DataPropsForm, IPrintData, IPurchaseAddRemoveProps } from '../../types/GlobalTypes'
import { ICustomerDataProps, IPurchaseProps } from './types/PurchaseTypes'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { IPaymentMethodsProps } from '../Invoices/types/InvoicesTypes'
import { IUserProps } from '../Users/types/UserTypes'
import { IDianResolutionProps } from '../Dian/types/DianResolutionTypes'
// Data
import { inventoryColumns, purchaseColumns } from './data/columnsData'
// Modals
import AddDataPurchaseForm from './components/AddDataPurchase'
// Components
import PrintOut from '../../components/Print/PrintOut'
import { useReactToPrint } from 'react-to-print'
import Clock from '../../components/Clock/Clock'
// Helpers
import { getTotal } from './helpers/PurchaseHelpers'
import { formatNumberToColombianPesos, formatToUsd } from '../../utils/helpers'
import { postInvoicesNew } from '../Invoices/helpers/services'
import { useDianResolutions } from '../../hooks/useDianResolution'

const formatInventoryAction = (
  inventories: DataPropsForm[],
  onAddItem: (inventoryData: IInventoryProps) => void,
  onChangeQty: (value: number, inventoryId: number) => void,
) => {
  return inventories.map((item) => ({
    ...item,
    key: item.id,
    action: (
      <div className='flex'>
        <Input
          type='number'
          min={1}
          max={item.remaining_in_shops as number}
          defaultValue={1}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChangeQty(parseInt(e.target.value), item.id as number)
          }
        />
        <Button onClick={() => onAddItem(item as unknown as IInventoryProps)}>Agregar</Button>
      </div>
    ),
  }))
}

const formatDataToCop = (data: DataPropsForm[] | IPurchaseProps[]) => {
  return data.map((item) => ({
    ...item,
    selling_price: formatNumberToColombianPesos(item.selling_price as number),
    usd_price: formatToUsd(item.usd_price as number),
  }))
}

const formatPurchaseData = (
  purchaseData: IPurchaseProps[],
  onRemoveItem: (inventoryId: number) => void,
  onChangeQty: (value: number, inventoryId: number) => void,
) => {
  return purchaseData.map((item) => ({
    ...item,
    key: item.id,
    total: formatNumberToColombianPesos(item.selling_price * item.qty),
    action: (
      <div>
        <Input
          type='number'
          min={1}
          max={item.qty}
          defaultValue={1}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChangeQty(parseInt(e.target.value), item.id)
          }
        />
        <Button onClick={() => onRemoveItem(item.id)}>Eliminar</Button>
      </div>
    ),
  }))
}

const Purchase: FC = () => {
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [purchaseItemQty, setPurchaseItemQty] = useState<IPurchaseAddRemoveProps>({})
  const [purchaseItemDataQty, setPurchaseItemDataQty] = useState<IPurchaseAddRemoveProps>({})
  const [modalState, setModalstate] = useState(false)
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [currentPage, setcurrentPage] = useState(1)
  const [printData, setPrintData] = useState<IPrintData>({} as IPrintData)

  const queryClient = useQueryClient()
  const { isLoading: isLoadingInventories, inventoriesData } = useInventories(
    'paginatedInventories',
    {
      page: currentPage,
    },
  )
  const { shopsData: allShopsData } = useShops('allShops', {})
  const { usersData: supportSales } = useUsers('supportSalesUsers', { role: 'supportSales' })
  const { dianResolutionData, isLoading: isLoadingResolution } = useDianResolutions(
    'allDianResolutions',
    {},
  )

  const printOutRef = useRef<HTMLDivElement>(null)

  const addItemPurchase = (inventoryData: IInventoryProps) => {
    const qty = purchaseItemQty[inventoryData.id] || 1
    const itemIndex = purchaseData.findIndex((item) => item.id === inventoryData.id)

    if (itemIndex >= 0) {
      const updatedQty = purchaseData[itemIndex].qty + qty
      if (updatedQty > inventoryData.total_in_shops) {
        notification.error({ message: 'Productos insuficientes' })
        return
      }

      const updatedPurchaseData = purchaseData.map((item) =>
        item.id === inventoryData.id
          ? { ...item, qty: updatedQty, total: updatedQty * inventoryData.selling_price }
          : item,
      )

      setPurchaseData(updatedPurchaseData)
    } else {
      if (qty > inventoryData.total_in_shops) {
        notification.error({ message: 'Productos insuficientes' })
        return
      }

      const newPurchaseData: IPurchaseProps = {
        id: inventoryData.id,
        code: inventoryData.code,
        item: inventoryData.name,
        key: inventoryData.id,
        qty: qty,
        selling_price: inventoryData.selling_price,
        usd_price: inventoryData.usd_price,
        total: qty * inventoryData.selling_price,
        totalUSD: qty * inventoryData.usd_price,
      }

      setPurchaseData([...purchaseData, newPurchaseData])
    }
  }

  const removeItemFromPurchase = (inventoryId: number) => {
    const qty = purchaseItemDataQty[inventoryId] || 1

    const updatedPurchaseData = purchaseData
      .map((item) => {
        if (item.id === inventoryId) {
          const updatedQty = item.qty - qty
          const updatedTotal = updatedQty * item.selling_price
          return updatedQty <= 0 ? null : { ...item, qty: updatedQty, total: updatedTotal }
        }
        return item
      })
      .filter(Boolean) as IPurchaseProps[]

    setPurchaseData(updatedPurchaseData)
  }

  const changeInventoryAddQty = (value: number, inventoryId: number) => {
    setPurchaseItemQty({
      ...purchaseItemQty,
      [inventoryId]: value,
    })
  }

  const changeInventoryRemoveQty = (value: number, inventoryId: number) => {
    setPurchaseItemDataQty({
      ...purchaseItemDataQty,
      [inventoryId]: value,
    })
  }

  const clearPurchaseData = () => {
    setPurchaseData([])
    setPurchaseItemDataQty({})
  }

  const { mutate, isLoading } = useMutation({
    mutationFn: postInvoicesNew,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedInventories'])
      notification.success({
        message: 'Exito',
        description: 'Factura Creada!',
      })
      clearPurchaseData()
      setcurrentPage(1)
    },
  })

  const submitInvoice = async (data?: number | DataPropsForm) => {
    if (typeof data === 'number') return
    const customerData: ICustomerDataProps = {
      customerName: data?.customer_name ? data?.customer_name.toString() : 'Cliente Generico',
      customerId: data?.customer_id ? data?.customer_id.toString() : '2222222222',
      customerEmail: data?.customer_email ? data?.customer_email.toString() : null,
      customerPhone: data?.customer_phone ? data?.customer_phone.toString() : null,
    }
    const paymentMethods: IPaymentMethodsProps[] = data?.payment_methods as IPaymentMethodsProps[]

    const paymentMethodsFormated: IPaymentMethodsProps[] = paymentMethods.map(
      (item: IPaymentMethodsProps) =>
        ({
          name: item.name,
          paid_amount: item.paid_amount,
          received_amount: item.received_amount,
          back_amount: item.back_amount,
          transaction_code: item.transaction_code ? item.transaction_code : null,
        } ?? []),
    )

    const dianInformation: IDianResolutionProps =
      dianResolutionData?.data[0] ?? ({} as IDianResolutionProps)

    const getSalesName =
      supportSales?.results.find((user: IUserProps) => user.id === (data?.sale_by_id as number))
        ?.fullname || 'SIGNOS'

    setPrintData({
      saleName: getSalesName,
      customerData,
      paymentMethods: paymentMethodsFormated,
      data: purchaseData,
      dianResolution: dianInformation,
      invoiceNumber: dianInformation?.current_number,
      isOverride: false,
    })

    const dataToSend = {
      shop_id: data?.shop_id as number,
      sale_by_id: data?.sale_by_id as number,
      invoice_item_data: purchaseData.map((item) => ({ item_id: item.id, quantity: item.qty })),
      customer_name: customerData.customerName,
      customer_id: customerData.customerId,
      customer_email: customerData.customerEmail,
      customer_phone: customerData.customerPhone,
      payment_methods: paymentMethodsFormated,
      is_dolar: data?.is_dolar as boolean,
      invoice_number: dianInformation?.current_number as number,
      dian_document_number: dianInformation?.document_number,
    }

    mutate(dataToSend)
    setModalstate(false)
    setShowPrintOut(true)
  }

  const createPurchase = () => {
    console.log(purchaseData)
    if (purchaseData.length < 1) {
      notification.error({
        message: 'No tienes productos en la venta en curso',
      })
      return
    }
    setModalstate(true)
  }

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint: () => {
      notification.success({
        message: 'Impresión exitosa',
        description: 'La factura se ha impreso correctamente',
      })
    },
    onPrintError: () => {
      notification.error({
        message: 'Error al imprimir',
        description: 'Ha ocurrido un error al imprimir la factura',
      })
    },
  })

  useEffect(() => {
    if (showPrintOut) {
      handlePrint()
      setShowPrintOut(false)
    }
  }, [showPrintOut])

  return (
    <div className='grid grid-cols-8 gap-6'>
      <div
        className='bg-white rounded p-4 flex flex-col
      gap-8 col-span-5'
      >
        <div className='flex justify-between items-center'>
          <h1 className='m-0 p-0 text-base font-semibold'>Relizar una venta</h1>
          <div className='flex items-center'>
            <div>
              <Search
                placeholder='input search text'
                onSearch={() => console.log('buscar')}
                enterButton
              />
            </div>
          </div>
        </div>
        <Table
          dataSource={formatDataToCop(
            formatInventoryAction(
              formatinventoryPhoto(inventoriesData?.results ?? []),
              addItemPurchase,
              changeInventoryAddQty,
            ),
          )}
          columns={inventoryColumns}
          loading={isLoadingInventories}
          size='small'
          pagination={{
            current: currentPage,
            total: inventoriesData?.count ?? 0,
            size: 'small',
            onChange: (page) => setcurrentPage(page),
            showSizeChanger: false,
          }}
        />
      </div>
      <div className='col-span-3'>
        <div className='sticky top-0 flex flex-col gap-3'>
          <div className='bg-white rounded h-fit p-4'>
            <div>
              <Table
                dataSource={formatDataToCop(
                  formatPurchaseData(
                    purchaseData,
                    removeItemFromPurchase,
                    changeInventoryRemoveQty,
                  ),
                )}
                columns={purchaseColumns}
                size='small'
                pagination={false}
              />
            </div>
            <div className='flex justify-between items-center mt-3'>
              <div className='flex flex-col'>
                <div className='text-sm text-gray-2'>Fecha</div>
                <Clock />
              </div>
              <div className='flex flex-col text-right'>
                <div className='text-sm text-gray-2'>Total</div>
                <div className=''>
                  {formatNumberToColombianPesos(getTotal(purchaseData).total | 0)}
                </div>
              </div>
              <div className='flex flex-col text-right'>
                <div className='text-sm text-gray-2'>Total USD</div>
                <div className=''>{formatToUsd(getTotal(purchaseData).totalUSD | 0)}</div>
              </div>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button type='primary' onClick={createPurchase} loading={isLoading}>
              Guardar & imprimir
            </Button>
            <Button type='primary' danger onClick={clearPurchaseData}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      {modalState && (
        <AddDataPurchaseForm
          isVisible={modalState}
          salesUsers={supportSales?.results ?? []}
          onSuccessCallback={submitInvoice}
          onCancelCallback={() => setModalstate(false)}
          shops={allShopsData?.results ?? []}
          total={getTotal(purchaseData).total}
          totalUSD={getTotal(purchaseData).totalUSD}
        />
      )}
      <div ref={printOutRef}>
        {showPrintOut && !isLoadingResolution ? <PrintOut printData={printData} /> : null}
      </div>
    </div>
  )
}

export default Purchase
