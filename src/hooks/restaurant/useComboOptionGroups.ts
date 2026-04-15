import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantComboOptionGroupsURL, restaurantComboOptionURL } from '@/utils/network'
import { IComboOptionGroup, IComboOption } from '@/pages/Restaurant/types/RestaurantTypes'

export const useComboOptionGroups = (menuItemId: number) => {
  const qc = useQueryClient()
  // Option groups are embedded in the menu item query — no separate query needed.
  // Mutations invalidate the parent menu list so RestaurantMenuDetail stays in sync.
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['restaurant-menu'] })
    qc.invalidateQueries({ queryKey: ['restaurant-menu-all'] })
    qc.invalidateQueries({ queryKey: ['restaurant-menu-item', menuItemId] })
  }

  const createGroup = useMutation({
    mutationFn: (payload: { name: string; is_required: boolean }) =>
      axiosRequest<IComboOptionGroup>({
        url: restaurantComboOptionGroupsURL(menuItemId),
        method: 'post',
        payload,
        hasAuth: true,
      }),
    onSuccess: invalidateAll,
  })

  const removeGroup = useMutation({
    mutationFn: (groupId: number) =>
      axiosRequest({
        url: `${restaurantComboOptionGroupsURL(menuItemId)}${groupId}/`,
        method: 'delete',
        hasAuth: true,
      }),
    onSuccess: invalidateAll,
  })

  const addOption = useMutation({
    mutationFn: ({ groupId, product_id, extra_price }: { groupId: number; product_id: number; extra_price: number }) =>
      axiosRequest<IComboOption>({
        url: restaurantComboOptionURL(menuItemId, groupId),
        method: 'post',
        payload: { product_id, extra_price },
        hasAuth: true,
      }),
    onSuccess: invalidateAll,
  })

  const removeOption = useMutation({
    mutationFn: ({ groupId, optionId }: { groupId: number; optionId: number }) =>
      axiosRequest({
        url: `${restaurantComboOptionURL(menuItemId, groupId)}${optionId}/`,
        method: 'delete',
        hasAuth: true,
      }),
    onSuccess: invalidateAll,
  })

  return { createGroup, removeGroup, addOption, removeOption }
}
