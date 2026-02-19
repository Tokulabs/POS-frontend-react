import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HTMLAttributes } from 'react'

interface DateRangePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: { from?: Date | undefined; to?: Date | undefined }
  onChange?: (dateRange: DateRange | undefined) => void
}

export const DateRangePicker = ({ className, value, onChange }: DateRangePickerProps) => {
  return (
    <div className={cn('mt-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                </>
              ) : (
                format(value.from, 'LLL dd, y')
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            autoFocus
            mode='range'
            defaultMonth={new Date()}
            selected={value as DateRange}
            onSelect={onChange}
            numberOfMonths={2}
            classNames={{
              today: 'bg-green-1 opacity-50 text-white',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
