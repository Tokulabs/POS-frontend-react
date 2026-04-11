import { FC, useState } from 'react'
import { ITableRowProps } from './types/TableTypes'
import { IconMinus, IconPlus, IconCirclePlus } from '@tabler/icons-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCart } from '@/store/useCartStoreZustand'
import { InputNumber, Image, Checkbox, CheckboxProps } from 'antd'
import { calcMetaDataProdudct, formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'

export const TableRow: FC<ITableRowProps> = ({ product }) => {
  const [visible, setVisible] = useState(false)

  const {
    addToCart,
    removeFromCart,
    addDiscountToItem,
    updateTotalPrice,
    updateQuantity,
    updateIsGift,
  } = useCart()

  const { itemTaxesCOP } = calcMetaDataProdudct(product)

  const { code, name, selling_price, usd_price, discount, total, usd_total, quantity, is_gift, extra_cost } =
    product

  const addDiscountEvent = (event: number | null) => {
    if (!event || event < 0) event = 0
    addDiscountToItem(code, event)
    updateTotalPrice()
  }

  const changeQuantity = (event: number | null) => {
    if (event === 0) removeFromCart(product, true)
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
      <span className='col-span-2 text-left w-full truncate flex items-center gap-1'>
        {name}
        {(extra_cost ?? 0) > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button type='button' className='shrink-0 focus:outline-none'>
                <IconCirclePlus size={13} className='text-orange-500' />
              </button>
            </PopoverTrigger>
            <PopoverContent side='top' className='w-auto px-3 py-2 text-xs space-y-0.5'>
              <p className='font-semibold text-muted-foreground uppercase tracking-wide text-[10px]'>
                Costo adicional
              </p>
              <p className='font-bold text-orange-600'>
                +{formatNumberToColombianPesos(extra_cost!)}
              </p>
            </PopoverContent>
          </Popover>
        )}
      </span>
      <span
        className={`col-start-5 ${product.photo ? 'text-blue-400 underline cursor-pointer' : 'text-red-1'} truncate`}
        onClick={() => {
          product.photo && setVisible(true)
        }}
      >
        {product.photo ? 'Ver foto' : 'Sin foto'}
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
                removeFromCart(product)
                updateTotalPrice()
              }}
            />
          }
          addonAfter={
            <IconPlus
              className='cursor-pointer h-3 w-3'
              onClick={() => {
                addToCart(product)
                updateTotalPrice()
              }}
            />
          }
          value={quantity}
          controls={false}
          parser={(value) => (value ? +value : 0)}
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
