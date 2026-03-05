import { axiosRequest } from '@/api/api'
import { companyRolesURL, permissionsURL } from '@/utils/network'
import { ICompanyRole, ICreateRolePayload, IPermissionsGrouped } from '../types/RoleTypes'
import { DataPropsForm } from '@/types/GlobalTypes'

export const getCompanyRoles = async (): Promise<ICompanyRole[]> => {
  const response = await axiosRequest<ICompanyRole[]>({
    method: 'get',
    url: companyRolesURL,
    hasAuth: true,
    showError: true,
  })
  return response?.data ?? []
}

export const getPermissionsGrouped = async (): Promise<IPermissionsGrouped> => {
  const response = await axiosRequest<IPermissionsGrouped>({
    method: 'get',
    url: permissionsURL,
    hasAuth: true,
    showError: true,
  })
  return response?.data ?? {}
}

export const postCompanyRole = async (payload: ICreateRolePayload): Promise<ICompanyRole> => {
  const response = await axiosRequest<ICompanyRole, DataPropsForm>({
    method: 'post',
    url: companyRolesURL,
    hasAuth: true,
    showError: true,
    payload: payload as DataPropsForm,
  })
  return response?.data as ICompanyRole
}

export const putCompanyRole = async ({
  id,
  payload,
}: {
  id: number
  payload: ICreateRolePayload
}): Promise<ICompanyRole> => {
  const response = await axiosRequest<ICompanyRole, DataPropsForm>({
    method: 'put',
    url: `${companyRolesURL}/${id}`,
    hasAuth: true,
    showError: true,
    payload: payload as DataPropsForm,
  })
  return response?.data as ICompanyRole
}

export const deleteCompanyRole = async (id: number): Promise<void> => {
  await axiosRequest<void>({
    method: 'delete',
    url: `${companyRolesURL}/${id}`,
    hasAuth: true,
    showError: true,
  })
}
