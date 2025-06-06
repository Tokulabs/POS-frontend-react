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
import { postCustomers } from '../../helpers/services'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { toast } from 'sonner'
import { UserDocumentTypeEnum } from '@/pages/Users/types/UserTypes'
import { IconCheck } from '@tabler/icons-react'
import { OptionSelect, SearchInputSelect } from '@/components/FormComponents/SearchInputSelect'

interface AddCustomerProps {
  setOpen: (value: boolean) => void
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

export const AddCustomerForm: FC<AddCustomerProps> = ({ setOpen }) => {
  const { isLoading, citiesData = [] } = useCities('citiesBySearch')
  const { updateCustomerData } = useCustomerData()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        <span className='flex items-center  gap-2 font-semibold'>
          <IconCheck className='text-green-1' /> El cliente
          <span className='font-bold'>{data.name}</span> ha sido creado exitosamente
        </span>,
      )
      setOpen(false)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutatePost({
      name: values.clientName,
      email: values.email,
      document_id: values.idNumber,
      document_type: values.documentType,
      phone: values.phone,
      address: values.address,
      city_id: values.city,
      is_natural_person: values.isNaturalPerson === 'naturalPerson',
    })
  }

  return (
    <section className='flex flex-col gap-3'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-3'>
          <FormField
            control={form.control}
            name='isNaturalPerson'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value} // <- Asegura que refleje el valor actual
                    className='flex w-full justify-center gap-4 rounded-lg p-2'
                  >
                    <FormItem className='w-1/2'>
                      <FormControl>
                        <RadioGroupItem
                          value='naturalPerson'
                          id='naturalPerson'
                          className='peer hidden'
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor='naturalPerson'
                        className='block w-full text-center cursor-pointer rounded-lg px-6 py-3 border border-gray-300 transition-all text-green-1
            bg-white font-medium shadow-sm hover:bg-gray-100 
            peer-aria-checked:bg-green-1 peer-aria-checked:text-white  peer-aria-checked:border-solid peer-aria-checked::border-1 peer-aria-checked:border-green-1 peer-aria-checked:shadow-lg'
                      >
                        Persona Natural
                      </FormLabel>
                    </FormItem>
                    <FormItem className='w-1/2'>
                      <FormControl>
                        <RadioGroupItem
                          value='legalPerson'
                          id='legalPerson'
                          className='peer hidden'
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor='legalPerson'
                        className='block w-full text-center cursor-pointer rounded-lg px-6 py-3 border border-gray-300 transition-all text-green-1
            bg-white font-medium shadow-sm hover:bg-gray-100 
            peer-aria-checked:bg-green-1 peer-aria-checked:text-white peer-aria-checked:border-solid peer-aria-checked::border-1 peer-aria-checked:border-green-1 peer-aria-checked:shadow-lg'
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

          <div className='w-full flex gap-3 justify-center'>
            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof formSchema>, 'documentType'>
                  label='Documento'
                  className='flex flex-col w-1/2 justify-start'
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
          <div className='w-full flex gap-3 justify-center'>
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
          <div className='w-full flex gap-3 justify-center'>
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
            className='mt-3 bg-green-1 flex w-full p-3 text-white border-1 border-solid border-green-1 justify-center items-center rounded-md cursor-pointer hover:bg-white hover:text-green-1 focus-visible:ring-0'
          >
            Crear
          </Button>
        </form>
      </Form>
    </section>
  )
}
