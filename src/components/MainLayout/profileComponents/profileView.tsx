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
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const avatarOptions = [
  'https://img.freepik.com/vector-gratis/avatar-personaje-empresario-aislado_24877-60111.jpg?semt=ais_hybrid&w=740',
  'https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436188.jpg?semt=ais_hybrid&w=740',
  'https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833560.jpg',
  'https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611740.jpg',
  'https://img.freepik.com/psd-gratuitas/ilustracao-3d-de-avatar-ou-perfil-humano_23-2150671126.jpg',
  'https://img.freepik.com/psd-gratuitas/ilustracao-3d-com-avatar-on-line_23-2151303069.jpg?semt=ais_hybrid&w=740',
]

const profileSchema = z.object({
  avatar: z.string().url(),
  fullName: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  documentType: z.string().nonempty('Tipo requerido'),
  documentId: z.string().nonempty('Documento requerido'),
  role: z.string().nonempty('Rol requerido'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const ProfileView: React.FC = () => {
  const { state } = useContext(store)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      avatar: avatarOptions[0],
      fullName: state.user?.fullname || '',
      email: state.user?.email || '',
      documentType: state.user?.id || '',
      documentId: state.user?.id || '',
      role: state.user?.role || '',
    },
  })

  const selectedAvatar = form.watch('avatar')

  const handleAvatarSelect = (src: string) => {
    form.setValue('avatar', src)
  }

  const onSubmit = (values: ProfileFormValues) => {
    console.log('Datos actualizados:', values)
  }

  return (
    <div className='w-full flex flex-col items-center'>
      <div className='pb-5 flex flex-col items-center'>
        <div className='relative w-32 h-32 rounded-full overflow-hidden shadow-md mb-4 flex items-center justify-center'>
          <img src={selectedAvatar} alt='Avatar Principal' className='object-cover w-full h-full' />
        </div>
        <div className='flex gap-3 justify-center'>
          {avatarOptions.map((src, index) => (
            <button
              type='button'
              key={index}
              className={`relative w-14 h-14 rounded-full overflow-hidden shadow-sm border-2 transition-all duration-200 ${
                selectedAvatar === src ? 'scale-125' : 'border-transparent'
              }`}
              onClick={() => handleAvatarSelect(src)}
              tabIndex={0}
            >
              <img src={src} alt={`Avatar ${index + 1}`} className='object-cover w-full h-full' />
            </button>
          ))}
        </div>
      </div>

      <div className='w-full'>
        <Form {...form}>
          <form
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='fullName'>Nombre completo</Label>
                  <FormControl>
                    <Input id='fullName' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='email'>Email</Label>
                  <FormControl>
                    <Input
                      id='email'
                      type='email'
                      {...field}
                      disabled
                      className='bg-zinc-300'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='documentType'>Tipo de documento</Label>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='documentType'>
                        <SelectValue placeholder='Selecciona un tipo' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='cc'>CC</SelectItem>
                        <SelectItem value='ce'>CE</SelectItem>
                        <SelectItem value='ti'>TI</SelectItem>
                        <SelectItem value='passport'>Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='documentId'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='documentId'>Documento de identidad</Label>
                  <FormControl>
                    <Input id='documentId' placeholder='Número de documento' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='role'>Rol</Label>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='role'>
                        <SelectValue placeholder='Selecciona un rol' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='admin'>Administrador</SelectItem>
                        <SelectItem value='user'>POS Admin</SelectItem>
                        <SelectItem value='vendedor_fijo'>Vendedor fijo</SelectItem>
                        <SelectItem value='vendedor_apoyo'>Vendedor apoyo</SelectItem>
                        <SelectItem value='visualizador'>Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-2'>
              <button
                type='submit'
                className='bg-black text-white text-sm p-3 rounded-lg w-[20%]'
              >
                Actualizar Información
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ProfileView
