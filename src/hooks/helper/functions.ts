import { axiosRequest } from '../../api/api'
import { IGroupsProps } from '../../pages/Groups/types/GroupTypes'
import { IInventoryProps } from '../../pages/Inventories/types/InventoryTypes'
import { groupURL, inventoryURL } from '../../utils/network'

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
