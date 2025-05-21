import React, { useContext } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { store } from '@/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

const companySchema = z.object({
  name: z.string().nonempty('Campo requerido'),
  shortName: z.string().nonempty('Campo requerido'),
  email: z.string().email('Correo no válido'),
  documentType: z.string().nonempty('Campo requerido'),
  documentId: z.string().nonempty('Campo requerido'),
  address: z.string().nonempty('Campo requerido'),
  municipality: z.string().nonempty('Campo requerido'),
  phoneNumber: z.string().nonempty('Campo requerido'),
})

type CompanyFormValues = z.infer<typeof companySchema>

const Company: React.FC = () => {
  const { state } = useContext(store)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: state.user?.company?.name || '',
      shortName: '',
      email: state.user?.email || '',
      documentType: '',
      documentId: state.user?.company?.nit || '',
      address: '',
      municipality: '',
      phoneNumber: '',
    },
  })

  const onSubmit = (data: CompanyFormValues) => {
    console.log('Datos actualizados:', data)
  }

  return (
    <div className='w-full flex flex-col items-center'>
      <div className='w-full'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='name'>Nombre<span className='text-red-500'>*</span></Label>
                  <FormControl>
                    <Input id='name' placeholder='Nombre' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='shortName'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='shortName'>Nombre Corto</Label>
                  <FormControl>
                    <Input id='shortName' placeholder='Nombre Corto' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='documentType'>Tipo de Documento<span className='text-red-500'>*</span></Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger id='documentType'>
                        <SelectValue placeholder='Selecciona un tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='NIT'>NIT</SelectItem>
                      <SelectItem value='RUT'>RUT</SelectItem>

                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='documentId'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='documentId'>Número de Documento <span className='text-red-500'>*</span></Label>
                  <FormControl>
                    <Input id='documentId' placeholder='Número de documento' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='address'>Dirección<span className='text-red-500'>*</span></Label>
                  <FormControl>
                    <Input id='address' placeholder='Dirección' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='municipality'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='municipality'>Municipio<span className='text-red-500'>*</span></Label>
                  <FormControl>
                    <Input id='municipality' placeholder='Municipio' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='email'>Email</Label>
                  <FormControl>
                    <Input 
                    id='email' 
                    type='email' 
                    placeholder='Email'
                    disabled
                    className='bg-zinc-300'
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phoneNumber'
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor='phoneNumber'>Teléfono</Label>
                  <FormControl>
                    <Input id='phoneNumber' placeholder='Teléfono' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex flex-col gap-2'>
              <Label>Logo</Label>{
                <div className='p-[20%] border-2 border-gray-300 rounded-lg flex justify-center items-center'>
                  
                </div>
              }
              {/* Componente de carga de archivos*/}
            </div>

            <div className='col-span-2'>
              <Button
                type='submit'
                className='bg-black text-white text-sm py-1 px-2 rounded-lg w-[25%]'
              >
                Actualizar Información
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Company
