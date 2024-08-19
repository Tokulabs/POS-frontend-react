import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useSummaryByUser } from '@/hooks/useSummaryData'
import moment from 'moment'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { DatePicker, DatePickerProps, Spin } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { motion } from 'framer-motion'

const SalesByUser = () => {
  const dateFormat = 'YYYY-MM-DD'
  const today = moment().format(dateFormat)
  const [date, setDate] = useState<string>(today)

  const [width, setWidth] = useState<number>(0)
  const containerSlider = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateWidth = () => {
      if (containerSlider.current) {
        setWidth(containerSlider.current.scrollWidth - containerSlider.current.offsetWidth)
      }
    }
    calculateWidth()
    const resizeObserver = new ResizeObserver(() => calculateWidth())
    if (containerSlider.current) {
      resizeObserver.observe(containerSlider.current)
    }
    return () => {
      if (containerSlider.current) {
        resizeObserver.unobserve(containerSlider.current)
      }
    }
  }, [])

  const { isLoading, summaryByUser } = useSummaryByUser('summaryByUser', {
    start_date: date,
    end_date: date,
  })

  const onChange: DatePickerProps['onChange'] = (date) => {
    if (!date) return
    setDate(date.format(dateFormat))
  }

  const allowedRolesOverride = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission: hasPermissionToSeeData } = useRolePermissions({
    allowedRoles: allowedRolesOverride,
  })

  return (
    <section className='bg-white p-4 rounded-lg lg:col-span-2 lg:col-start-2 shadow-md flex flex-col gap-7 w-full items-center justify-start'>
      <span className='flex gap-3 font-bold items-center'>
        Ventas por usuario del
        {hasPermissionToSeeData ? (
          <DatePicker defaultValue={dayjs(today)} format={dateFormat} onChange={onChange} />
        ) : (
          <div className='font-bold text-xl'>{date}</div>
        )}
      </span>
      {isLoading && <Spin size='large' />}
      <motion.div
        ref={containerSlider}
        whileTap={{ cursor: 'grabbing' }}
        className='w-full flex overflow-hidden'
      >
        <motion.div
          className='w-full flex gap-6'
          drag='x'
          dragConstraints={{ right: 0, left: -width }}
        >
          {summaryByUser &&
            summaryByUser
              ?.sort((a, b) => (a.total_invoice < b.total_invoice ? 1 : -1))
              .map((item) => {
                const percentage =
                  (item.total_invoice * 100) /
                  (item.sale_by__daily_goal > 0 ? item.sale_by__daily_goal : 1000000)
                return (
                  <div
                    className='flex flex-col gap-2 justify-end items-center min-w-56'
                    key={item.sale_by__id}
                  >
                    <span
                      className={`font-bold text-lg text-center ${percentage < 50 ? 'text-red-500' : percentage >= 100 ? 'text-green-1' : 'text-[#007bff]'}`}
                    >
                      {item.sale_by__fullname}
                    </span>
                    <div className='w-32 h-32'>
                      <CircularProgressbar
                        value={percentage}
                        text={`${percentage.toFixed(1)}%`}
                        circleRatio={0.75}
                        styles={buildStyles({
                          rotation: 1 / 2 + 1 / 8,
                          strokeLinecap: 'butt',
                          trailColor: '#eee',
                          pathColor:
                            percentage < 50 ? '#E62C37' : percentage >= 100 ? '#269962' : '#007bff',
                          textColor:
                            percentage < 50 ? '#E62C37' : percentage >= 100 ? '#269962' : '#007bff',
                        })}
                      />
                    </div>
                    <div className='flex gap-2'>
                      <span className='font-lg'>Ventas Diarias</span>
                      <span className='font-xl font-bold'>
                        {formatNumberToColombianPesos(item.total_invoice)}
                      </span>
                    </div>
                  </div>
                )
              })}
        </motion.div>
      </motion.div>
    </section>
  )
}

export { SalesByUser }
