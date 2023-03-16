import { FC } from 'react'
import SummaryData from './components/SummaryData'
import TopSell from './components/TopSell'

const Home: FC = () => {
  return (
    <main className='flex flex-col gap-4'>
      <SummaryData />
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <TopSell />
        <div className=''>...components</div>
      </section>
    </main>
  )
}

export default Home
