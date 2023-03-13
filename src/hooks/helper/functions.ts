import { axiosRequest } from '../../api/api'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { IGroupsProps } from '../../pages/Groups/types/GroupTypes'
import { IInventoryProps } from '../../pages/Inventories/types/InventoryTypes'
import { groupURL, inventoryURL, shopURL } from '../../utils/network'
import { IShopProps } from './../../pages/Shops/types/ShopTypes'

export const getGroups = async (
  setGroup: (data: IGroupsProps[]) => void,
  setFetching: (val: boolean) => void,
) => {
  try {
    setFetching(true)
    const response = await axiosRequest<{ results: IGroupsProps[] }>({
      url: groupURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        belongsTo: item.belongs_to ? item.belongs_to.name : 'No aplica',
      }))
      setGroup(data)
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}

export const getInventories = async (
  setInventories: (data: IInventoryProps[]) => void,
  setFetching: (val: boolean) => void,
) => {
  try {
    setFetching(true)
    const response = await axiosRequest<{ results: IInventoryProps[] }>({
      url: inventoryURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        groupInfo: item.group?.name,
        photoInfo: item.photo,
      }))
      setInventories(data)
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}

export const getShops = async (
  setShops: (data: IShopProps[]) => void,
  setFetching: (val: boolean) => void,
) => {
  try {
    setFetching(true)
    const response = await axiosRequest<{ results: IShopProps[] }>({
      url: shopURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        created_at: formatDateTime(item.created_at),
        created_by_email: String(item.created_by.email),
      }))
      setShops(data)
    }
  } catch (e) {
    console.log(e)
  } finally {
    setFetching(false)
  }
}
