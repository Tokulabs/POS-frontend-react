import { useEffect } from 'react'
import { IGroupsProps } from '../pages/Groups/types/GroupTypes'
import { getGroups } from './helper/functions'

export const useGetGroups = async (
  setGroup: (data: IGroupsProps[]) => void,
  setFetching: (val: boolean) => void,
) => {
  useEffect(() => {
    getGroups(setGroup, setFetching)
  }, [])
}
