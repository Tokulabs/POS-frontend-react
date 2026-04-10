import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupplierById, postSuppliers, putSuppliers, toggleActiveSupplier } from '../helpers/services'
import { useSupplierMonthlyTrend } from '@/hooks/useSupplierReport'
import { SalesChart } from '@/components/Charts/SalesChart'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popconfirm } from 'antd'
import { IconPower } from '@tabler/icons-react'

const supplierSchema = z.object({
  name: z.string().min(1, 'Campo obligatorio'),
  legal_name: z.string().min(1, 'Campo obligatorio'),
  nit: z.string().min(1, 'Campo obligatorio'),
  phone: z.string().optional(),
  email: z.string().email('Correo inválido').min(1, 'Campo requerido'),
  bank_account: z.string().min(1, 'Campo requerido'),
  account_type: z.string().min(1, 'Campo requerido'),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface ISupplierDetailSheetProps {
  supplierId: number | null
  open: boolean
  onClose: () => void
}

const SupplierDetailSheet: FC<ISupplierDetailSheetProps> = ({ supplierId, open, onClose }) => {
  const isEdit = !!supplierId
  const queryClient = useQueryClient()

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      legal_name: '',
      nit: '',
      phone: '',
      email: '',
      bank_account: '',
      account_type: '',
    },
  })

  const { data: supplier, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ['supplierDetail', supplierId],
    queryFn: () => getSupplierById(supplierId!),
    enabled: isEdit,
  })

  const { trendData } = useSupplierMonthlyTrend(supplierId)

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name ?? '',
        legal_name: supplier.legal_name ?? '',
        nit: supplier.nit ?? '',
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        bank_account: supplier.bank_account ?? '',
        account_type: supplier.account_type ?? '',
      })
    } else if (!isEdit) {
      form.reset({
        name: '',
        legal_name: '',
        nit: '',
        phone: '',
        email: '',
        bank_account: '',
        account_type: '',
      })
    }
  }, [supplier, isEdit, form])

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: postSuppliers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      toast.success('Proveedor creado!')
      onClose()
    },
  })

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: putSuppliers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      queryClient.invalidateQueries({ queryKey: ['supplierDetail', supplierId] })
      toast.success('Proveedor actualizado!')
      onClose()
    },
  })

  const { mutate: toggle, isPending: isToggling } = useMutation({
    mutationFn: toggleActiveSupplier,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      queryClient.invalidateQueries({ queryKey: ['supplierDetail', supplierId] })
      toast.success(`Proveedor ${res?.data.active ? 'activado' : 'desactivado'}`)
      onClose()
    },
  })

  const onSubmit = (values: SupplierFormValues) => {
    if (isEdit) {
      save({ values, id: supplierId })
    } else {
      create(values)
    }
  }

  const totalAmount = trendData?.reduce((acc, m) => acc + m.total_amount, 0) ?? 0
  const hasTrend = trendData && trendData.some((m) => m.total_amount > 0)

  const isLoading = isEdit && isLoadingSupplier
  const isBusy = isCreating || isSaving

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className='w-full sm:max-w-lg overflow-y-auto flex flex-col gap-6'>
        <SheetHeader>
          <div className='flex items-center justify-between pr-6'>
            <SheetTitle>
              {isLoading ? (
                <Skeleton className='h-5 w-40' />
              ) : isEdit ? (
                supplier?.name ?? ''
              ) : (
                'Nuevo proveedor'
              )}
            </SheetTitle>
            {isEdit && supplier && (
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className={supplier.active ? 'text-green-700 border-green-300' : 'text-zinc-400'}
                >
                  {supplier.active ? 'Activo' : 'Inactivo'}
                </Badge>
                <Popconfirm
                  title={`${supplier.active ? 'Desactivar' : 'Activar'} proveedor`}
                  description={`¿Estás seguro de ${supplier.active ? 'desactivar' : 'activar'} este proveedor?`}
                  onConfirm={() => toggle(supplierId!)}
                  okText={supplier.active ? 'Sí, desactivar' : 'Sí, activar'}
                  cancelText='Cancelar'
                >
                  <button
                    type='button'
                    className='p-0 flex items-center'
                    disabled={isToggling}
                  >
                    <IconPower
                      size={18}
                      className={supplier.active ? 'text-red-500' : 'text-green-600'}
                    />
                  </button>
                </Popconfirm>
              </div>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-9 w-full' />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Nombre <span className='text-red-500'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder='Nombre del proveedor' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='legal_name'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Razón social <span className='text-red-500'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder='Razón Social' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='nit'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>NIT <span className='text-red-500'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder='NIT del proveedor' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder='Teléfono del proveedor' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico <span className='text-red-500'>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder='Correo electrónico' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='bank_account'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Cuenta bancaria <span className='text-red-500'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder='Cuenta bancaria' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='account_type'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Tipo de cuenta <span className='text-red-500'>*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Tipo de cuenta' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='Ahorros'>Ahorros</SelectItem>
                          <SelectItem value='Corriente'>Corriente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type='submit' className='w-full' disabled={isBusy}>
                {isBusy ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proveedor'}
              </Button>
            </form>
          </Form>
        )}

        {hasTrend && (
          <div>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-sm font-medium'>
                Tendencia de compras ({new Date().getFullYear()})
              </h3>
              <span className='text-xs text-muted-foreground'>
                Total: {formatNumberToColombianPesos(totalAmount)}
              </span>
            </div>
            <SalesChart data={trendData!} dataKey='total_amount' xAxisKey='month' />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default SupplierDetailSheet
