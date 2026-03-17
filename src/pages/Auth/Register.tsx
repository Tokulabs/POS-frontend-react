import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { signupURL } from '@/utils/network'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { RegisterForm, SignupFormValues } from '@/components/AuthForms/Register'
import { toast } from 'sonner'

const Register: FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    useAuth({
        successCallback: () => {
            navigate('/')
        },
    })

    const onSubmit = async (values: SignupFormValues) => {
        try {
            setLoading(true)
            const response = await axiosRequest<{ success: string }>({
                method: 'post',
                url: signupURL,
                payload: values,
                errorObject: {
                    message: 'Error al crear la cuenta',
                },
            })
            if (response) {
                toast.success(
                    'Cuenta creada exitosamente. Revisa tu correo para obtener tu contraseña temporal.',
                )
                navigate('/login')
            }
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section>
            <Authcomponent>
                <RegisterForm onSubmit={onSubmit} loading={loading} />
            </Authcomponent>
        </section>
    )
}

export default Register
