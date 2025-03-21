import { axiosRequest } from '@/api/api'
import { UpdateInventoryMovements } from '../types/InventoryMovementsTypes'
import { inventoryMovementsURL } from '@/utils/network'
import { DataPropsForm } from '@/types/GlobalTypes'

export const postInventoryMovementItem = async (data: {
  id: string
  values: UpdateInventoryMovements
}) => {
  const { id, values } = data
  return await axiosRequest({
    method: 'post',
    url: `${inventoryMovementsURL}/${id}/change_state_item`,
    hasAuth: true,
    payload: values as unknown as DataPropsForm,
    showError: true,
  })
}

export const postInventoryMovementState = async (data: {
  id: string
  values: UpdateInventoryMovements
}) => {
  const { id, values } = data
  return await axiosRequest({
    method: 'post',
    url: `${inventoryMovementsURL}/${id}/change_state`,
    hasAuth: true,
    payload: values as unknown as DataPropsForm,
    showError: true,
  })
}
