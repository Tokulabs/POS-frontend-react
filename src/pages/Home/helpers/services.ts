import { axiosRequest } from '@/api/api'
import { DataPropsForm, IQueryParams } from '@/types/GlobalTypes'
import {
  summaryByHour,
  summaryByKeyframe,
  salesByUser,
  purchaseSummaryURL,
  topSellURL,
} from '@/utils/network'
import {
  IPurchaseSummaryProps,
  ISalesByUser,
  ISummaryByHour,
  ITopSellingProps,
} from '../types/DashboardTypes'

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

export const getSummaryByKeyFrame = async <T>(queryParams: IQueryParams) => {
  const finalURL = new URL(summaryByKeyframe)
  const searchParams = new URLSearchParams()
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return
      searchParams.set(key, value.toString())
    })
  }
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<T>({
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
    method: 'post',
    url: salesByUser,
    hasAuth: true,
    showError: true,
    payload: value,
  })
  if (response) {
    return response.data
  }
}

export const postPurchaseSummary = async (value: DataPropsForm) => {
  const response = await axiosRequest<IPurchaseSummaryProps>({
    method: 'post',
    url: purchaseSummaryURL,
    hasAuth: true,
    showError: true,
    payload: value,
  })
  if (response) {
    return response.data
  }
}

export const postTopSeelingProducts = async (value: DataPropsForm) => {
  const response = await axiosRequest<ITopSellingProps[]>({
    method: 'post',
    url: topSellURL,
    hasAuth: true,
    showError: true,
    payload: value,
  })
  if (response) {
    return response.data
  }
}
