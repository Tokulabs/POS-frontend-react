import { axiosRequest } from '../../../api/api'
import { formatDateTime } from '../../../layouts/helpers/helpers'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { groupURL } from '../../../utils/network'
import { IGroupsProps } from '../types/GroupTypes'

export const getGroupsNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(groupURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IGroupsProps>>({
      url: finalURL,
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
      return { ...response.data, results: data }
    }
  } catch (e) {
    console.log(e)
  }
}

export const postGroupsNew = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: groupURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    console.log(e)
  }
}
