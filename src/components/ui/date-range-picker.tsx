import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Calendar } from './calendar'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IconCalendar } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
  className?: string
  align?: 'start' | 'center' | 'end'
}

const parseLocal = (d: string) => new Date(`${d}T12:00:00`)

export const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  className,
  align = 'end',
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseLocal(startDate),
    to: parseLocal(endDate),
  })
  const [awaitingEnd, setAwaitingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | undefined>()

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setRange({ from: parseLocal(startDate), to: parseLocal(endDate) })
      setAwaitingEnd(false)
      setHoverDate(undefined)
    }
    setOpen(next)
  }

  const handleSelect = (selected: DateRange | undefined) => {
    if (!awaitingEnd) {
      // Phase 1 — lock in the start date
      const from = selected?.from ?? selected?.to
      if (!from) return
      setRange({ from, to: undefined })
      setAwaitingEnd(true)
    } else {
      // Phase 2 — lock in the end date
      const from = range?.from
      const raw = selected?.to ?? selected?.from
      if (!from || !raw) return

      const [finalFrom, finalTo] = from <= raw ? [from, raw] : [raw, from]
      setRange({ from: finalFrom, to: finalTo })
      setAwaitingEnd(false)
      setHoverDate(undefined)
      onChange(format(finalFrom, 'yyyy-MM-dd'), format(finalTo, 'yyyy-MM-dd'))
      setTimeout(() => setOpen(false), 150)
    }
  }

  // While waiting for the end date, build a live preview range driven by the
  // hovered day so the user sees the potential selection as they move the cursor.
  const displayRange: DateRange | undefined = (() => {
    if (!awaitingEnd || !range?.from || !hoverDate) return range
    return range.from <= hoverDate
      ? { from: range.from, to: hoverDate }
      : { from: hoverDate, to: range.from }
  })()

  const label = startDate === endDate ? startDate : `${startDate}  →  ${endDate}`

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('gap-1.5 text-xs h-7 font-normal', className)}
        >
          <IconCalendar size={13} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align={align}>
        {awaitingEnd && (
          <p className='text-xs text-muted-foreground text-center pt-3 -mb-1'>
            Selecciona la fecha final
          </p>
        )}
        <Calendar
          mode='range'
          selected={displayRange}
          onSelect={handleSelect}
          onDayMouseEnter={(day) => awaitingEnd && setHoverDate(day)}
          onDayMouseLeave={() => setHoverDate(undefined)}
          numberOfMonths={2}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
