import { DatePicker, Spin } from 'antd'
import { useState } from 'react'
import { IconCameraOff } from '@tabler/icons-react'
import { useTopSellingProducts } from '../../../hooks/useSummaryData'
import moment from 'moment'
import dayjs from 'dayjs'
import { UserRolesEnum } from '../../Users/types/UserTypes'
import { useRolePermissions } from '../../../hooks/useRolespermissions'

const TopSell = () => {
  const dateFormat = 'YYYY-MM-DD'
  const today = moment().format(dateFormat)
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)
  const { topSellingProducts, isLoading } = useTopSellingProducts('topSellingProducts', {
    start_date: startDate,
    end_date: endDate,
  })
  const { RangePicker } = DatePicker

  const allowedRolesOverride = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.shopAdmin,
  ]
  const { hasPermission: hasPermissionToSeeData } = useRolePermissions(allowedRolesOverride)

  return (
    <div className='bg-white p-4 rounded-lg md:col-span-2 flex flex-col gap-4 shadow-md'>
      <div className='w-full flex flex-col gap-3'>
        <p className='m-0 text-sm'>
          Top Productos del <span className='font-bold text-base'>{startDate}</span> al{' '}
          <span className='font-bold text-base'>{endDate}</span>
        </p>
        {hasPermissionToSeeData && (
          <RangePicker
            style={{ width: '50%' }}
            defaultValue={[dayjs(startDate), dayjs(endDate)]}
            onChange={(dates) => {
              if (dates[0] && dates[1]) {
                setStartDate(dates[0].format(dateFormat))
                setEndDate(dates[1].format(dateFormat))
              }
            }}
            format={dateFormat}
            picker='date'
          />
        )}
      </div>
      <div className='grid items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-7 gap-4'>
        {isLoading ? (
          <Spin />
        ) : (
          topSellingProducts?.map((item, index) => (
            <article className='min-w-0 min-w-md bg-[#f3f5ff] rounded-md' key={index}>
              {item.photo ? (
                <img
                  className='w-full h-40 lg:h-20 object-cover rounded-md'
                  src={item.photo}
                  alt='photo item'
                />
              ) : (
                <span className='text-green-1'>
                  <IconCameraOff
                    style={{
                      width: '100%',
                      height: '5rem',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                    }}
                  />
                </span>
              )}
              <section className='px-2 py-3'>
                <p className='m-0 text-xs text-[#262932] font-bold truncate'>{item.name}</p>
                <p className='m-0 text-sm text-[#5f626e]'>{item.sum_top_ten_items}</p>
              </section>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

export default TopSell
