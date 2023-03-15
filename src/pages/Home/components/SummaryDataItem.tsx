import { FC } from 'react'
import { ISummaryProps } from '../data/dataSummary'
import { Spin } from 'antd'

const SummaryDataItem: FC<{ props: ISummaryProps; loading: boolean }> = ({
  props: { icon, title, value, color },
  loading,
}) => {
  const Icon = icon
  return (
    <section className='bg-white rounded-lg p-4 grid content-center'>
      {loading ? (
        <Spin />
      ) : (
        <div className='flex w-full justify-between items-center'>
          <div className='flex flex-col gap-2 '>
            <p className='text-xs m-0 text-gray-2'>{title}</p>
            <h3 className='font-bold m-0'>{value}</h3>
          </div>
          <Icon size={35} color={color} />
        </div>
      )}
    </section>
  )
}

export default SummaryDataItem
