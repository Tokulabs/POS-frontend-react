import { axiosRequest } from '@/api/api'
import { companyURL } from '@/utils/network'
import { ICompany } from '../types/CompanyTypes'
import { CompanyFormValues } from '../components/Company'

export const putCompanyInformation = async (values: CompanyFormValues) => {
  return await axiosRequest<ICompany, CompanyFormValues>({
    method: 'put',
    url: companyURL,
    hasAuth: true,
    payload: values,
    showError: true,
  })
}
