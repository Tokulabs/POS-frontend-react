import { useEffect } from 'react'
import { IInventoryProps } from '../pages/Inventories/types/InventoryTypes'
import { getInventories } from './helper/functions'

export const useGetInventories = async (
  setInventories: (data: IInventoryProps[]) => void,
  setFetching: (val: boolean) => void,
  dependencies?: Array<string | boolean | number>,
) => {
  useEffect(() => {
    getInventories(setInventories, setFetching)
  }, dependencies || [])
}
