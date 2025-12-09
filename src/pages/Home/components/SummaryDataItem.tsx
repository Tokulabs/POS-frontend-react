import { FC } from 'react'
import { Spin } from 'antd'
import { ISummaryProps } from '../types/DashboardTypes'

const SummaryDataItem: FC<{ props: ISummaryProps; loading: boolean }> = ({
  props: { icon, title, value, color },
  loading,
}) => {
  const Icon = icon
  return (
    <section className='bg-card rounded-lg p-4 grid content-center shadow-md'>
      {loading ? (
        <Spin />
      ) : (
        <div className='flex w-full justify-between items-center'>
          <div className='flex flex-col gap-2 '>
            <p className='text-sm m-0 text-gray-2'>{title}</p>
            <h2 className='font-bold m-0'>{value}</h2>
          </div>
          <Icon size={40} color={color} />
        </div>
      )}
    </section>
  )
}

export default SummaryDataItem
