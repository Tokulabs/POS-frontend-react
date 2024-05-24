import { FC } from 'react'
import PurchasesInfo from './components/PurchasesInfo'
import SummaryData from './components/SummaryData'
import TopSell from './components/TopSell'
import { SalesChart } from '../../components/Charts/SalesChart'
import { dailyData, hourlyData, monthlyData, weeklyData } from './data/chartData'

const Home: FC = () => {
  return (
    <main className='flex flex-col gap-4 h-full overflow-hidden overflow-y-auto scrollbar-hide'>
      <SummaryData />
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <TopSell />
        <div className='flex flex-col gap-4'>
          <PurchasesInfo />
        </div>
      </section>
      <section className='bg-white'>
        <div className='flex items-center w-full'>
          <div className='w-full'>
            <h2>Ventas Por Hora</h2>
            <SalesChart data={hourlyData} dataKey='totalProductsSold' xAxisKey='time' />
          </div>
          <div className='w-full'>
            <h2>Sales by Day</h2>
            <SalesChart data={dailyData} dataKey='totalMoneySold' xAxisKey='time' />
          </div>
        </div>
        <div className='flex items-center w-full'>
          <div className='w-full'>
            <h2>Sales by Week</h2>
            <SalesChart data={weeklyData} dataKey='totalMoneySold' xAxisKey='time' />
          </div>
          <div className='w-full'>
            <h2>Sales by Month</h2>
            <SalesChart data={monthlyData} dataKey='totalMoneySold' xAxisKey='time' />
          </div>
        </div>
      </section>
    </main>
  )
}

export { Home }
