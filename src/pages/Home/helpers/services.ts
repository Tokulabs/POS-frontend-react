import { axiosRequest } from '../../../api/api'
import { DataPropsForm, IQueryParams } from '../../../types/GlobalTypes'
import { summaryByHour, summaryByKeyframe, salesByUser } from '../../../utils/network'
import { ISalesByUser, ISummaryByHour, ISummaryByKeyframe } from '../types/DashboardTypes'

export const getSummaryByHour = async () => {
  const finalURL = new URL(summaryByHour)
  const searchParams = new URLSearchParams()
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<ISummaryByHour[]>({
    url: finalURL,
    hasAuth: true,
    showError: true,
  })
  if (response) {
    return response.data
  }
}

export const getSummaryByKeyFrame = async (queryParams: IQueryParams) => {
  const finalURL = new URL(summaryByKeyframe)
  const searchParams = new URLSearchParams()
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return
      searchParams.set(key, value.toString())
    })
  }
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<ISummaryByKeyframe[]>({
    url: finalURL,
    hasAuth: true,
    showError: true,
  })
  if (response) {
    return response.data
  }
}

export const getSummarybyUser = async (value: DataPropsForm) => {
  const response = await axiosRequest<ISalesByUser[]>({
    url: salesByUser,
    hasAuth: true,
    showError: true,
    payload: value,
  })
  console.log(response)
  if (response) {
    return response.data
  }
}
