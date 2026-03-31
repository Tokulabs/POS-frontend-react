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
          'flex justify-center pt-1 relative items-center',
          props.captionLayout?.includes('dropdown') ? 'h-10' : 'h-8',
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          'text-sm font-medium',
          props.captionLayout?.includes('dropdown') && 'sr-only',
        ),
        dropdowns: cn('flex items-center gap-1.5', defaultClassNames.dropdowns),
        dropdown: cn(
          defaultClassNames.dropdown,
          'h-8 rounded-md border border-input bg-background px-2 py-1 text-sm font-medium',
          'cursor-pointer transition-colors hover:bg-secondary hover:text-secondary-foreground',
          'focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-1',
        ),
        nav: cn(
          'flex items-center gap-1 absolute inset-x-0 top-0 justify-between z-10',
          props.captionLayout?.includes('dropdown') ? 'px-1 top-1' : '',
        ),
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 opacity-60 hover:opacity-100 relative z-10',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-7 w-7 p-0 opacity-60 hover:opacity-100 relative z-10',
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
          defaultClassNames.weekday,
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        // Range row: tint the cell background with the accent green, not zinc
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          '[&:has([aria-selected])]:bg-accent',
          '[&:has([aria-selected].day-outside)]:bg-accent/40',
          'dark:[&:has([aria-selected])]:bg-accent',
          'dark:[&:has([aria-selected].day-outside)]:bg-accent/30',
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
        // Use brand green for selected (start/end) instead of black
        selected: cn(
          'bg-primary text-primary-foreground',
          'hover:bg-primary hover:text-primary-foreground',
          'focus:bg-primary focus:text-primary-foreground',
          defaultClassNames.selected,
        ),
        // Today: subtle ring — but ONLY when it is not an outside day
        // (.day-outside is applied by the `outside` classname below)
        today: '[&:not(.day-outside)]:ring-1 [&:not(.day-outside)]:ring-primary/70 [&:not(.day-outside)]:rounded-md font-semibold',
        // Outside days: muted text; keep subtle range tint when inside a selection
        outside: cn(
          'day-outside text-muted-foreground opacity-50',
          'aria-selected:opacity-70 aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn('text-muted-foreground opacity-30', defaultClassNames.disabled),
        // Range middle: use the accent green tint
        range_middle: cn(
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
          'dark:aria-selected:bg-accent dark:aria-selected:text-accent-foreground',
          defaultClassNames.range_middle,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === 'left') return <ChevronLeft className='h-4 w-4' />
          return <ChevronRight className='h-4 w-4' />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
