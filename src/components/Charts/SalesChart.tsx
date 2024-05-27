// src/components/SalesChart.tsx

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
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { ISummaryByHour, ISummaryByKeyframe } from '../../pages/Home/types/DashboardTypes'
import { dateFormater, convertToCurrentWeek } from '../../pages/Home/helpers/dateFormater'

interface SalesChartProps {
  data: ISummaryByHour[] | ISummaryByKeyframe[]
  dataKey: string
  xAxisKey: string
}

const SalesChart: React.FC<SalesChartProps> = ({ data, dataKey, xAxisKey }) => (
  <ResponsiveContainer width='100%' height={400}>
    <LineChart
      data={data}
      margin={{
        top: 15,
        right: 35,
        left: 25,
        bottom: 10,
      }}
    >
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis
        dataKey={xAxisKey}
        tickFormatter={(value: number) => {
          if (dataKey === 'total_quantity') return `${value.toString().padStart(2, '0')}:00`
          if (xAxisKey === 'day') return dateFormater(value.toString())
          if (xAxisKey === 'week_number') return convertToCurrentWeek(value.toString())
          return value.toString()
        }}
      />
      <YAxis
        tickFormatter={(value: number) => {
          if (dataKey === 'total_quantity') return value.toString()
          return formatNumberToColombianPesos(value)
        }}
      />
      <Tooltip
        labelFormatter={(value: number) => {
          if (dataKey === 'total_quantity') return `${value.toString().padStart(2, '0')}:00`
          if (xAxisKey === 'day') return dateFormater(value.toString())
          if (xAxisKey === 'week_number') return convertToCurrentWeek(value.toString())
          return value.toString()
        }}
        formatter={(value: number) => {
          if (dataKey === 'total_quantity') return value.toString()
          return formatNumberToColombianPesos(value)
        }}
      />
      <Legend />
      <Line
        name={dataKey === 'total_quantity' ? 'Total Productos vendidos' : 'Total Ventas'}
        type='monotone'
        dataKey={dataKey}
        stroke='#269962'
        strokeWidth={2}
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </ResponsiveContainer>
)

export { SalesChart }
