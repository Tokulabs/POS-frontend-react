import { axiosRequest } from '@/api/api'
import { companyURL } from '@/utils/network'
import { ICompany } from '../types/CompanyTypes'
import { CompanyFormValues } from '../Components/CompanySettings'

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
