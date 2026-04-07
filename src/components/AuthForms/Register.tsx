import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import React, { useState, useMemo } from 'react'
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

// ── Disposable email domains (client-side pre-check) ────────────────────────
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', 'yopmail.com', 'temp-mail.org',
    'tempmail.com', 'trashmail.com', 'throwam.com', 'fakeinbox.com',
    'maildrop.cc', 'dispostable.com', 'spamgourmet.com', 'fakemail.net',
    'filzmail.com', 'sharklasers.com', 'spam4.me', 'grr.la',
    'mailnull.com', 'tempr.email', 'meltmail.com', 'mailzilla.com',
])

const formSchema = z.object({
    company_name: z
        .string()
        .min(3, 'El nombre de la empresa debe tener al menos 3 caracteres')
        .max(255)
        .refine(
            (val) => /[aeiouáéíóúAEIOUÁÉÍÓÚ]/.test(val),
            'El nombre de la empresa no parece válido'
        ),
    nit: z
        .string()
        .transform((val) => val.replace(/[-.\s]/g, ''))
        .pipe(
            z.string()
                .min(9, 'El NIT debe tener entre 9 y 10 dígitos')
                .max(10, 'El NIT debe tener entre 9 y 10 dígitos')
                .regex(/^\d{9,10}$/, 'El NIT debe contener solo dígitos')
        ),
    fullname: z
        .string()
        .min(5, 'Ingresa tu nombre completo')
        .max(255)
        .refine(
            (val) => val.trim().split(/\s+/).length >= 2,
            'Ingresa tu nombre y apellido'
        ),
    document_type: z.enum(['CC', 'CE', 'PA'], {
        required_error: 'Selecciona un tipo de documento',
    }),
    document_id: z
        .string()
        .min(4, 'Número de documento inválido')
        .max(20, 'Número de documento demasiado largo')
        .regex(/^[A-Za-z0-9\-]+$/, 'El documento solo puede contener letras, números y guiones'),
    email: z
        .string()
        .email('Debe ser un correo electrónico válido')
        .refine(
            (val) => !DISPOSABLE_DOMAINS.has(val.split('@')[1]?.toLowerCase()),
            'Los correos temporales no son aceptados. Por favor usa un correo personal o corporativo.'
        ),
    terms: z
        .boolean()
        .refine((val) => val === true, 'Debes aceptar los términos y condiciones para continuar'),
    // Honeypot — never submitted; bots fill this in
    website: z.string().optional(),
    // Math challenge answer
    mathAnswer: z.string(),
})

// We expose a public type that EXCLUDES internal anti-bot fields
export type SignupFormValues = Omit<z.infer<typeof formSchema>, 'terms' | 'mathAnswer'>

type FullFormValues = z.infer<typeof formSchema>

const inputClassName =
    'focus-visible:outline-hidden focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-full h-[40px]'

/** Generate a random addition challenge: a + b = ? */
function generateChallenge() {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    return { a, b, answer: String(a + b) }
}

export const RegisterForm: React.FC<IRegisterForm> = ({ onSubmit, loading }) => {
    const challenge = useMemo(() => generateChallenge(), [])
    const [mathError, setMathError] = useState('')

    const form = useForm<FullFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            company_name: '',
            nit: '',
            fullname: '',
            document_type: undefined,
            document_id: '',
            email: '',
            terms: false,
            website: '',
            mathAnswer: '',
        },
    })

    const handleSubmit = (values: FullFormValues) => {
        // Math challenge verification (client-side gate)
        if (values.mathAnswer.trim() !== challenge.answer) {
            setMathError('Respuesta incorrecta. Inténtalo de nuevo.')
            return
        }
        setMathError('')

        // Honeypot: if a bot filled the hidden field, silently pretend success
        if (values.website && values.website.trim() !== '') {
            // Silently discard — don't call onSubmit
            console.warn('[Security] Honeypot triggered, submission discarded.')
            return
        }

        // Strip internal fields before sending to API
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { terms, mathAnswer, website, ...payload } = values
        onSubmit(payload as SignupFormValues)
    }

    return (
        <Form {...form}>
            <form
                className='w-full flex flex-col items-center justify-center gap-3'
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                {/* ── Honeypot (hidden from real users, bots fill it) ── */}
                <input
                    type='text'
                    tabIndex={-1}
                    autoComplete='off'
                    aria-hidden='true'
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                    {...form.register('website')}
                />

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
                                            inputMode='numeric'
                                            maxLength={12}
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
                                        placeholder='Juan Pérez García'
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
                                            maxLength={20}
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

                {/* ── Math challenge ───────────────────────────────────── */}
                <div className='w-full grid gap-2'>
                    <Label htmlFor='mathAnswer'>
                        Verificación: ¿Cuánto es {challenge.a} + {challenge.b}?
                    </Label>
                    <Input
                        id='mathAnswer'
                        placeholder='Escribe el resultado'
                        className={inputClassName}
                        inputMode='numeric'
                        maxLength={3}
                        {...form.register('mathAnswer')}
                    />
                    {mathError && (
                        <p className='text-sm text-red-500'>{mathError}</p>
                    )}
                </div>

                {/* ── Terms of Service ─────────────────────────────────── */}
                <FormField
                    control={form.control}
                    name='terms'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <div className='flex items-start gap-2'>
                                <input
                                    id='terms'
                                    type='checkbox'
                                    className='mt-0.5 h-4 w-4 cursor-pointer accent-neutral-900'
                                    checked={field.value}
                                    onChange={field.onChange}
                                />
                                <Label htmlFor='terms' className='text-sm leading-snug cursor-pointer'>
                                    Acepto los{' '}
                                    <a
                                        href='https://kiospot.com/terminos'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='underline'
                                    >
                                        términos y condiciones
                                    </a>{' '}
                                    y la{' '}
                                    <a
                                        href='https://kiospot.com/privacidad'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='underline'
                                    >
                                        política de privacidad
                                    </a>
                                </Label>
                            </div>
                            <FormMessage />
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
