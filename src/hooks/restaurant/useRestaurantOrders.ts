import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantOrdersURL } from '@/utils/network'
import { IRestaurantOrder, IRestaurantOrderItem, OrderItemStatus, OrderStatus } from '@/pages/Restaurant/types/RestaurantTypes'
import { IPaginationProps } from '@/types/GlobalTypes'

export const useRestaurantOrders = (
  statusFilter?: OrderStatus[],
  params?: { keyword?: string; page?: number },
) => {
  const queryClient = useQueryClient()
  const { keyword = '', page = 1 } = params ?? {}

  const queryKey = ['restaurant-orders', statusFilter?.join(',') ?? 'all', keyword, page]

  const { isLoading, data } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(restaurantOrdersURL)
      if (statusFilter?.length) url.searchParams.set('status', statusFilter.join(','))
      if (keyword) url.searchParams.set('keyword', keyword)
      if (params?.page !== undefined) url.searchParams.set('page', String(page))
      const response = await axiosRequest<IPaginationProps<IRestaurantOrder>>({ url, hasAuth: true })
      return response?.data ?? { count: 0, results: [], next: null, previous: null }
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] })
    queryClient.invalidateQueries({ queryKey: ['restaurant-order'] })
    queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] })
  }

  const createOrder = useMutation({
    mutationFn: (payload: { table?: number; notes?: string }) =>
      axiosRequest<IRestaurantOrder>({ url: restaurantOrdersURL, method: 'post', payload, hasAuth: true }),
    onSuccess: invalidate,
  })

  const updateOrder = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; status?: OrderStatus; notes?: string; table?: number | null }) =>
      axiosRequest({ url: `${restaurantOrdersURL}${id}/`, method: 'patch', payload, hasAuth: true }),
    onSuccess: invalidate,
  })

  const addItem = useMutation({
    mutationFn: ({
      orderId,
      ...payload
    }: {
      orderId: number
      item: number
      quantity: number
      notes?: string
      selected_options?: { group_id: number; product_id: number }[]
    }) =>
      axiosRequest<IRestaurantOrderItem>({
        url: `${restaurantOrdersURL}${orderId}/add-item/`,
        method: 'post',
        payload,
        hasAuth: true,
      }),
    onSuccess: invalidate,
  })

  const removeItem = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      axiosRequest({ url: `${restaurantOrdersURL}${orderId}/items/${itemId}/`, method: 'delete', hasAuth: true }),
    onSuccess: invalidate,
  })

  const updateItemStatus = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: number; itemId: number; status: OrderItemStatus }) =>
      axiosRequest<IRestaurantOrderItem>({
        url: `${restaurantOrdersURL}${orderId}/items/${itemId}/status/`,
        method: 'patch',
        payload: { status },
        hasAuth: true,
      }),
    onSuccess: invalidate,
  })

  const convertToInvoice = useMutation({
    mutationFn: (orderId: number) =>
      axiosRequest({ url: `${restaurantOrdersURL}${orderId}/convert-to-invoice/`, method: 'post', hasAuth: true }),
    onSuccess: invalidate,
  })

  const completeBilling = useMutation({
    mutationFn: (orderId: number) =>
      axiosRequest({ url: `${restaurantOrdersURL}${orderId}/complete-billing/`, method: 'post', hasAuth: true }),
    onSuccess: invalidate,
  })

  const moveItems = useMutation({
    mutationFn: ({
      orderId,
      items,
      targetTableId,
    }: {
      orderId: number
      items: { id: number; quantity: number }[]
      targetTableId: number
    }) =>
      axiosRequest({
        url: `${restaurantOrdersURL}${orderId}/move-items/`,
        method: 'post',
        payload: { items, target_table_id: targetTableId },
        hasAuth: true,
      }),
    onSuccess: invalidate,
  })

  return {
    isLoading,
    orders: data?.results ?? [],
    totalCount: data?.count ?? 0,
    createOrder,
    updateOrder,
    addItem,
    removeItem,
    updateItemStatus,
    convertToInvoice,
    completeBilling,
    moveItems,
  }
}
