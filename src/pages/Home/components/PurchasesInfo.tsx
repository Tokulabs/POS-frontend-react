import { useState } from 'react'
import { Spin, DatePicker } from 'antd'
import { formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { usePurchaseSummary } from '@/hooks/useSummaryData'
import moment from 'moment'
import dayjs from 'dayjs'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'

const PurchasesInfo = () => {
  const dateFormat = 'YYYY-MM-DD'
  const today = moment().format(dateFormat)
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)
  const { RangePicker } = DatePicker

  const { purchaseSummary, isLoading } = usePurchaseSummary('purchaseSummary', {
    start_date: startDate,
    end_date: endDate,
  })
  const showCurrency = false

  const allowedRolesOverride = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission: hasPermissionToSeeData } = useRolePermissions({
    allowedRoles: allowedRolesOverride,
  })

  return (
    <div className='bg-white w-full h-full p-4 rounded-lg lg:col-span-2 flex flex-col gap-4 shadow-md lg:col-start-3'>
      <div className='w-full flex flex-col gap-3'>
        <p className='m-0 font-bold'>
          Ventas del <span className='text-green-1'>{startDate}</span> al{' '}
          <span className='text-green-1'>{endDate}</span>
        </p>
        {hasPermissionToSeeData && (
          <RangePicker
            defaultValue={[dayjs(startDate), dayjs(endDate)]}
            onChange={(dates) => {
              if (dates) {
                setStartDate(dates[0] ? dates[0].format(dateFormat) : startDate)
                setEndDate(dates[1] ? dates[1].format(dateFormat) : endDate)
              }
            }}
            format={dateFormat}
            picker='date'
          />
        )}
      </div>
      {isLoading ? (
        <Spin />
      ) : (
        <section className='flex flex-col gap-5'>
          <div className='grid grid-cols-2'>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {formatNumberToColombianPesos(purchaseSummary?.selling_price ?? 0, showCurrency)}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>(Valor COP)</span>
            </div>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {purchaseSummary?.count ?? 0}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Cantidad de productos)
              </span>
            </div>
          </div>
          <div className='grid grid-cols-2'>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {formatNumberToColombianPesos(
                  purchaseSummary?.selling_price_gifts ?? 0,
                  showCurrency,
                )}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Valor regalos COP)
              </span>
            </div>
            <div className='flex flex-col'>
              <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
                {purchaseSummary?.gift_count ?? 0}
              </p>
              <span className='text-gray-2 text-sm overflow-hidden truncate'>
                (Cantidad de regalos)
              </span>
            </div>
          </div>
          <div className='flex flex-col'>
            <p className='m-0 font-bold text-2xl overflow-hidden truncate'>
              {formatToUsd(purchaseSummary?.price_dolar ?? 0, showCurrency)}
            </p>
            <span className='text-gray-2 text-sm overflow-hidden truncate'>(Venta USD)</span>
          </div>
        </section>
      )}
    </div>
  )
}

export default PurchasesInfo
