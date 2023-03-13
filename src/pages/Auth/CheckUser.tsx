import { FC, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosRequest } from '../../api/api'
import Authcomponent from '../../components/Auth/AuthComponent'
import { useAuth } from '../../hooks/useAuth'
import { IAuthProps } from '../../types/AuthTypes'
import { DataPropsForm } from '../../types/GlobalTypes'
import { ActionTypes } from '../../types/StoreTypes'
import { loginURL } from '../../utils/network'
import { store } from './../../store/index'
import { ICheckUserProps } from './types/AuthTypes'

const CheckUser: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { dispatch } = useContext(store)

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: DataPropsForm) => {
    try {
      setLoading(true)
      const response = await axiosRequest<ICheckUserProps>({
        method: 'post',
        url: loginURL,
        payload: { ...values, is_new_user: true },
      })
      if (response) {
        dispatch({
          type: ActionTypes.UPDATE_PASSWORD_USER_ID,
          payload: response.data.user_id,
        })
        navigate('/create-password')
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Authcomponent
      isPassword={false}
      titleText='Validación de usuario'
      bottomText='Validar'
      linkText='Atrás'
      linkPath='/login'
      onSubmit={onSubmit}
      loading={loading}
    />
  )
}

export default CheckUser
