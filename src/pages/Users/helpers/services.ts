import { axiosRequest } from '../../../api/api'
import { formatDateTime } from '../../../layouts/helpers/helpers'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { createUserURL, usersURL } from '../../../utils/network'
import { IUserProps, UserRolesEnum } from '../types/UserTypes'

export const getUsersNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(usersURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IUserProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        last_login: item.last_login ? formatDateTime(item.last_login) : 'N/A',
        is_active: item.is_active,
        role: UserRolesEnum[item.role as keyof typeof UserRolesEnum] || 'Rol desconocido',
      }))
      return { ...response.data, results: data }
    }
  } catch (e) {
    console.log(e)
  }
}

export const postUsersNew = async (values: DataPropsForm) => {
  await axiosRequest({
    method: 'post',
    url: createUserURL,
    hasAuth: true,
    payload: values,
  })
}

export const putUsers = async (data: { values: DataPropsForm; id: number }) => {
  await axiosRequest({
    method: 'put',
    url: `${usersURL}/${data.id}/`,
    hasAuth: true,
    payload: data.values,
  })
}

export const toggleActiveUser = async (id: number) => {
  return await axiosRequest<IUserProps>({
    method: 'post',
    url: `${usersURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}
