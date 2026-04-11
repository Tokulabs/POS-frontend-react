import { FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { debounce } from 'lodash'
import { IconSearch, IconUserCheck, IconX } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreateMembershipCardPayload } from '@/hooks/restaurant/useMembershipCards'
import { getCustomers } from '@/pages/POS/helpers/services'
import { ICustomerProps } from '@/pages/POS/components/types/CustomerTypes'

const schema = z.object({
  client_name: z.string().min(1, 'El nombre es requerido'),
  phone: z
    .string()
    .min(1, 'El celular es requerido')
    .transform((v) => v.replace(/[\s\-().]/g, ''))
    .pipe(z.string().regex(/^3\d{9}$/, 'Debe ser un celular colombiano válido (10 dígitos, empieza por 3)')),
  max_stamps: z.coerce.number().min(1, 'Mínimo 1 sello').max(20, 'Máximo 20 sellos'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  isPending: boolean
  onSubmit: (values: CreateMembershipCardPayload) => void
  onCancel: () => void
}

const CreateMembershipCardModal: FC<Props> = ({ open, isPending, onSubmit, onCancel }) => {
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerResults, setCustomerResults] = useState<ICustomerProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomerProps | null>(null)
  const [showResults, setShowResults] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { client_name: '', phone: '', max_stamps: 10 },
  })

  const debouncedSearch = useRef(
    debounce(async (keyword: string) => {
      if (!keyword.trim()) { setCustomerResults([]); setShowResults(false); return }
      setIsSearching(true)
      try {
        const data = await getCustomers({ keyword, page: 1 })
        setCustomerResults(data?.results ?? [])
        setShowResults(true)
      } finally {
        setIsSearching(false)
      }
    }, 400),
  ).current

  useEffect(() => {
    if (open) {
      form.reset({ client_name: '', phone: '', max_stamps: 10 })
      setCustomerSearch('')
      setCustomerResults([])
      setSelectedCustomer(null)
      setShowResults(false)
    }
    return () => { debouncedSearch.cancel() }
  }, [open])

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearch(value)
    if (selectedCustomer) {
      setSelectedCustomer(null)
      form.setValue('client_name', '')
      form.setValue('phone', '')
    }
    debouncedSearch(value)
  }

  const handleSelectCustomer = (customer: ICustomerProps) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name)
    setShowResults(false)
    form.setValue('client_name', customer.name)
    form.setValue('phone', customer.phone ?? '')
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setCustomerSearch('')
    setCustomerResults([])
    form.setValue('client_name', '')
    form.setValue('phone', '')
  }

  const handleSubmit = (values: FormValues) => {
    onSubmit({ ...values, customer_id: selectedCustomer?.id ?? null })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Nueva tarjeta de fidelización</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4 py-2'>

            {/* Customer search */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium'>
                Cliente <span className='text-muted-foreground font-normal'>(opcional)</span>
              </label>
              <div className='relative'>
                <IconSearch size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre o documento...'
                  value={customerSearch}
                  onChange={(e) => handleCustomerSearchChange(e.target.value)}
                  className='pl-8 pr-8'
                />
                {(selectedCustomer || customerSearch) && (
                  <button
                    type='button'
                    onClick={handleClearCustomer}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>

              {/* Selected badge */}
              {selectedCustomer && (
                <div className='flex items-center gap-1.5 text-xs text-primary'>
                  <IconUserCheck size={13} />
                  <span className='font-medium'>{selectedCustomer.name}</span>
                  {selectedCustomer.phone && <span className='text-muted-foreground'>· {selectedCustomer.phone}</span>}
                </div>
              )}

              {/* Dropdown results */}
              {showResults && !selectedCustomer && (
                <div className='flex flex-col gap-1 border border-border rounded-lg overflow-hidden bg-popover shadow-md max-h-40 overflow-y-auto'>
                  {isSearching ? (
                    <p className='text-xs text-muted-foreground text-center py-3'>Buscando...</p>
                  ) : customerResults.length === 0 ? (
                    <p className='text-xs text-muted-foreground text-center py-3'>Sin resultados</p>
                  ) : (
                    customerResults.map((c) => (
                      <button
                        key={c.id}
                        type='button'
                        className='flex flex-col px-3 py-2 text-left hover:bg-accent text-sm transition-colors'
                        onClick={() => handleSelectCustomer(c)}
                      >
                        <span className='font-medium'>{c.name}</span>
                        <span className='text-xs text-muted-foreground'>
                          {c.document_type} {c.document_id}{c.phone ? ` · ${c.phone}` : ''}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name='client_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Juan Pérez' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: 3001234567' type='tel' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='max_stamps'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Total de sellos{' '}
                    <span className='text-muted-foreground font-normal'>(para completar)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' min={1} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear tarjeta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateMembershipCardModal }
