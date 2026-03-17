import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface IRegisterForm {
    onSubmit: (values: SignupFormValues) => void
    loading?: boolean
}

const documentTypes = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PA', label: 'Pasaporte' },
] as const

const formSchema = z.object({
    company_name: z.string().min(2, 'Mínimo 2 caracteres').max(255),
    nit: z.string().min(5, 'NIT inválido').max(255),
    fullname: z.string().min(2, 'Mínimo 2 caracteres').max(255),
    document_type: z.enum(['CC', 'CE', 'PA'], {
        required_error: 'Selecciona un tipo de documento',
    }),
    document_id: z.string().min(3, 'Documento inválido').max(255),
    email: z.string().email('Debe ser un correo electrónico válido'),
})

export type SignupFormValues = z.infer<typeof formSchema>

const inputClassName =
    'focus-visible:outline-hidden focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-full h-[40px]'

export const RegisterForm: React.FC<IRegisterForm> = ({ onSubmit, loading }) => {
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            company_name: '',
            nit: '',
            fullname: '',
            document_type: undefined,
            document_id: '',
            email: '',
        },
    })

    return (
        <Form {...form}>
            <form
                className='w-full flex flex-col items-center justify-center gap-3'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* Company info */}
                <div className='w-full grid grid-cols-2 gap-3'>
                    <FormField
                        control={form.control}
                        name='company_name'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div className='grid gap-2 w-full'>
                                    <Label htmlFor='company_name'>Nombre de la empresa</Label>
                                    <FormControl>
                                        <Input
                                            id='company_name'
                                            placeholder='Mi Empresa S.A.S'
                                            className={inputClassName}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='nit'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div className='grid gap-2 w-full'>
                                    <Label htmlFor='nit'>NIT</Label>
                                    <FormControl>
                                        <Input
                                            id='nit'
                                            placeholder='900123456-7'
                                            className={inputClassName}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Owner info */}
                <FormField
                    control={form.control}
                    name='fullname'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <div className='grid gap-2 w-full'>
                                <Label htmlFor='fullname'>Nombre completo</Label>
                                <FormControl>
                                    <Input
                                        id='fullname'
                                        placeholder='Juan Pérez'
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <div className='w-full grid grid-cols-2 gap-3'>
                    <FormField
                        control={form.control}
                        name='document_type'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div className='grid gap-2 w-full'>
                                    <Label htmlFor='document_type'>Tipo de documento</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger
                                                id='document_type'
                                                className={inputClassName}
                                            >
                                                <SelectValue placeholder='Seleccionar' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {documentTypes.map((dt) => (
                                                <SelectItem key={dt.value} value={dt.value}>
                                                    {dt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='document_id'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <div className='grid gap-2 w-full'>
                                    <Label htmlFor='document_id'>Número de documento</Label>
                                    <FormControl>
                                        <Input
                                            id='document_id'
                                            placeholder='1234567890'
                                            className={inputClassName}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <div className='grid gap-2 w-full'>
                                <Label htmlFor='email'>Correo electrónico</Label>
                                <FormControl>
                                    <Input
                                        id='email'
                                        type='email'
                                        placeholder='admin@miempresa.com'
                                        className={inputClassName}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <FormItem className='w-full mt-1'>
                    <Button
                        type='submit'
                        className='w-full bg-neutral-900 text-white border-0 cursor-pointer'
                        disabled={loading}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </Button>
                </FormItem>

                <div className='w-full mx-auto'>
                    <Link to='/login' className='text-sm text-foreground underline'>
                        ¿Ya tienes cuenta? Inicia sesión
                    </Link>
                </div>
            </form>
        </Form>
    )
}
