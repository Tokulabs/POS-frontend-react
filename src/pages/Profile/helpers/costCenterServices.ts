import { axiosRequest } from '@/api/api'
import { IPaginationProps } from '@/types/GlobalTypes'
import { costCenterURL } from '@/utils/network'
import { ICostCenter } from '../types/CostCenterTypes'

export const getCostCenters = async () => {
  const response = await axiosRequest<IPaginationProps<ICostCenter>>({
    url: costCenterURL,
    hasAuth: true,
    showError: false,
  })
  if (response) {
    return response.data.results
  }
  return []
}

export const postCostCenter = async (name: string) => {
  await axiosRequest({
    method: 'post',
    url: costCenterURL,
    hasAuth: true,
    payload: { name },
  })
}

export const deleteCostCenter = async (id: number) => {
  await axiosRequest({
    method: 'delete',
    url: `${costCenterURL}/${id}/`,
    hasAuth: true,
  })
}
