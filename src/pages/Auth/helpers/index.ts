import { tokenName } from '../../../utils/constants'
import { meURL } from '../../../utils/network'
import { IUser } from '../../../types/UserType'
import { axiosRequest } from '../../../api/api'

export const logout = () => {
  localStorage.removeItem(tokenName)
}

export const authHandler = async (): Promise<IUser | null> => {
  try {
    const response = await axiosRequest<IUser>({ url: meURL, hasAuth: true, showError: false })

    if (response) return response.data

    return null
  } catch (e) {
    console.log(e)
  }
  return null
}
