import { useEffect } from 'react'
import { IPaginationProps, IQueryParams } from '../types/GlobalTypes'
import { IUserProps } from '../pages/Users/types/UserTypes'
import { getUsers } from './helper/functions'

export const useGetUsers = async (
  setUsers: (data: IPaginationProps<IUserProps>) => void,
  setFetching: (val: boolean) => void,
  queryParam?: IQueryParams,
  dependencies?: Array<string | boolean | number>,
) => {
  useEffect(() => {
    getUsers(setUsers, setFetching, queryParam)
  }, dependencies || [])
}
