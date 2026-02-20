import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postDianResolution } from '../helpers/services'
import { toast } from 'sonner'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formSchema } from '../helpers/validations'
import { Button } from '@/components/ui/button'
import moment from 'moment'
import { DateRangePicker } from '@/components/FormComponents/DateRange'
import { cn } from '@/lib/utils'
import { ChevronsUpDown, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { IconDeviceIpadPlus, IconPlus } from '@tabler/icons-react'

interface CreateResolutionProps {
  isVisible: boolean
  onOpenChange: (value: boolean) => void
}

const resolutionType = [
  { label: 'Res. Factura Electrónica', value: 'ElectronicInvoice' },
  { label: 'Res. Factura de Venta POS', value: 'POS' },
] as const

const CreateResolutionForm: FC<CreateResolutionProps> = ({ isVisible = false, onOpenChange }) => {
  const queryClient = useQueryClient()

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postDianResolution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardDianPOS'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardDianFE'] })
      toast.success('Resolución Creada!')
      form.reset()
      onOpenChange(false)
    },
  })

  type FormValues = z.infer<typeof formSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolutionNumber: '',
      fromNumber: '',
      toNumber: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      type: 'POS',
      prefix: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const formatDates = {
      from: moment(values.dateRange.from).format('YYYY-MM-DD'),
      to: moment(values.dateRange.to).format('YYYY-MM-DD'),
    }

    const payload = {
      document_number: values.resolutionNumber,
      from_date: formatDates.from,
      to_date: formatDates.to,
      from_number: parseInt(values.fromNumber, 10),
      to_number: parseInt(values.toNumber, 10),
      prefix: values.prefix,
      type: values.type,
    }
    mutate(payload)
  }

  return (
    <DialogContainer
      title='Crear Resolucion de la DIAN'
      open={isVisible}
      onOpenChange={(value) => {
        onOpenChange(value)
        form.reset()
      }}
      triggerTitle={
        <span className='flex gap-2 items-center'>
          <IconDeviceIpadPlus /> Nueva Resolución
        </span>
      }
      triggerClassName='border w-[300px] hover:border-green-1'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='prefix'
              render={() => (
                <FormItem className='w-1/4'>
                  <FormLabel htmlFor='prefix'>
                    Prefijo <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input id='prefix' {...form.register('prefix')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='resolutionNumber'
              render={() => (
                <FormItem className='w-3/4'>
                  <FormLabel htmlFor='resolutionNumber'>
                    Número de Resolución <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input id='resolutionNumber' {...form.register('resolutionNumber')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex gap-4 w-full'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='w-full space-y-2'>
                  <FormLabel>
                    Tipo de resolución <span className='text-red-1'>*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                            'border-gray-1 border border-solid rounded-md p-3 outline-hidden focus-visible:ring-0',
                          )}
                        >
                          <span className='truncate'>
                            {field.value
                              ? resolutionType.find((doc) => doc.value === field.value)?.label
                              : 'Seleccionar'}
                          </span>
                          <ChevronsUpDown className='opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[200px] p-0'>
                      <Command>
                        <CommandInput
                          placeholder='Buscar tipo'
                          className='h-9 border-gray-1 border border-solid rounded-md p-3 outline-hidden focus-visible:ring-0'
                        />
                        <CommandList>
                          <CommandEmpty>No encontrado</CommandEmpty>
                          <CommandGroup>
                            {resolutionType.map((doc) => (
                              <CommandItem
                                value={doc.label}
                                key={doc.value}
                                onSelect={() => {
                                  form.setValue('type', doc.value)
                                }}
                              >
                                {doc.label}
                                <Check
                                  className={cn(
                                    'ml-auto',
                                    doc.value === field.value ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dateRange'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>
                    Fechas de resolución <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <DateRangePicker
                      value={field.value}
                      onChange={field.onChange}
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.dateRange?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <div className='w-full flex gap-4'>
            <FormField
              control={form.control}
              name='fromNumber'
              render={() => (
                <FormItem className='w-full'>
                  <FormLabel htmlFor='fromNumber'>
                    Habilita desde <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input id='fromNumber' {...form.register('fromNumber')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='toNumber'
              render={() => (
                <FormItem className='w-full'>
                  <FormLabel htmlFor='toNumber'>
                    Habilita hasta <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input id='toNumber' {...form.register('toNumber')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <Button
              type='submit'
              className='bg-green-1 hover:bg-card hover:text-green-1 hover:border-green-1 hover:border'
              disabled={isLoading}
            >
              <IconPlus /> Crear resolución
            </Button>
          </FormItem>
        </form>
      </Form>
    </DialogContainer>
  )
}

export { CreateResolutionForm }
