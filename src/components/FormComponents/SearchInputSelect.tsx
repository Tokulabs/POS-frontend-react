import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type OptionSelect = {
  label: string
  value: string | number
}

interface SearchInputSelectProps<T extends FieldValues, K extends Path<T>> {
  label: string
  placeholder?: string
  options: OptionSelect[]
  field: ControllerRenderProps<T, K>
  className?: string
  onkeydown?: (e: React.KeyboardEvent) => void
  isLoading?: boolean
}

export const SearchInputSelect = <T extends FieldValues, K extends Path<T>>({
  label,
  placeholder = 'Seleccionar opción',
  options,
  field,
  className,
  onkeydown,
  isLoading,
}: SearchInputSelectProps<T, K>) => {
  const [open, setOpen] = useState(false)

  return (
    <FormItem className={cn('flex flex-col gap-1 pt-1', className)}>
      <FormLabel>
        {label} <span className='text-red-1'>*</span>
      </FormLabel>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='outline'
              role='combobox'
              className={cn(
                'justify-between truncate border-gray-1 border border-solid rounded-md p-3 outline-hidden focus-visible:ring-0',
                !field.value && 'text-muted-foreground',
              )}
            >
              <span className='truncate'>
                {field.value
                  ? options.find((item) => item.value === field.value)?.label
                  : placeholder}
              </span>
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>

          <PopoverContent className='p-0' forceMount align='start' sideOffset={4}>
            <Command>
              {isLoading && (
                <div className='flex items-center justify-center h-12'>
                  <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900' />
                </div>
              )}

              <CommandInput placeholder='Búsqueda...' className='h-9' onKeyDown={onkeydown} />
              <CommandList className='overflow-y-auto max-h-60'>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {options.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.label}
                      onSelect={() => {
                        field.onChange(item.value)
                        setOpen(false)
                      }}
                    >
                      {item.label}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          item.value === field.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}
