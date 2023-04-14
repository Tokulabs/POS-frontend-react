import { ChangeEvent, FC, useState, useRef, useContext } from 'react'
import { Button, Input, notification, Table } from 'antd'
import { useGetInventories } from '../../hooks/useGetInventories'
import { formatinventoryPhoto } from '../Inventories/Inventories'
import { DataPropsForm, IPaginationProps, IPurchaseAddRemoveProps } from '../../types/GlobalTypes'
import { ICustomerDataProps, IPurchaseProps } from './types/PurchaseTypes'
import { inventoryColumns, purchaseColumns } from './data/columnsData'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import Search from 'antd/es/input/Search'
import { IShopProps } from '../Shops/types/ShopTypes'
import { useGetShops } from './../../hooks/useGetShops'
import SelectShopPurchaseForm from './components/SelectShopPurchase'
import { axiosRequest } from '../../api/api'
import { invoiceURL } from './../../utils/network'
import PrintOut from '../../components/Print/PrintOut'
import { useReactToPrint } from 'react-to-print'
import { getTotal } from './helpers/PurchaseHelpers'
import Clock from '../../components/Clock/Clock'
import { store } from '../../store'
import { getInventories } from '../../hooks/helper/functions'
import { formatNumberToColombianPesos, formatToUsd } from '../../utils/helpers'
import { IPaymentMethodsProps } from '../Invoices/types/InvoicesTypes'

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
          max={item.remaining as number}
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
    price: formatNumberToColombianPesos(item.price as number),
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
    total: formatNumberToColombianPesos(item.price * item.qty),
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
  const [fetching, setFetching] = useState(false)
  const [inventories, setInventories] = useState<IPaginationProps<IInventoryProps>>()
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [purchaseItemQty, setPurchaseItemQty] = useState<IPurchaseAddRemoveProps>({})
  const [purchaseItemDataQty, setPurchaseItemDataQty] = useState<IPurchaseAddRemoveProps>({})
  const [shops, setShops] = useState<IPaginationProps<IShopProps>>()
  const [selectShopVisible, setSelectShopVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPrintOut, setShowPrintOut] = useState(false)
  const [purchaseDone, setPurchaseDone] = useState(false)
  const [shopId, setShopId] = useState(0)
  const [currentPage, setcurrentPage] = useState(1)
  const [customerData, setCustomerData] = useState<ICustomerDataProps>({} as ICustomerDataProps)
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodsProps[]>([])

  const printOutRef = useRef<HTMLDivElement>(null)
  const getShopName = shops?.results.find((shop) => shop.id === shopId)?.name || ''

  const { state } = useContext(store)
  useGetShops(setShops, () => null)
  useGetInventories(setInventories, setFetching, [purchaseDone])

  const addItemPurchase = (inventoryData: IInventoryProps) => {
    const qty = purchaseItemQty[inventoryData.id] || 1
    const itemIndex = purchaseData.findIndex((item) => item.id === inventoryData.id)

    if (itemIndex >= 0) {
      const updatedQty = purchaseData[itemIndex].qty + qty
      if (updatedQty > inventoryData.remaining) {
        notification.error({ message: 'Productos insuficientes' })
        return
      }

      const updatedPurchaseData = purchaseData.map((item) =>
        item.id === inventoryData.id
          ? { ...item, qty: updatedQty, total: updatedQty * inventoryData.price }
          : item,
      )

      setPurchaseData(updatedPurchaseData)
    } else {
      if (qty > inventoryData.remaining) {
        notification.error({ message: 'Productos insuficientes' })
        return
      }

      const newPurchaseData: IPurchaseProps = {
        id: inventoryData.id,
        code: inventoryData.code,
        item: inventoryData.name,
        key: inventoryData.id,
        qty: qty,
        price: inventoryData.price,
        usd_price: inventoryData.usd_price,
        total: qty * inventoryData.price,
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
          const updatedTotal = updatedQty * item.price
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

  const submitInvoice = async (data?: number | DataPropsForm) => {
    if (typeof data === 'number') return
    const customerData: ICustomerDataProps = {
      customerName: data?.customer_name ? data?.customer_name.toString() : 'Cliente Generico',
      customerId: data?.customer_id ? data?.customer_id.toString() : '2222222222',
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
        } || []),
    )

    setCustomerData(customerData)
    setPaymentMethods(paymentMethodsFormated)
    setShopId(data?.shop_id as number)
    setShowPrintOut(true)
    setSelectShopVisible(false)

    const dataToSend = {
      shop_id: data?.shop_id as number,
      invoice_item_data: purchaseData.map((item) => ({ item_id: item.id, quantity: item.qty })),
      customer_name: customerData.customerName,
      customer_id: customerData.customerId,
      payment_methods: paymentMethodsFormated,
      is_dollar: data?.is_dollar as boolean,
    }

    try {
      setLoading(true)
      const response = await axiosRequest({
        method: 'post',
        url: invoiceURL,
        hasAuth: true,
        payload: dataToSend,
      })
      if (response) {
        notification.success({
          message: 'Exito',
          description: 'Factura creada!',
        })
      }
      handlePrint()
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
      setShowPrintOut(false)
      clearPurchaseData()
      setPurchaseDone(!purchaseDone)
      setShopId(0)
      setcurrentPage(1)
    }
  }

  const getShopId = () => {
    if (purchaseData.length < 1) {
      notification.error({
        message: 'No tienes productos en la venta en curso',
      })
      return
    }
    setSelectShopVisible(true)
  }

  const handlePrint = useReactToPrint({
    content: () => printOutRef.current,
    onAfterPrint() {
      console.log('impresion exitosa')
    },
  })

  const onChangePagination = (page: number) => {
    getInventories(setInventories, setFetching, page)
    setcurrentPage(page)
  }

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
              formatinventoryPhoto(inventories?.results || []),
              addItemPurchase,
              changeInventoryAddQty,
            ),
          )}
          columns={inventoryColumns}
          loading={fetching}
          size='small'
          pagination={{
            current: currentPage,
            total: inventories?.count || 0,
            size: 'small',
            onChange: (page) => onChangePagination(page),
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
                  {formatNumberToColombianPesos(getTotal(purchaseData).total | 0) + ' COP'}
                </div>
              </div>
              <div className='flex flex-col text-right'>
                <div className='text-sm text-gray-2'>Total USD</div>
                <div className=''>{formatToUsd(getTotal(purchaseData).totalUSD | 0) + ' USD'}</div>
              </div>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button type='primary' onClick={getShopId} loading={loading}>
              Guardar & imprimir
            </Button>
            <Button type='primary' danger onClick={clearPurchaseData}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
      {selectShopVisible && (
        <SelectShopPurchaseForm
          isVisible={selectShopVisible}
          onSuccessCallback={submitInvoice}
          onCancelCallback={() => setSelectShopVisible(false)}
          shops={shops?.results || []}
          total={getTotal(purchaseData).total}
        />
      )}
      <div ref={printOutRef}>
        {showPrintOut ? (
          <PrintOut
            paymentMethods={paymentMethods}
            data={purchaseData}
            user={state.user?.fullname || ''}
            shopName={getShopName}
            customerData={customerData}
          />
        ) : null}
      </div>
    </div>
  )
}

export default Purchase
