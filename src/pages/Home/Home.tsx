import { FC, useEffect, useState } from 'react'
import PurchasesInfo from './components/PurchasesInfo'
import SummaryData from './components/SummaryData'
import TopSell from './components/TopSell'
import { Tabs } from 'antd'
import { SalesByHour } from './components/SalesByHour'
import { SalesByKeyframe } from './components/SalesByKeyFrame'
import { useQueryClient } from '@tanstack/react-query'
// import { SalesByUser } from './components/SalesByUser'

const Home: FC = () => {
  const [dataType, setDataType] = useState('daily')
  const queryClient = useQueryClient()
  const DataTabs = [
    {
      label: `Hoy ${new Date().toLocaleDateString()}`,
      key: '1',
      children: <SalesByHour update={dataType} />,
    },
    {
      label: 'Últimos 7 días',
      key: 'daily',
      children: <SalesByKeyframe type={dataType} />,
    },
    {
      label: 'Últimas 5 semanas',
      key: 'weekly',
      children: <SalesByKeyframe type={dataType} />,
    },
    {
      label: `Año ${new Date().getFullYear()}`,
      key: 'monthly',
      children: <SalesByKeyframe type={dataType} />,
    },
  ]

  const onchange = (key: string) => {
    setDataType(key)
  }

  useEffect(() => {
    if (dataType === '1') {
      queryClient.invalidateQueries({ queryKey: ['summaryByHour'] })
    }
  }, [dataType])

  return (
    <main className='flex flex-col gap-4 h-full overflow-hidden overflow-y-auto scrollbar-hide'>
      <SummaryData />
      <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <TopSell />
        <div className='flex flex-col gap-4'>
          <PurchasesInfo />
        </div>
      </section>
      <section className='bg-white shadow-md rounded-lg p-5'>
        <Tabs onChange={onchange} type='card' items={DataTabs} />
      </section>
      {/* <section className='bg-white shadow-md rounded-lg p-5'>
        <SalesByUser />
      </section> */}
    </main>
  )
}

export { Home }
