import { FC, useState } from 'react'
import { ITableRowProps } from './types/TableTypes'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useCart } from '../../../store/useCartStoreZustand'
import { InputNumber, Image } from 'antd'
import { formatNumberToColombianPesos, formatToUsd } from '../../../utils/helpers'

export const TableRow: FC<ITableRowProps> = ({ product }) => {
  const [visible, setVisible] = useState(false)

  const {
    addToCart,
    removeFromCart,
    cartItems,
    addDiscountToItem,
    updateTotalPrice,
    updateQuantity,
  } = useCart()

  const actualProduct = cartItems.filter((item) => item.code === product.code)[0]

  const { code, name, selling_price, usd_price, discount, total, usd_total, quantity } =
    actualProduct

  const addDiscountEvent = (event: number | null) => {
    if (!event || event < 0) event = 0
    addDiscountToItem(code, event)
    updateTotalPrice()
  }

  const changeQuantity = (event: number | null) => {
    if (!event || event < 0) event = 0
    updateQuantity(code, event)
    updateTotalPrice()
  }

  return (
    <li
      className={
        'w-full grid grid-cols-11 gap-3 py-4 text-center text-base list-none place-items-center border-x-0'
      }
    >
      <span className='text-start w-full'>{code}</span>
      <span className='col-span-2 text-left w-full truncate'>{name}</span>
      <span
        className='col-start-4 text-blue-400 underline cursor-pointer truncate'
        onClick={() => setVisible(true)}
      >
        Vista Previa
        {visible && (
          <Image
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
      </span>
      <span className='col-start-5 w-full'>{formatNumberToColombianPesos(selling_price)}</span>
      <span className='col-start-6 w-full'>{formatToUsd(usd_price)}</span>
      <div className='col-start-7 w-full flex justify-center items-center gap-1'>
        <InputNumber
          style={{ width: '80%' }}
          value={discount ? discount : 0}
          min={0}
          max={100}
          onChange={(event) => addDiscountEvent(event)}
          controls={false}
        />
        %
      </div>
      <div className='col-span-2 col-start-8 w-full'>
        <InputNumber
          style={{ width: '7.5rem' }}
          size='middle'
          addonBefore={
            <IconMinus
              className='cursor-pointer h-3 w-3'
              onClick={() => {
                removeFromCart(actualProduct)
                updateTotalPrice()
              }}
            />
          }
          addonAfter={
            <IconPlus
              className='cursor-pointer h-3 w-3'
              onClick={() => {
                addToCart(actualProduct)
                updateTotalPrice()
              }}
            />
          }
          value={quantity}
          controls={false}
          onChange={(event) => changeQuantity(event)}
        />
      </div>
      <span className='col-start-10 w-full'>{formatToUsd(usd_total)}</span>
      <span className='col-start-11 text-right w-full'>{formatNumberToColombianPesos(total)}</span>
    </li>
  )
}
