import { useEffect } from 'react'
import { IGroupsProps } from '../pages/Groups/InventoryGroups'
import { getGroups } from './helper/functions'

export const useGetGroups = async (
  setGroup: (data: IGroupsProps[]) => void,
  setFetching: (val: boolean) => void,
) => {
  useEffect(() => {
    getGroups(setGroup, setFetching)
  }, [])
}
