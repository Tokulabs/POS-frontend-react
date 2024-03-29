import { FC, useState } from 'react'
import { ITableRowProps } from './types/TableTypes'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useCart } from '../../../store/useCartStoreZustand'
import { InputNumber, Image } from 'antd'

export const TableRow: FC<ITableRowProps> = ({ product }) => {
  const [visible, setVisible] = useState(false)

  const { addToCart, removeFromCart, cartItems, addDiscountToItem, updateTotalPrice } = useCart()

  const actualProduct = cartItems.filter((item) => item.code === product.code)[0]

  const { code, name, selling_price, usd_price, discount, total, usd_total, quantity } =
    actualProduct

  const addDiscountEvent = (event: number | null) => {
    if (event === null) event = 0
    if (event < 1) event = 0
    addDiscountToItem(code, event)
    updateTotalPrice()
  }

  return (
    <>
      <li
        className={
          'w-full grid grid-cols-11 gap-3 text-center text-base list-none place-items-center my-3'
        }
      >
        <span className='text-start w-full'>{code}</span>
        <span className='col-span-2 text-left w-full truncate'>{name}</span>
        <span
          className='col-start-4 text-blue-400 underline cursor-pointer'
          onClick={() => setVisible(true)}
        >
          Vista Previa
        </span>
        <span className='col-start-5 w-full'>{selling_price}</span>
        <span className='col-start-6 w-full'>{usd_price}</span>
        <div className='col-start-7 w-full flex justify-center items-center gap-1'>
          <InputNumber
            style={{ width: '80%' }}
            defaultValue={!discount ? discount : 0}
            min={0}
            max={100}
            onChange={(event) => addDiscountEvent(event)}
            controls={false}
          />
          %
        </div>
        <div className='col-span-2 col-start-8 w-full'>
          <div className='grid grid-cols-3 w-full place-items-center'>
            <div
              className='w-full h-full border border-solid flex items-center justify-center'
              onClick={() => {
                removeFromCart(actualProduct)
                updateTotalPrice()
              }}
            >
              <IconMinus />
            </div>
            <span className='flex w-full h-full border border-solid items-center justify-center'>
              {quantity}
            </span>
            <div
              className='flex w-full h-full border border-solid items-center justify-center'
              onClick={() => {
                addToCart(actualProduct)
                updateTotalPrice()
              }}
            >
              <IconPlus />
            </div>
          </div>
        </div>
        <span className='col-start-10 w-full'>{usd_total}</span>
        <span className='col-start-11 text-right w-full'>{total}</span>
      </li>
      {visible && (
        <Image
          width={200}
          style={{ display: 'none' }}
          src={product.photo}
          preview={{
            visible,
            src: product.photo,
            onVisibleChange: (value) => {
              setVisible(value)
            },
          }}
        />
      )}
    </>
  )
}
