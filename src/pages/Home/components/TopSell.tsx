import { DatePicker, Image, Spin, Tooltip } from 'antd'
import { useState } from 'react'
import { IconCameraOff } from '@tabler/icons-react'
import { useTopSellingProducts } from '@/hooks/useSummaryData'
import moment from 'moment'
import dayjs from 'dayjs'
import { UserRolesEnum } from '../../Users/types/UserTypes'
import { useRolePermissions } from '@/hooks/useRolespermissions'

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
    UserRolesEnum.storageAdmin,
  ]
  const { hasPermission: hasPermissionToSeeData } = useRolePermissions({
    allowedRoles: allowedRolesOverride,
  })

  return (
    <div className='bg-white h-auto md:max-h-96 overflow-scroll scrollbar-hide p-4 rounded-lg lg:col-span-2 flex flex-col gap-8 shadow-md'>
      <div className='w-full flex flex-col gap-3'>
        <p className='m-0 font-bold'>
          Top Productos del <span className='text-green-1'>{startDate}</span> al{' '}
          <span className='text-green-1'>{endDate}</span>
        </p>
        {hasPermissionToSeeData && (
          <RangePicker
            style={{ width: '50%' }}
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
      <div className='flex gap-6 flex-wrap'>
        {isLoading ? (
          <Spin />
        ) : (
          topSellingProducts?.map((item, index) => {
            return (
              <article
                key={index}
                className='min-w-28 w-40 h-auto grow bg-white border border-gray-200 rounded-lg shadow-lg'
              >
                <div className='rounded-t-lg w-full h-40 relative'>
                  <span
                    className={`absolute rounded-full -left-2 -top-3 shadow-md h-8 w-8 flex justify-center items-center text-white font-bold z-10 ${
                      index === 0
                        ? 'bg-[#BBA53D]'
                        : index === 1
                          ? 'bg-[#A5A9B4]'
                          : index === 2
                            ? 'bg-[#CD7F32]'
                            : 'bg-green-1'
                    }`}
                  >
                    {item.sum_top_ten_items}
                  </span>
                  {!item.photo ? (
                    <div className='w-full h-full rounded-t-lg flex justify-center items-center bg-background-main text-green-1'>
                      <IconCameraOff
                        style={{
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                        }}
                      />
                    </div>
                  ) : (
                    <Image
                      width={'100%'}
                      height={'100%'}
                      style={{
                        objectFit: 'cover',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                      }}
                      src={item.photo}
                      alt={`Foto item ${item.name}`}
                    />
                  )}
                </div>
                <div className='p-3 w-full bg-green-1 rounded-b-lg '>
                  <Tooltip title={item.name}>
                    <p className='m-0 text-sm text-white font-semibold truncate'>{item.name}</p>
                  </Tooltip>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}

export default TopSell
