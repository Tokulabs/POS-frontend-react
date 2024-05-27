import { SalesChart } from '../../../components/Charts/SalesChart'
import { Spin } from 'antd'
import { useSummmaryByKeyFrame } from '../../../hooks/useSummaryData'
import { FC } from 'react'

interface ISalesByKeyframe {
  type: string
}

const SalesByKeyframe: FC<ISalesByKeyframe> = ({ type }) => {
  const { isLoading, summaryByKeyframe } = useSummmaryByKeyFrame('summaryByKeyframe', { type })

  const xAxis = type === 'daily' ? 'day' : type === 'weekly' ? 'week_number' : 'month'

  return (
    <div className='w-full'>
      {summaryByKeyframe && !isLoading && type !== '1' ? (
        <SalesChart data={summaryByKeyframe} dataKey='total_amount' xAxisKey={xAxis} />
      ) : (
        <Spin />
      )}
    </div>
  )
}

export { SalesByKeyframe }
