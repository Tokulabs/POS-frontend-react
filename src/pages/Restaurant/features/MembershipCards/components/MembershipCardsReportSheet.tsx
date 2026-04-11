import { FC, useState } from 'react'
import moment from 'moment'
import {
  IconCards,
  IconRubberStamp,
  IconTrophy,
  IconChartBar,
  IconDownload,
  IconUser,
  IconPhone,
} from '@tabler/icons-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useMembershipCardsReport } from '@/hooks/restaurant/useMembershipCardsReport'
import { restaurantMembershipCardsExportURL } from '@/utils/network'
import { tokenName } from '@/utils/constants'

interface Props {
  open: boolean
  onClose: () => void
}

const formatCardDate = (cardId: string) => {
  const ts = parseInt(cardId, 10)
  if (isNaN(ts)) return cardId
  return new Date(ts).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit' })
}

const downloadExcel = async (startDate: string, endDate: string) => {
  const url = new URL(restaurantMembershipCardsExportURL)
  if (startDate) url.searchParams.set('start_date', startDate)
  if (endDate) url.searchParams.set('end_date', endDate)

  const token = localStorage.getItem(tokenName)
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return

  const blob = await res.blob()
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = `fidelizacion_${moment().format('YYYY-MM-DD')}.xlsx`
  a.click()
  URL.revokeObjectURL(href)
}

const StatCard: FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string }> = ({ icon, label, value, sub }) => (
  <div className='flex items-start gap-3 bg-muted rounded-lg px-4 py-3'>
    <div className='mt-0.5 text-primary'>{icon}</div>
    <div className='flex flex-col min-w-0'>
      <span className='text-xl font-bold text-foreground'>{value}</span>
      <span className='text-xs text-muted-foreground'>{label}</span>
      {sub && <span className='text-xs text-muted-foreground'>{sub}</span>}
    </div>
  </div>
)

const MembershipCardsReportSheet: FC<Props> = ({ open, onClose }) => {
  const today = moment().format('YYYY-MM-DD')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { isLoading, summary, cards } = useMembershipCardsReport({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    enabled: open,
  })

  const dateLabel = !startDate && !endDate
    ? 'Todas las fechas'
    : startDate === endDate
    ? startDate
    : `${startDate} — ${endDate}`

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className='w-full sm:max-w-2xl overflow-y-auto flex flex-col gap-6'>
        <SheetHeader>
          <div className='flex items-center justify-between pr-6'>
            <SheetTitle>Reporte de Fidelización</SheetTitle>
            <Button
              size='sm'
              variant='outline'
              className='gap-1.5'
              onClick={() => downloadExcel(startDate, endDate)}
              disabled={cards.length === 0}
            >
              <IconDownload size={14} />
              Exportar Excel
            </Button>
          </div>
        </SheetHeader>

        {/* Date filter */}
        <div className='flex items-center gap-3'>
          <DateRangePicker
            startDate={startDate || today}
            endDate={endDate || today}
            onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
          />
          {(startDate || endDate) && (
            <Button variant='ghost' size='sm' onClick={() => { setStartDate(''); setEndDate('') }}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Summary stats */}
        {isLoading ? (
          <div className='grid grid-cols-2 gap-3'>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-16 rounded-lg' />)}
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            <StatCard icon={<IconCards size={18} />} label='Total tarjetas' value={summary?.total_cards ?? 0} sub={dateLabel} />
            <StatCard icon={<IconTrophy size={18} />} label='Tarjetas completas' value={summary?.completed_cards ?? 0} sub={`${summary?.total_cards ? Math.round((summary.completed_cards / summary.total_cards) * 100) : 0}% del total`} />
            <StatCard icon={<IconRubberStamp size={18} />} label='Sellos entregados' value={summary?.total_stamps_given ?? 0} />
            <StatCard icon={<IconChartBar size={18} />} label='Progreso promedio' value={`${summary?.avg_progress ?? 0}%`} />
          </div>
        )}

        {/* Cards table */}
        <div className='flex flex-col gap-2'>
          <h3 className='text-sm font-semibold text-foreground'>
            Detalle de tarjetas{cards.length > 0 ? ` (${cards.length})` : ''}
          </h3>

          {isLoading ? (
            <div className='flex flex-col gap-2'>
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className='h-14 rounded-lg' />)}
            </div>
          ) : cards.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-8'>No hay tarjetas en este período.</p>
          ) : (
            <div className='rounded-lg border border-border overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-muted text-muted-foreground text-xs'>
                    <th className='text-left px-3 py-2 font-medium'>ID</th>
                    <th className='text-left px-3 py-2 font-medium'>Cliente</th>
                    <th className='text-left px-3 py-2 font-medium'>Celular</th>
                    <th className='text-center px-3 py-2 font-medium'>Sellos</th>
                    <th className='text-center px-3 py-2 font-medium'>Progreso</th>
                    <th className='text-center px-3 py-2 font-medium'>Estado</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {cards.map((card) => {
                    const progress = Math.round((card.stamps / card.max_stamps) * 100)
                    const isComplete = card.stamps >= card.max_stamps
                    const name = card.customer_name ?? card.client_name
                    const phone = card.customer_phone ?? card.phone
                    return (
                      <tr key={card.id} className='hover:bg-muted/50 transition-colors'>
                        <td className='px-3 py-2.5 font-mono text-xs text-muted-foreground'>
                          {card.card_id}
                        </td>
                        <td className='px-3 py-2.5'>
                          <div className='flex items-center gap-1.5'>
                            {card.customer && <IconUser size={12} className='text-primary shrink-0' />}
                            <span className='font-medium truncate max-w-[120px]'>{name}</span>
                          </div>
                        </td>
                        <td className='px-3 py-2.5 text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <IconPhone size={11} />
                            {phone}
                          </div>
                        </td>
                        <td className='px-3 py-2.5 text-center'>
                          {card.stamps} / {card.max_stamps}
                        </td>
                        <td className='px-3 py-2.5'>
                          <div className='flex items-center gap-2'>
                            <div className='flex-1 bg-border rounded-full h-1.5 min-w-[60px]'>
                              <div
                                className={`h-1.5 rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className='text-xs text-muted-foreground w-8 text-right'>{progress}%</span>
                          </div>
                        </td>
                        <td className='px-3 py-2.5 text-center'>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isComplete
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {isComplete ? 'Completa' : 'En progreso'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MembershipCardsReportSheet }
