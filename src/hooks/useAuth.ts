import { useContext, useEffect } from 'react'
import { authHandler } from '../pages/Auth/helpers'
import { IAuthProps } from '../types/AuthTypes'
import { ActionTypes } from '../types/StoreTypes'
import { IUser } from '../types/UserType'
import { store } from './../store/index'

export const useAuth = async (AuthCallbacks: IAuthProps) => {
  const { dispatch } = useContext(store)

  useEffect(() => {
    const checkUser = async () => {
      const { errorCallback, successCallback } = AuthCallbacks
      const user: IUser | null = await authHandler()
      if (!user) {
        if (errorCallback) {
          errorCallback()
        }
        return
      }
      if (successCallback) {
        dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: user })
        successCallback()
      }
    }
    checkUser()
  }, [])
}
