import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Calendar } from './calendar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IconCalendar } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: string
  onChange: (date: string) => void
  className?: string
  align?: 'start' | 'center' | 'end'
}

const parseLocal = (d: string) => new Date(`${d}T12:00:00`)

export const DatePicker = ({
  date,
  onChange,
  className,
  align = 'end',
}: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Date | undefined>(parseLocal(date))

  const handleOpenChange = (next: boolean) => {
    if (next) setSelected(parseLocal(date))
    setOpen(next)
  }

  const handleSelect = (d: Date | undefined) => {
    if (!d) return
    setSelected(d)
    onChange(format(d, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('gap-1.5 text-xs h-7 font-normal', className)}
        >
          <IconCalendar size={13} />
          {date}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align={align}>
        <Calendar
          mode='single'
          selected={selected}
          onSelect={handleSelect}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
