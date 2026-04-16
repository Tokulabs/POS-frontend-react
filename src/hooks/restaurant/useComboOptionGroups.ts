import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantComboOptionGroupsURL, restaurantComboOptionURL, restaurantComboOptionReorderURL } from '@/utils/network'
import { IComboOptionGroup, IComboOption, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'

export const useComboOptionGroups = (menuItemId: number) => {
  const qc = useQueryClient()
  const detailKey = ['restaurant-menu-item', menuItemId]

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['restaurant-menu'] })
    qc.invalidateQueries({ queryKey: ['restaurant-menu-all'] })
    qc.invalidateQueries({ queryKey: detailKey })
  }

  // Patches a single group inside the cached detail — avoids a full refetch
  const patchGroupInCache = (updatedGroup: IComboOptionGroup) => {
    qc.setQueryData<IRestaurantProductDetail>(detailKey, (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        option_groups: prev.option_groups.map((g) => g.id === updatedGroup.id ? updatedGroup : g),
      }
    })
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

  const updateGroup = useMutation({
    mutationFn: ({ groupId, name, is_required }: { groupId: number; name: string; is_required?: boolean }) =>
      axiosRequest<IComboOptionGroup>({
        url: `${restaurantComboOptionGroupsURL(menuItemId)}${groupId}/`,
        method: 'patch',
        payload: { name, ...(is_required !== undefined ? { is_required } : {}) },
        hasAuth: true,
      }),
    onSuccess: (response) => {
      if (response?.data) patchGroupInCache(response.data)
    },
  })

  const removeGroup = useMutation({
    mutationFn: (groupId: number) =>
      axiosRequest({
        url: `${restaurantComboOptionGroupsURL(menuItemId)}${groupId}/`,
        method: 'delete',
        hasAuth: true,
      }),
    onSuccess: (_, groupId) => {
      qc.setQueryData<IRestaurantProductDetail>(detailKey, (prev) => {
        if (!prev) return prev
        return { ...prev, option_groups: prev.option_groups.filter((g) => g.id !== groupId) }
      })
    },
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
    onSuccess: (_, { groupId, optionId }) => {
      qc.setQueryData<IRestaurantProductDetail>(detailKey, (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          option_groups: prev.option_groups.map((g) =>
            g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g
          ),
        }
      })
    },
  })

  const reorderOptions = useMutation({
    mutationFn: ({ groupId, order }: { groupId: number; order: number[] }) =>
      axiosRequest<IComboOptionGroup>({
        url: restaurantComboOptionReorderURL(menuItemId, groupId),
        method: 'post',
        payload: { order },
        hasAuth: true,
      }),
    // No invalidation — local state already reflects the new order
  })

  return { createGroup, updateGroup, removeGroup, addOption, removeOption, reorderOptions }
}
