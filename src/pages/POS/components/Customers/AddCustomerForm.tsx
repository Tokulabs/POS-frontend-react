import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FC } from 'react'
import { useCities } from '@/hooks/useCities'
import { useMutation } from '@tanstack/react-query'
import { postCustomers, putCustomersEdit } from '../../helpers/services'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { toast } from 'sonner'
import { UserDocumentTypeEnum } from '@/pages/Users/types/UserTypes'
import { IconCheck } from '@tabler/icons-react'
import { OptionSelect, SearchInputSelect } from '@/components/FormComponents/SearchInputSelect'
import { ICustomerProps } from '../types/CustomerTypes'

interface AddCustomerProps {
  setOpen: (value: boolean) => void
  isEdit?: boolean
  customerData?: ICustomerProps
}

const formSchema = z
  .object({
    isNaturalPerson: z.enum(['naturalPerson', 'legalPerson'], {
      required_error: 'Este campo es requerido',
    }),
    clientName: z.string().nonempty('Campo requerido'),
    documentType: z.enum(['CC', 'CE', 'NIT', 'TI', 'PA', 'DIE'], {
      required_error: 'Campo requerido',
    }),
    idNumber: z.string().nonempty('Campo requerido').trim(),
    email: z.string().nonempty('Campo requerido').email('El correo es inválido'),
    phone: z
      .string()
      .nonempty('Campo requerido')
      .transform((val) => val.replace(/[^\d]/g, ''))
      .pipe(
        z
          .string()
          .min(10, 'El número debe tener 10 dígitos')
          .max(10, 'El número debe tener 10 dígitos')
          .regex(
            /^(3\d{9}|(60[1-9]|6[0-9]{2})\d{7})$/,
            'Formato inválido. Ejemplos válidos: 3123456789 (móvil) o 6012345678 (fijo)',
          ),
      ),
    city: z.number().gt(0, 'Campo requerido'),
    address: z.string().nonempty('Campo requerido'),
  })
  .refine(
    (data) => {
      const { documentType, idNumber } = data

      const patterns: Record<string, RegExp> = {
        CC: /^[1-9]\d{5,9}$/,
        CE: /^[1-9]\d{5,9}$/,
        NIT: /^\d{9}$/,
        TI: /^\d{5,8}$/,
        PA: /^[A-Za-z0-9]{6,9}$/,
        DIE: /^[A-Za-z0-9]{6,12}$/,
      }
      if (!patterns[documentType]) return false

      return patterns[documentType].test(idNumber)
    },
    {
      message: 'El número de documento no es válido para el tipo seleccionado',
      path: ['idNumber'],
    },
  )

const documentTypesOptions = [
  { label: 'Cédula de ciudadania', value: 'CC' },
  { label: 'Cédula de extranjería', value: 'CE' },
  { label: 'NIT', value: 'NIT' },
  { label: 'Tarjeta de identidad', value: 'TI' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'Documento de identificación extranjero', value: 'DIE' },
] as const

