import { useEffect } from 'react'
import { IInventoryProps } from '../pages/Inventories/types/InventoryTypes'
import { IPaginationProps } from '../types/GlobalTypes'
import { getInventories } from './helper/functions'

export const useGetInventories = async (
  setInventories: (data: IPaginationProps<IInventoryProps>) => void,
  setFetching: (val: boolean) => void,
  dependencies?: Array<string | boolean | number>,
) => {
  useEffect(() => {
    getInventories(setInventories, setFetching)
  }, dependencies || [])
}
