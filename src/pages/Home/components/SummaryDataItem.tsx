import { FC } from 'react'
import { Spin } from 'antd'
import { ISummaryProps } from '../types/DashboardTypes'

const SummaryDataItem: FC<{ props: ISummaryProps; loading: boolean }> = ({
  props: { icon, title, value, color },
  loading,
}) => {
  const Icon = icon
  return (
    <section
      className='bg-card rounded-lg p-4 grid content-center shadow-md border-l-4 overflow-hidden'
      style={{ borderLeftColor: color }}
    >
      {loading ? (
        <Spin />
      ) : (
        <div className='flex w-full justify-between items-center gap-3'>
          <div className='flex flex-col gap-1 min-w-0'>
            <p className='text-xs m-0 text-muted-foreground uppercase tracking-wider font-medium truncate'>
              {title}
            </p>
            <h2 className='font-bold text-2xl m-0'>{value}</h2>
          </div>
          <div
            className='rounded-xl p-2.5 shrink-0'
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon size={28} color={color} />
          </div>
        </div>
      )}
    </section>
  )
}

export default SummaryDataItem
