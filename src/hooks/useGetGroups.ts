import { useEffect } from 'react'
import { IGroupsProps } from '../pages/Groups/types/GroupTypes'
import { IPaginationProps } from '../types/GlobalTypes'
import { getGroups } from './helper/functions'

export const useGetGroups = async (
  setGroup: (data: IPaginationProps<IGroupsProps>) => void,
  setFetching: (val: boolean) => void,
  page?: number,
  dependencies?: Array<string | boolean | number>,
) => {
  useEffect(() => {
    getGroups(setGroup, setFetching, page)
  }, dependencies || [])
}
