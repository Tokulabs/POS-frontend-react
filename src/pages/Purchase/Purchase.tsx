import { ChangeEvent, FC, useState } from 'react'
import { Button, Input, notification, Table } from 'antd'
import { useGetInventories } from '../../hooks/useGetInventories'
import { formatinventoryPhoto } from '../Inventories/Inventories'
import { DataPropsForm } from '../../types/AuthTypes'
import { IPurchaseProps } from './types/PurchaseTypes'
import { inventoryColumns, purchaseColumns } from './data/columnsData'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import Search from 'antd/es/input/Search'
import { IPurchaseAddRemoveProps } from '../../types/GlobalTypes'

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

const formatPurchaseData = (
  purchaseData: IPurchaseProps[],
  onRemoveItem: (inventoryId: number) => void,
  onChangeQty: (value: number, inventoryId: number) => void,
) => {
  return purchaseData.map((item) => ({
    ...item,
    key: item.id,
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
  const [inventories, setInventories] = useState<IInventoryProps[]>([])
  const [purchaseData, setPurchaseData] = useState<IPurchaseProps[]>([])
  const [purchaseItemQty, setPurchaseItemQty] = useState<IPurchaseAddRemoveProps>({})
  const [purchaseItemDataQty, setPurchaseItemDataQty] = useState<IPurchaseAddRemoveProps>({})

  useGetInventories(setInventories, setFetching)

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
        item: inventoryData.name,
        key: inventoryData.id,
        qty: qty,
        price: inventoryData.price,
        total: qty * inventoryData.price,
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
          dataSource={formatInventoryAction(
            formatinventoryPhoto(inventories),
            addItemPurchase,
            changeInventoryAddQty,
          )}
          columns={inventoryColumns}
          loading={fetching}
          size='small'
        />
      </div>
      <div className='bg-white rounded h-fit p-4 gap-8 col-span-3'>
        <div>
          <Table
            dataSource={formatPurchaseData(
              purchaseData,
              removeItemFromPurchase,
              changeInventoryRemoveQty,
            )}
            columns={purchaseColumns}
            loading={fetching}
            size='small'
          />
        </div>
      </div>
    </div>
  )
}

export default Purchase
