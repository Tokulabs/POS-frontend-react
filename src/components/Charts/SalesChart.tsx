import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { ISummaryByHour, ISummaryByKeyframe } from '@/pages/Home/types/DashboardTypes'
import { dateFormater, convertToCurrentWeek } from '@/pages/Home/helpers/dateFormater'

interface SalesChartProps {
  data: ISummaryByHour[] | ISummaryByKeyframe[]
  dataKey: string
  xAxisKey: string
}

const SalesChart: React.FC<SalesChartProps> = ({ data, dataKey, xAxisKey }) => {
  const isQuantity = dataKey === 'total_quantity'

  const formatX = (value: number) => {
    if (isQuantity) return `${value.toString().padStart(2, '0')}:00`
    if (xAxisKey === 'day') return dateFormater(value.toString())
    if (xAxisKey === 'week_number') return convertToCurrentWeek(value.toString())
    return value.toString()
  }

  const formatY = (value: number) =>
    isQuantity ? value.toString() : formatNumberToColombianPesos(value)

  return (
    // Responsive height: compact on mobile, full on desktop
    <div className='w-full h-52 sm:h-64 md:h-80 lg:h-96'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatX}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={isQuantity ? 30 : 80}
          />
          <Tooltip
            labelFormatter={formatX}
            formatter={(value: number) => [formatY(value), isQuantity ? 'Productos vendidos' : 'Total Ventas']}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line
            name={isQuantity ? 'Total Productos vendidos' : 'Total Ventas'}
            type='monotone'
            dataKey={dataKey}
            stroke='#269962'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export { SalesChart }
