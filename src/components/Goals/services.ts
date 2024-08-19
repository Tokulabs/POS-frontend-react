import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { goalsURL } from '@/utils/network'
import { IGoals } from './types'

export const getGoalsData = async () => {
  const response = await axiosRequest<IGoals[]>({
    url: goalsURL,
    hasAuth: true,
    showError: true,
  })
  if (response) {
    return response.data
  }
}

export const postGoalsData = async (value: DataPropsForm) => {
  const response = await axiosRequest<IGoals>({
    method: 'post',
    url: goalsURL,
    hasAuth: true,
    showError: true,
    payload: value,
  })
  if (response) {
    return response.data
  }
}

export const putGoalsData = async (data: { payload: DataPropsForm; id: number }) => {
  const response = await axiosRequest<IGoals>({
    method: 'put',
    url: `${goalsURL}/${data.id}/`,
    hasAuth: true,
    showError: true,
    payload: data.payload,
  })
  if (response) {
    return response.data
  }
}