export const AddCustomerForm: FC<AddCustomerProps> = ({ setOpen, isEdit = false, customerData }) => {
  const { isLoading, citiesData = [] } = useCities('citiesBySearch')
  const { updateCustomerData } = useCustomerData()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && customerData
      ? {
          isNaturalPerson: customerData.is_natural_person === false ? 'legalPerson' : 'naturalPerson',
          clientName: customerData.name || '',
          documentType: customerData.document_type || 'CC',
          idNumber: customerData.document_id || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          city: customerData.city?.id || Number(0),
          address: customerData.address || '',
        }
      : {
          isNaturalPerson: 'naturalPerson',
          clientName: '',
          documentType: 'CC',
          idNumber: '',
          email: '',
          phone: '',
          city: Number(0),
          address: '',
        },
  })

  const { mutate: mutatePost } = useMutation({
    mutationFn: postCustomers,
    onSuccess: (data) => {
      if (!data) return
      updateCustomerData({
        ...data,
        id: data?.id as number,
        idNumber: data?.document_id,
        documentType: data?.document_type as UserDocumentTypeEnum,
        city: data?.city.name || '',
      })
      toast.success(
        <span className='flex items-center gap-2 font-semibold'>
          <IconCheck className='text-green-1' /> El cliente
          <span className='font-bold'>{data.name}</span> ha sido creado exitosamente
        </span>,
      )
      setOpen(false)
    },
  })

  const { mutate: mutatePut } = useMutation({
    mutationFn: putCustomersEdit,
    onSuccess: (data) => {
      if (!data) return
      updateCustomerData({
        ...data,
        id: data?.id as number,
        idNumber: data?.document_id,
        documentType: data?.document_type as UserDocumentTypeEnum,
        city: data?.city.name || '',
      })
      toast.success(
        <span className='flex items-center gap-2 font-semibold'>
          <IconCheck className='text-green-1' /> El cliente
          <span className='font-bold'>{data.name}</span> ha sido actualizado exitosamente
        </span>,
      )
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      name: values.clientName,
      email: values.email,
      document_id: values.idNumber,
      document_type: values.documentType,
      phone: values.phone,
      address: values.address,
      city_id: values.city,
      is_natural_person: values.isNaturalPerson === 'naturalPerson',
    }

    if (isEdit && customerData?.id) {
      mutatePut({ values: payload, id: customerData.id })
    } else {
      mutatePost(payload)
    }
  }

  return (
    <section className='flex flex-col gap-3'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col w-full gap-3'>
          <FormField
            control={form.control}
            name='isNaturalPerson'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value} // <- Asegura que refleje el valor actual
                    className='flex justify-center w-full gap-4 p-2 rounded-lg'
                  >
                    <FormItem className='w-1/2'>
                      <FormControl>
                        <RadioGroupItem
                          value='naturalPerson'
                          id='naturalPerson'
                          className='hidden peer'
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor='naturalPerson'
                        className='block w-full px-6 py-3 font-medium text-center transition-all bg-card border border-border rounded-lg shadow-sm cursor-pointer text-green-1 hover:bg-secondary peer-aria-checked:bg-green-1 peer-aria-checked:text-white peer-aria-checked:border-solid peer-aria-checked::border-1 peer-aria-checked:border-green-1 peer-aria-checked:shadow-lg'
                      >
                        Persona Natural
                      </FormLabel>
                    </FormItem>
                    <FormItem className='w-1/2'>
                      <FormControl>
                        <RadioGroupItem
                          value='legalPerson'
                          id='legalPerson'
                          className='hidden peer'
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor='legalPerson'
                        className='block w-full px-6 py-3 font-medium text-center transition-all bg-card border border-border rounded-lg shadow-sm cursor-pointer text-green-1 hover:bg-secondary peer-aria-checked:bg-green-1 peer-aria-checked:text-white peer-aria-checked:border-solid peer-aria-checked::border-1 peer-aria-checked:border-green-1 peer-aria-checked:shadow-lg'
                      >
                        Persona Jurídica
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-center w-full gap-3'>
            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof formSchema>, 'documentType'>
                  label='Documento'
                  className='flex flex-col justify-start w-1/2'
                  options={documentTypesOptions.map((item) => {
                    const option: OptionSelect = {
                      label: item.label,
                      value: item.value,
                    }
                    return option
                  })}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name='idNumber'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <FormLabel>
                    Número de documento <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Numero de documento'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='clientName'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>
                  Nombre del Cliente <span className='text-red-1'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Nombre completo'
                    {...field}
                    className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-center w-full gap-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <FormLabel>
                    Correo electrónico <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Correo Electrónico'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <FormLabel>
                    Teléfono <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Teléfono'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex justify-center w-full gap-3'>
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof formSchema>, 'city'>
                  label='Ciudad'
                  className='w-1/2'
                  options={citiesData.map((item) => {
                    const option: OptionSelect = {
                      label: item.name,
                      value: item.id,
                    }
                    return option
                  })}
                  isLoading={isLoading}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <FormLabel>
                    Dirección <span className='text-red-1'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Dirección'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type='submit'
            className='flex items-center justify-center w-full p-3 mt-3 text-white border-solid rounded-md cursor-pointer bg-green-1 border-1 border-green-1 hover:bg-card hover:text-green-1 focus-visible:ring-0'
          >
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </form>
      </Form>
    </section>
  )
}
