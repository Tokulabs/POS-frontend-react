import { FC } from 'react'
import PurchasesInfo from './components/PurchasesInfo'
import SummaryData from './components/SummaryData'
import TopSell from './components/TopSell'

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
    </main>
  )
}

export { Home }
