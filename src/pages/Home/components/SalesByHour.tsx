import { SalesChart } from '@/components/Charts/SalesChart'
import { Spin } from 'antd'
import { useSummaryByhour } from '@/hooks/useSummaryData'
import { FC } from 'react'

interface ISalesByHour {
  update: string
}

const SalesByHour: FC<ISalesByHour> = () => {
  const { isLoading, summaryByHour } = useSummaryByhour('summaryByHour')

  return (
    <div className='w-full'>
      {summaryByHour && !isLoading ? (
        <SalesChart data={summaryByHour} dataKey='total_quantity' xAxisKey='time' />
      ) : (
        <Spin />
      )}
    </div>
  )
}

export { SalesByHour }
