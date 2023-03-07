import { axiosRequest } from '../../api/api'
import { IGroupsProps } from '../../pages/Groups/InventoryGroups'
import { groupURL } from '../../utils/network'

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
