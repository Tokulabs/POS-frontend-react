import { useEffect, useRef, useState } from 'react'
import { IconCameraOff, IconTrophy, IconChevronLeft, IconChevronRight, IconHash, IconCurrencyDollar } from '@tabler/icons-react'
import { useTopSellingProducts } from '@/hooks/useSummaryData'
import moment from 'moment'
import { useHasPermission } from '@/hooks/useHasPermission'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-range-picker'

const RANK_BG: Record<number, string> = {
  0: 'bg-[#BBA53D]',
  1: 'bg-[#A5A9B4]',
  2: 'bg-[#CD7F32]',
}

const SCROLL_STEP = 280

type SortMode = 'quantity' | 'price'

const TopSell = () => {
  const today = moment().format('YYYY-MM-DD')
  const [startDate, setStartDate] = useState<string>(today)
  const [endDate, setEndDate] = useState<string>(today)
  const [sortMode, setSortMode] = useState<SortMode>('quantity')

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { topSellingProducts, isLoading } = useTopSellingProducts('topSellingProducts', {
    start_date: startDate,
    end_date: endDate,
    sort_by: sortMode,
  })

  const hasPermissionToSeeData = useHasPermission('can_view_dashboard_reports')

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    updateArrows()
  }, [topSellingProducts])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_STEP : SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <div className='bg-card rounded-lg shadow-md flex flex-col h-full'>
      {/* Header */}
      <div className='px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <IconTrophy size={18} className='text-green-1' />
          <span className='font-semibold text-sm'>Top Productos</span>
          {/* Sort toggle */}
          <div className='flex items-center rounded-md border border-border overflow-hidden text-xs ml-1'>
            <button
              onClick={() => setSortMode('quantity')}
              className={`flex items-center gap-1 px-2 py-1 transition-colors ${sortMode === 'quantity' ? 'bg-green-1 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <IconHash size={12} />
              Cantidad
            </button>
            <button
              onClick={() => setSortMode('price')}
              className={`flex items-center gap-1 px-2 py-1 transition-colors ${sortMode === 'price' ? 'bg-green-1 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <IconCurrencyDollar size={12} />
              Precio
            </button>
          </div>
        </div>
        {hasPermissionToSeeData && (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
          />
        )}
      </div>

      {/* Products */}
      <div className='relative flex-1 flex items-center'>
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className='absolute left-1 z-10 h-7 w-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all'
          >
            <IconChevronLeft size={16} />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className='w-full overflow-x-auto scrollbar-hide px-4 py-4'
        >
          {isLoading ? (
            <div className='flex gap-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='flex flex-col gap-2 min-w-32 shrink-0'>
                  <Skeleton className='h-36 w-32 rounded-lg' />
                  <Skeleton className='h-3.5 w-28' />
                  <Skeleton className='h-3 w-16' />
                </div>
              ))}
            </div>
          ) : !topSellingProducts?.length ? (
            <p className='text-sm text-muted-foreground py-4 text-center w-full'>
              Sin datos para el período seleccionado
            </p>
          ) : (
            <div className='flex gap-4 pb-1'>
              {topSellingProducts.map((item, index) => {
                const rankBg = RANK_BG[index] ?? 'bg-green-1'
                return (
                  <article
                    key={index}
                    className='relative flex flex-col min-w-32 w-36 shrink-0 rounded-lg border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card'
                  >
                    {/* Rank badge */}
                    <span
                      className={`absolute top-2 left-2 z-10 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold shadow-md ${rankBg}`}
                    >
                      {index + 1}
                    </span>

                    {/* Image */}
                    <div className='w-full h-36 bg-muted flex items-center justify-center overflow-hidden'>
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <IconCameraOff size={32} className='text-muted-foreground opacity-50' />
                      )}
                    </div>

                    {/* Info */}
                    <div className='p-2.5 flex flex-col gap-0.5'>
                      <p className='m-0 text-xs font-semibold truncate' title={item.name}>
                        {item.name}
                      </p>
                      {sortMode === 'quantity' ? (
                        <span className='text-xs text-green-1 font-bold'>
                          {item.sum_top_ten_items} vendidos
                        </span>
                      ) : (
                        <span className='text-xs text-green-1 font-bold'>
                          ${item.total_revenue?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className='absolute right-1 z-10 h-7 w-7 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg transition-all'
          >
            <IconChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default TopSell
