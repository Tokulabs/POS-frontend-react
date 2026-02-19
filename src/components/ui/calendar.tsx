import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ComponentProps } from 'react'

export type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: cn('flex flex-col sm:flex-row gap-4', defaultClassNames.months),
        month: cn('flex flex-col gap-4', defaultClassNames.month),
        month_caption: cn(
          'flex justify-center pt-1 relative items-center h-8',
          defaultClassNames.month_caption,
        ),
        caption_label: cn('text-sm font-medium', defaultClassNames.caption_label),
        nav: cn(
          'flex items-center gap-1 absolute inset-x-0 top-0 justify-between w-full',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_next,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-zinc-500 rounded-md w-8 font-normal text-[0.8rem] dark:text-zinc-400',
          defaultClassNames.weekday,
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-100 [&:has([aria-selected].day-outside)]:bg-zinc-100/50 dark:[&:has([aria-selected])]:bg-zinc-800 dark:[&:has([aria-selected].day-outside)]:bg-zinc-800/50',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md',
          defaultClassNames.day,
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
          defaultClassNames.day_button,
        ),
        range_start: cn('day-range-start rounded-l-md', defaultClassNames.range_start),
        range_end: cn('day-range-end rounded-r-md', defaultClassNames.range_end),
        selected: cn(
          'bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50 focus:bg-zinc-900 focus:text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900 dark:focus:bg-zinc-50 dark:focus:text-zinc-900',
          defaultClassNames.selected,
        ),
        today: cn(
          'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50',
          defaultClassNames.today,
        ),
        outside: cn(
          'day-outside text-zinc-500 aria-selected:bg-zinc-100/50 aria-selected:text-zinc-500 dark:text-zinc-400 dark:aria-selected:bg-zinc-800/50 dark:aria-selected:text-zinc-400',
          defaultClassNames.outside,
        ),
        disabled: cn('text-zinc-500 opacity-50 dark:text-zinc-400', defaultClassNames.disabled),
        range_middle: cn(
          'aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50',
          defaultClassNames.range_middle,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className='h-4 w-4' />
          }
          return <ChevronRight className='h-4 w-4' />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
