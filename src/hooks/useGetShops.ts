import { useEffect } from 'react'
import { IPaginationProps } from '../types/GlobalTypes'
import { IShopProps } from './../pages/Shops/types/ShopTypes'
import { getShops } from './helper/functions'

export const useGetShops = async (
  setshops: (data: IPaginationProps<IShopProps>) => void,
  setFetching: (val: boolean) => void,
) => {
  useEffect(() => {
    getShops(setshops, setFetching)
  }, [])
}
