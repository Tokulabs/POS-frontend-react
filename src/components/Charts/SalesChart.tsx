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

interface SalesChartProps {
  data: { time: string; totalProductsSold?: number; totalMoneySold?: number }[]
  dataKey: string
  xAxisKey: string
}

const SalesChart: React.FC<SalesChartProps> = ({ data, dataKey, xAxisKey }) => (
  <ResponsiveContainer width='100%' height={400}>
    <LineChart
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey={xAxisKey} />
      <YAxis
        tickFormatter={(value: number) => {
          if (dataKey === 'totalProductsSold') return value.toString()
          return formatNumberToColombianPesos(value)
        }}
      />
      <Tooltip
        formatter={(value: number) => {
          if (dataKey === 'totalProductsSold') return value.toString()
          return formatNumberToColombianPesos(value)
        }}
      />
      <Legend />
      <Line
        name={dataKey === 'totalProductsSold' ? 'Total Productos vendidos' : 'Total Ventas'}
        type='monotone'
        dataKey={dataKey}
        stroke='#8884d8'
        strokeWidth={2}
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </ResponsiveContainer>
)

export { SalesChart }
