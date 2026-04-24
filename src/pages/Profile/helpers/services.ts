import { axiosRequest } from '@/api/api'
import { companyURL } from '@/utils/network'
import { ICompany } from '../types/CompanyTypes'
import { CompanyFormValues } from '../Components/CompanySettings'

export const getCompanyInfo = async () => {
  return await axiosRequest<ICompany>({
    method: 'get',
    url: companyURL,
    hasAuth: true,
    showError: false,
  })
}

export const putCompanyInformation = async (values: CompanyFormValues) => {
  const { city, ...rest } = values
  const payload = { ...rest, city_id: city }
  return await axiosRequest<ICompany, typeof payload>({
    method: 'put',
    url: companyURL,
    hasAuth: true,
    payload,
    showError: true,
  })
}

export interface CreditNoteNumberingPayload {
  credit_note_prefix: string
  credit_note_from_number: number
  credit_note_to_number: number
  credit_note_current_number: number
}

export const putCompanyCreditNoteNumbering = async (
  payload: CreditNoteNumberingPayload,
) => {
  return await axiosRequest<ICompany, CreditNoteNumberingPayload>({
    method: 'put',
    url: companyURL,
    hasAuth: true,
    payload,
    showError: true,
  })
}
