import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantTablesURL } from '@/utils/network'
import { IRestaurantTable, TableStatus } from '@/pages/Restaurant/types/RestaurantTypes'

type TablePayload = {
  number: string
  area: number | null
  capacity: number
  status?: TableStatus
}

export const useRestaurantTables = () => {
  const queryClient = useQueryClient()

  const { isLoading, data: tables } = useQuery({
    queryKey: ['restaurant-tables'],
    queryFn: async () => {
      const response = await axiosRequest<IRestaurantTable[]>({ url: restaurantTablesURL, hasAuth: true })
      return response?.data ?? []
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  })

  const createTable = useMutation({
    mutationFn: (payload: TablePayload) =>
      axiosRequest({ url: restaurantTablesURL, method: 'post', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] }),
  })

  const updateTable = useMutation({
    mutationFn: ({ id, ...payload }: TablePayload & { id: number }) =>
      axiosRequest({ url: `${restaurantTablesURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] }),
  })

  const patchTable = useMutation({
    mutationFn: ({ id, ...payload }: Partial<TablePayload> & { id: number }) =>
      axiosRequest({ url: `${restaurantTablesURL}${id}/`, method: 'patch', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] }),
  })

  const deleteTable = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantTablesURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-tables'] }),
  })

  return {
    isLoading,
    tables: tables ?? [],
    createTable,
    updateTable,
    patchTable,
    deleteTable,
  }
}
