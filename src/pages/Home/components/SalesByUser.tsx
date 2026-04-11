import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useSummaryByUser } from '@/hooks/useSummaryData'
import moment from 'moment'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { useEffect, useRef, useState } from 'react'
import { useHasPermission } from '@/hooks/useHasPermission'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { IconUsers, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

const SCROLL_STEP = 240

const SalesByUser = () => {
  const today = moment().format('YYYY-MM-DD')
  const [date, setDate] = useState<string>(today)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { isLoading, summaryByUser } = useSummaryByUser('summaryByUser', {
    start_date: date,
    end_date: date,
  })

  const hasPermissionToSeeData = useHasPermission('can_view_dashboard_reports')
  const canChangeDates = useHasPermission('can_change_dashboard_dates')

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateArrows()
  }, [summaryByUser])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_STEP : SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <section className='bg-card rounded-lg shadow-md flex flex-col gap-5 p-5 w-full'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <IconUsers size={18} className='text-green-1' />
          <span className='font-semibold text-sm'>Ventas por usuario</span>
        </div>
        {hasPermissionToSeeData && (
          {canChangeDates && <DatePicker date={date} onChange={setDate} />}
        )}
      </div>

      {/* Users */}
      {isLoading ? (
        <div className='flex gap-4 overflow-x-auto scrollbar-hide pb-1'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex flex-col items-center gap-3 min-w-44 shrink-0 p-4 rounded-xl border border-border'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-28 w-28 rounded-full' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          ))}
        </div>
      ) : (
        <div className='relative flex items-center'>
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className='absolute left-0 z-10 h-7 w-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all'
            >
              <IconChevronLeft size={16} />
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className='w-full overflow-x-auto scrollbar-hide'
          >
            <div className='flex gap-4 pb-1'>
              {summaryByUser
                ?.sort((a, b) => (a.total_invoice < b.total_invoice ? 1 : -1))
                .map((item) => {
                  const percentage =
                    (item.total_invoice * 100) /
                    (item.sale_by__daily_goal > 0 ? item.sale_by__daily_goal : 1000000)
                  const color =
                    percentage < 50 ? '#E62C37' : percentage >= 100 ? '#269962' : '#007bff'
                  return (
                    <div
                      key={item.sale_by__id}
                      className='flex flex-col items-center gap-3 min-w-44 shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm'
                    >
                      <span
                        className='font-semibold text-sm text-center truncate w-full'
                        style={{ color }}
                      >
                        {item.sale_by__fullname}
                      </span>
                      <div className='w-28 h-28'>
                        <CircularProgressbar
                          value={percentage}
                          text={`${percentage.toFixed(1)}%`}
                          circleRatio={0.75}
                          styles={buildStyles({
                            rotation: 1 / 2 + 1 / 8,
                            strokeLinecap: 'butt',
                            trailColor: '#eee',
                            pathColor: color,
                            textColor: color,
                          })}
                        />
                      </div>
                      <div className='text-center'>
                        <p className='m-0 text-sm font-bold'>
                          {formatNumberToColombianPesos(item.total_invoice)}
                        </p>
                        <span className='text-xs text-muted-foreground'>Ventas del día</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className='absolute right-0 z-10 h-7 w-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all'
            >
              <IconChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export { SalesByUser }
