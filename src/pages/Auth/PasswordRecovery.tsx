import { FC, useState } from 'react'
import { IAuthProps } from '@/types/AuthTypes'
import { passwordRecoveryURL } from '@/utils/network'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { toast } from 'sonner'
import ImageCarousel from '@/components/Carrousel/Carrousel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PasswordRecovery: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: DataPropsForm) => {
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: passwordRecoveryURL,
        payload: values,
        errorObject: {
          message: 'Error en la solicitud',
        },
      })
      if (response) {
        const { email } = values
        navigate({
          pathname: '/password-reset',
          search: createSearchParams({
            email: email as string,
          }).toString(),
        })
        toast.error(response.data.message)
      }
    } catch (e) {
      console.log(e)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex w-100'>
      
      <div className='md:w-[50%] min-h-[100vh] bg-gray-200 md:flex items-center justify-center hidden'>
        <ImageCarousel />
      </div>
      
      <div className='w-[50%] min-h-[100vh] flex flex-col items-center justify-center'>
        <img 
          src="src/assets/logos/Kiospot-Horizontal-Logo-color.webp" 
          alt="Logo" 
          className="h-[85px] md:h-[155px]" 
        />
        <p className="text-base ml-[0px] justify-center font-semibold items-center p-4 fixed bottom-9">
          © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
         </p>
        <div className='min-w-[400px]'>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.target as HTMLFormElement)
            const values: DataPropsForm = Object.fromEntries(formData.entries()) as DataPropsForm
            onSubmit(values)
          }}>
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="mb-5 mt-5">
              
              <Input 
                id="email"
                name="email"
                placeholder="Correo electrónico" 
                type="email" 
                required
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full ${loading ? 'cursor-not-allowed opacity-50' : ''}`} 
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Confirmar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  ) 
}
export default PasswordRecovery
