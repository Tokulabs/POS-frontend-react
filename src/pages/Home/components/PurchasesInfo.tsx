import { useState } from 'react'
import { formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
import { usePurchaseSummary } from '@/hooks/useSummaryData'
import moment from 'moment'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useFeatureFlag } from '@/hooks/useSubscription'
import {
  IconShoppingCart,
  IconGift,
  IconCurrencyDollar,
  IconPackage,
  IconTrendingUp,
  IconCoin,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import AnimatedNumber from './AnimatedNumber'

const PurchasesInfo = () => {
  const today = moment().format('YYYY-MM-DD')
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)

  const [showTips, setShowTips] = useState(false)

  const canViewPurchases = useFeatureFlag('can_view_purchases')
  const { purchaseSummary, isLoading } = usePurchaseSummary(
    'purchaseSummary',
    { start_date: startDate, end_date: endDate },
    canViewPurchases,
  )
  const showCurrency = false

  const hasPermissionToSeeData = useHasPermission('can_view_dashboard_reports')
  const canChangeDates = useHasPermission('can_change_dashboard_dates')

  const dateLabel = startDate === endDate ? startDate : `${startDate} — ${endDate}`

  return (
    <div className='bg-card w-full h-full rounded-lg flex flex-col shadow-md overflow-hidden'>
      {/* Header */}
      <div className='bg-green-1 px-4 py-3 flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <IconTrendingUp size={18} className='text-white opacity-90' />
          <span className='text-white font-semibold text-sm'>Resumen de Ventas</span>
        </div>
        {hasPermissionToSeeData && (
          {canChangeDates && (
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
              className='bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white'
            />
          )}
        )}
      </div>

      {/* Hero metric */}
      <div className='px-5 pt-5 pb-4 border-b border-border'>
        {isLoading ? (
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-8 w-40' />
            <Skeleton className='h-3 w-32' />
          </div>
        ) : (
          <div className='flex items-start justify-between gap-2'>
            <div className='flex flex-col gap-1 min-w-0'>
              <span className='text-xs text-muted-foreground uppercase tracking-wider font-medium'>
                Total Ventas (COP)
              </span>
              <AnimatedNumber
                value={purchaseSummary?.selling_price ?? 0}
                format={(n) => formatNumberToColombianPesos(n, showCurrency)}
                className='font-bold text-3xl text-green-1 truncate'
              />
              <span className='text-xs text-muted-foreground'>{dateLabel}</span>
            </div>

            {(purchaseSummary?.total_tips ?? 0) > 0 && (
              <div className='flex flex-col items-end gap-1 shrink-0'>
                <button
                  onClick={() => setShowTips(v => !v)}
                  className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showTips ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                  Propinas
                </button>
                {showTips && (
                  <div className='flex items-center gap-1.5'>
                    <IconCoin size={14} className='text-green-1 shrink-0' />
                    <span className='font-bold text-sm text-green-1'>
                      {formatNumberToColombianPesos(purchaseSummary?.total_tips ?? 0, showCurrency)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary metrics */}
      <div className='px-5 py-4 grid grid-cols-2 gap-4'>
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-start gap-3'>
                <Skeleton className='h-8 w-8 rounded-md shrink-0' />
                <div className='flex flex-col gap-1.5 flex-1'>
                  <Skeleton className='h-5 w-full' />
                  <Skeleton className='h-3 w-3/4' />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className='flex items-start gap-3'>
              <div className='bg-accent rounded-md p-1.5 shrink-0'>
                <IconPackage size={16} className='text-green-1' />
              </div>
              <div className='flex flex-col min-w-0'>
                <AnimatedNumber value={purchaseSummary?.count ?? 0} className='font-bold text-lg truncate' />
                <span className='text-xs text-muted-foreground'>Productos vendidos</span>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='bg-accent rounded-md p-1.5 shrink-0'>
                <IconGift size={16} className='text-green-1' />
              </div>
              <div className='flex flex-col min-w-0'>
                <AnimatedNumber
                  value={purchaseSummary?.selling_price_gifts ?? 0}
                  format={(n) => formatNumberToColombianPesos(n, showCurrency)}
                  className='font-bold text-lg truncate'
                />
                <span className='text-xs text-muted-foreground'>Valor regalos</span>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='bg-accent rounded-md p-1.5 shrink-0'>
                <IconShoppingCart size={16} className='text-green-1' />
              </div>
              <div className='flex flex-col min-w-0'>
                <AnimatedNumber value={purchaseSummary?.gift_count ?? 0} className='font-bold text-lg truncate' />
                <span className='text-xs text-muted-foreground'>Cantidad regalos</span>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='bg-accent rounded-md p-1.5 shrink-0'>
                <IconCurrencyDollar size={16} className='text-green-1' />
              </div>
              <div className='flex flex-col min-w-0'>
                <AnimatedNumber
                  value={purchaseSummary?.price_dolar ?? 0}
                  format={(n) => formatToUsd(n, showCurrency)}
                  className='font-bold text-lg truncate'
                />
                <span className='text-xs text-muted-foreground'>Venta USD</span>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}

export default PurchasesInfo
