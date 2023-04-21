import { axiosRequest } from '../../../api/api'
import { formatDateTime } from '../../../layouts/helpers/helpers'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { shopURL } from '../../../utils/network'
import { IShopProps } from '../types/ShopTypes'

export const getShopsNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(shopURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IShopProps>>({
      url: finalURL,
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
      return { ...response.data, results: data }
    }
  } catch (e) {
    console.log(e)
  }
}

export const postShopsNew = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: shopURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    console.log(e)
  }
}
