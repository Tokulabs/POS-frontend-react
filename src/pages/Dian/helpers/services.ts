import { axiosRequest } from '../../../api/api'
import { IQueryParams } from '../../../types/GlobalTypes'
import { dianResolutionURL } from '../../../utils/network'
import { IDianResolutionProps } from '../types/DianResolutionTypes'

export const getDianResolutions = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(dianResolutionURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IDianResolutionProps[]>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      return response
    }
  } catch (e) {
    console.log(e)
  }
}
