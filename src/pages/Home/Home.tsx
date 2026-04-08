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
import { useDashboardWebSocket } from '@/hooks/useDashboardWebSocket'

const Home: FC = () => {
  const [dataType, setDataType] = useState('daily')
  const queryClient = useQueryClient()

  const DataTabs = [
    {
      label: `Hoy`,
      key: '1',
      children: <SalesByHour update={dataType} />,
    },
    {
      label: 'Últ. 7 días',
      key: 'daily',
      children: <SalesByKeyframe type={dataType} />,
    },
    {
      label: 'Últ. 5 semanas',
      key: 'weekly',
      children: <SalesByKeyframe type={dataType} />,
    },
    {
      label: `Año ${new Date().getFullYear()}`,
      key: 'monthly',
      children: <SalesByKeyframe type={dataType} />,
    },
  ]

  const onchange = (key: string) => setDataType(key)

  useEffect(() => {
    if (dataType === '1') {
      queryClient.invalidateQueries({ queryKey: ['summaryByHour'] })
    }
  }, [dataType])

  useDashboardWebSocket()

  const hasPermissionDashboard = useHasPermission('can_view_dashboard_reports')
  const canManageGoals = useFeatureFlag('can_manage_goals')
  const canViewPurchases = useFeatureFlag('can_view_purchases')

  const showPurchases = hasPermissionDashboard && canViewPurchases

  return (
    <main className='flex flex-col gap-4 h-full overflow-hidden overflow-y-auto scrollbar-hide'>
      <SubscriptionExpiryAlert />
      <DianExpiryAlert />

      {/* KPI summary cards */}
      <SummaryData />

      {/* Sales hero + top products */}
      <section className={`grid grid-cols-1 gap-4 ${showPurchases ? 'lg:grid-cols-3' : ''}`}>
        {showPurchases && (
          <div className='lg:col-span-1'>
            <PurchasesInfo />
          </div>
        )}
        <div className={showPurchases ? 'lg:col-span-2' : ''}>
          <TopSell />
        </div>
      </section>

      {hasPermissionDashboard && (
        <>
          {/* Goals + sales by user */}
          <section className={`grid grid-cols-1 gap-4 ${canManageGoals ? 'lg:grid-cols-3' : ''}`}>
            {canManageGoals && <GeneralGoals />}
            <div className={canManageGoals ? 'lg:col-span-2' : ''}>
              <SalesByUser />
            </div>
          </section>

          {/* Sales chart */}
          <section className='bg-card shadow-md rounded-lg p-3 sm:p-5 min-w-0'>
            <div className='overflow-x-auto'>
              <Tabs
                onChange={onchange}
                type='card'
                items={DataTabs}
                size='small'
                className='min-w-0'
              />
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export { Home }
