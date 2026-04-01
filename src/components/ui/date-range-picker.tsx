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
  const [from, setFrom] = useState<Date | undefined>(parseLocal(startDate))
  const [awaitingEnd, setAwaitingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | undefined>()

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setFrom(parseLocal(startDate))
      setAwaitingEnd(false)
      setHoverDate(undefined)
    }
    setOpen(next)
  }

  const handleDayClick = (day: Date) => {
    if (!awaitingEnd) {
      setFrom(day)
      setAwaitingEnd(true)
    } else {
      const [finalFrom, finalTo] = from! <= day ? [from!, day] : [day, from!]
      setAwaitingEnd(false)
      setHoverDate(undefined)
      onChange(format(finalFrom, 'yyyy-MM-dd'), format(finalTo, 'yyyy-MM-dd'))
      setTimeout(() => setOpen(false), 150)
    }
  }

  // Live preview while hovering for the end date
  const displayRange: DateRange | undefined = (() => {
    if (!awaitingEnd || !from) return { from: parseLocal(startDate), to: parseLocal(endDate) }
    if (!hoverDate) return { from, to: undefined }
    return from <= hoverDate ? { from, to: hoverDate } : { from: hoverDate, to: from }
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
          onDayClick={handleDayClick}
          onDayMouseEnter={(day) => awaitingEnd && setHoverDate(day)}
          onDayMouseLeave={() => setHoverDate(undefined)}
          numberOfMonths={2}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
