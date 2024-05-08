import { FC, useState } from 'react'
import { ITableRowProps } from './types/TableTypes'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useCart } from '../../../store/useCartStoreZustand'
import { InputNumber, Image, Checkbox, CheckboxProps } from 'antd'
import {
  calcMetaDataProdudct,
  formatNumberToColombianPesos,
  formatToUsd,
} from '../../../utils/helpers'

export const TableRow: FC<ITableRowProps> = ({ product }) => {
  const [visible, setVisible] = useState(false)

  const {
    addToCart,
    removeFromCart,
    cartItems,
    addDiscountToItem,
    updateTotalPrice,
    updateQuantity,
    updateIsGift,
  } = useCart()

  const { itemTaxesCOP } = calcMetaDataProdudct(product)

  const actualProduct = cartItems.filter((item) => item.code === product.code)[0]

  const { code, name, selling_price, usd_price, discount, total, usd_total, quantity, is_gift } =
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

  const onChangeCheckBox: CheckboxProps['onChange'] = (e) => {
    updateIsGift(code, e.target.checked)
  }

  return (
    <li
      className={
        'w-full grid grid-cols-13 gap-3 py-4 text-center text-base list-none place-items-center border-x-0 px-1'
      }
    >
      <Checkbox
        defaultChecked={is_gift}
        className=' w-full flex justify-center items-center'
        onChange={onChangeCheckBox}
      />
      <span className='text-start w-full'>{code}</span>
      <span className='col-span-2 text-left w-full truncate'>{name}</span>
      <span
        className='col-start-5 text-blue-400 underline cursor-pointer truncate'
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
      <span className='col-start-6 w-full'>{formatNumberToColombianPesos(selling_price)}</span>
      <span className='col-start-7 w-full'>{formatToUsd(usd_price)}</span>
      <div className='col-start-8 w-full flex justify-center items-center gap-1'>
        <InputNumber
          style={{ width: '80%' }}
          value={discount ? discount : 0}
          min={0}
          max={100}
          onChange={(event) => addDiscountEvent(event)}
          controls={false}
          autoComplete='off'
          disabled={is_gift}
        />
        %
      </div>
      <div className='col-span-2 col-start-9 w-full'>
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
          autoComplete='off'
          disabled={is_gift}
        />
      </div>
      <span className='col-start-11 w-full'>{formatNumberToColombianPesos(itemTaxesCOP)}</span>
      <span className='col-start-12 w-full'>{formatToUsd(usd_total)}</span>
      <span className='col-start-13 text-right w-full'>{formatNumberToColombianPesos(total)}</span>
    </li>
  )
}
