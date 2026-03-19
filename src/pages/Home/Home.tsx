import { FC, useEffect, useState } from 'react'
import PurchasesInfo from './components/PurchasesInfo'
import SummaryData from './components/SummaryData'
import TopSell from './components/TopSell'
import { Tabs } from 'antd'
import { SalesByHour } from './components/SalesByHour'
import { SalesByKeyframe } from './components/SalesByKeyFrame'
import { useQueryClient } from '@tanstack/react-query'
import { SalesByUser } from './components/SalesByUser'
import { GeneralGoals } from './components/GeneralGoals'
import { useHasPermission } from '@/hooks/useHasPermission'
import { DianExpiryAlert } from './components/DianExpiryAlert'
import { SubscriptionExpiryAlert } from './components/SubscriptionExpiryAlert'
import { useFeatureFlag } from '@/hooks/useSubscription'

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

  const hasPermissionDashboard = useHasPermission('can_view_dashboard_reports')
  const canManageGoals = useFeatureFlag('can_manage_goals')
  const canViewPurchases = useFeatureFlag('can_view_purchases')

  // Compute how many items are in the top row (TopSell + PurchasesInfo)
  const topRowCols = hasPermissionDashboard && canViewPurchases ? 'lg:grid-cols-3' : ''
  // Compute how many items are in the goals row
  const goalsRowCols = canManageGoals ? 'lg:grid-cols-3' : ''

  return (
    <main className='flex flex-col gap-4 h-full overflow-hidden overflow-y-auto scrollbar-hide'>
      <SubscriptionExpiryAlert />
      <DianExpiryAlert />
      <SummaryData />
      <section
        className={`grid grid-cols-1 gap-4 ${topRowCols}`}
      >
        <TopSell />
        {hasPermissionDashboard && canViewPurchases && <PurchasesInfo />}
      </section>
      {hasPermissionDashboard && (
        <>
          <section className={`grid grid-cols-1 ${goalsRowCols} gap-4`}>
            {canManageGoals && <GeneralGoals />}
            <div className={canManageGoals ? 'lg:col-span-2' : ''}>
              <SalesByUser />
            </div>
          </section>
          <section className='bg-card shadow-md rounded-lg p-5'>
            <Tabs onChange={onchange} type='card' items={DataTabs} />
          </section>
        </>
      )}
    </main>
  )
}

export { Home }
