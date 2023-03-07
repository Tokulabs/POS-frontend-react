import { FC, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosRequest } from '../../api/api'
import Authcomponent from '../../components/Auth/AuthComponent'
import { useAuth } from '../../hooks/useAuth'
import { DataPropsForm, IAuthProps } from '../../types/AuthTypes'
import { ActionTypes } from '../../types/StoreTypes'
import { updatePasswordURL } from '../../utils/network'
import { store } from './../../store/index'
import { notification } from 'antd'

const UpdateUserPassword: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    dispatch,
    state: { updatePasswordUserId },
  } = useContext(store)

  useEffect(() => {
    if (!updatePasswordUserId) {
      navigate('/')
    }
  }, [])

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: DataPropsForm) => {
    if (values['password'] !== values['confirmPassword']) {
      notification.error({
        message: 'Datos incorrectos',
        description: 'Las contraseñas no concuerdan',
      })
      return
    }
    try {
      setLoading(true)
      const response = await axiosRequest({
        method: 'post',
        url: updatePasswordURL,
        payload: { ...values, user_id: updatePasswordUserId },
      })
      if (response) {
        dispatch({
          type: ActionTypes.UPDATE_PASSWORD_USER_ID,
          payload: null,
        })
        navigate('/login')
        notification.success({
          message: 'Contraseña actualizada con exito!',
          description: 'La contraseña fue creada correctamente',
        })
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Authcomponent
      isPassword={true}
      titleText='Creación de contraseña'
      bottomText='Continuar'
      linkText='Atrás'
      linkPath='/check-user'
      onSubmit={onSubmit}
      loading={loading}
      isUpdatePassword={true}
    />
  )
}

export default UpdateUserPassword
