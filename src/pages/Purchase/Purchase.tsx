import { ChangeEvent, FC, useState } from 'react'
import { Button, Input, Table } from 'antd'
import { useGetInventories } from '../../hooks/useGetInventories'
import { formatinventoryPhoto } from '../Inventories/Inventories'
import { DataPropsForm } from '../../types/AuthTypes'
import { IPurchaseProps } from './types/PurchaseTypes'
import { inventoryColumns, purchaseColumns } from './data/columnsData'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'

export const formatInventoryAction = (
  inventories: DataPropsForm[],
  onAddItem: (inventoryData: IInventoryProps) => void,
  onChangeQty: (value: number, inventoryId: number) => void,
) => {
  return inventories.map((item) => ({
    ...item,
    key: item.id,
    action: (
      <div>
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

const Purchase: FC = () => {
  const [fetching, setFetching] = useState(false)
  const [inventories, setInventories] = useState<IInventoryProps[]>([])
  const [purchase, setPurchase] = useState<IPurchaseProps[]>([])
  const [purchaseItemQty, setPurchaseItemQty] = useState<{ [key: number]: number }>({})

  useGetInventories(setInventories, setFetching)

  const addItemPurchase = (inventoryData: IInventoryProps) => {
    const qty = purchaseItemQty[inventoryData.id] | 1
    const tempPurchaseData: IPurchaseProps = {
      id: inventoryData.id,
      item: inventoryData.name,
      qty: qty,
      price: inventoryData.price,
      total: qty * inventoryData.price,
      action: (
        <div>
          <Input type='number' min={1} max={qty} defaultValue={1} />
          <Button>Remove</Button>
        </div>
      ),
    }
    setPurchase([...purchase, tempPurchaseData])
  }

  const changeInventoryQty = (value: number, inventoryId: number) => {
    setPurchaseItemQty({
      ...purchaseItemQty,
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
              <input type='text' />
            </div>
          </div>
        </div>
        <Table
          dataSource={formatInventoryAction(
            formatinventoryPhoto(inventories),
            addItemPurchase,
            changeInventoryQty,
          )}
          columns={inventoryColumns}
          loading={fetching}
          size='middle'
        />
      </div>
      <div className='bg-white rounded h-fit p-4 gap-8 col-span-3'>
        <div>
          <Table dataSource={purchase} columns={purchaseColumns} loading={fetching} size='middle' />
        </div>
      </div>
    </div>
  )
}

export default Purchase
