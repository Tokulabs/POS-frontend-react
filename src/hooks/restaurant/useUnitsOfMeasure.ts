import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantUnitsURL } from '@/utils/network'
import { IUnitOfMeasure } from '@/pages/Restaurant/types/RestaurantTypes'

const getUnits = async (): Promise<IUnitOfMeasure[]> => {
  const response = await axiosRequest<IUnitOfMeasure[]>({
    url: restaurantUnitsURL,
    hasAuth: true,
  })
  return response?.data ?? []
}

export const useUnitsOfMeasure = () => {
  const queryClient = useQueryClient()

  const { isLoading, data: units } = useQuery({
    queryKey: ['restaurant-units'],
    queryFn: getUnits,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const createUnit = useMutation({
    mutationFn: (payload: Omit<IUnitOfMeasure, 'id' | 'company' | 'is_global'>) =>
      axiosRequest({ url: restaurantUnitsURL, method: 'post', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-units'] }),
  })

  const updateUnit = useMutation({
    mutationFn: ({ id, ...payload }: Partial<IUnitOfMeasure> & { id: number }) =>
      axiosRequest({ url: `${restaurantUnitsURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-units'] }),
  })

  const deleteUnit = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantUnitsURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-units'] }),
  })

  return {
    isLoading,
    units: units ?? [],
    globalUnits: (units ?? []).filter((u) => u.is_global),
    customUnits: (units ?? []).filter((u) => !u.is_global),
    createUnit,
    updateUnit,
    deleteUnit,
  }
}
