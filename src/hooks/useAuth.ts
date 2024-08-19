import { useContext, useEffect, useState } from 'react'
import { authHandler } from '@/pages/Auth/helpers'
import { IAuthProps } from '@/types/AuthTypes'
import { ActionTypes } from '@/types/StoreTypes'
import { IUser } from '@/types/UserType'
import { store } from '@/store/index'

export const useAuth = (AuthCallbacks: IAuthProps) => {
  const { dispatch } = useContext(store)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { errorCallback, successCallback } = AuthCallbacks
      const user: IUser | null = await authHandler()
      if (!user) {
        setIsLogged(false)
        if (errorCallback) {
          errorCallback()
        }
        return
      }
      setIsLogged(true)
      if (successCallback) {
        dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: user })
        successCallback()
      }
    }
    checkUser()
  }, [])

  return { isLogged: isLogged }
}
