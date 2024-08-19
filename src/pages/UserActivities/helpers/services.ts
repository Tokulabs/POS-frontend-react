import { axiosRequest } from '@/api/api'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { IQueryParams, IPaginationProps } from '@/types/GlobalTypes'
import { activitiesURL } from '@/utils/network'
import { IActivitiesProps } from '../types/UserActivities'

export const getUserActivitiesNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(activitiesURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IActivitiesProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
      }))
      return { ...response.data, results: data }
    }
  } catch (e) {
    console.log(e)
  }
}
