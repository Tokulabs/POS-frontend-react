import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantComboItemsURL } from '@/utils/network'
import { IComboItem } from '@/pages/Restaurant/types/RestaurantTypes'

export const useComboItems = (menuItemId: number) => {
  const qc = useQueryClient()
  const key = ['combo-items', menuItemId]

  const { data: comboItems = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await axiosRequest<IComboItem[]>({
        url: restaurantComboItemsURL(menuItemId),
        hasAuth: true,
      })
      return res?.data ?? []
    },
    enabled: !!menuItemId,
  })

  const addItem = useMutation({
    mutationFn: (payload: { product_id: number; quantity: number }) =>
      axiosRequest({
        url: restaurantComboItemsURL(menuItemId),
        method: 'POST',
        payload,
        hasAuth: true,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const removeItem = useMutation({
    mutationFn: (comboItemId: number) =>
      axiosRequest({
        url: `${restaurantComboItemsURL(menuItemId)}${comboItemId}/`,
        method: 'DELETE',
        hasAuth: true,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { comboItems, isLoading, addItem, removeItem }
}
