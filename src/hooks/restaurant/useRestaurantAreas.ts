import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantAreasURL } from '@/utils/network'
import { IRestaurantArea } from '@/pages/Restaurant/types/RestaurantTypes'

export const useRestaurantAreas = () => {
  const queryClient = useQueryClient()

  const { isLoading, data: areas } = useQuery({
    queryKey: ['restaurant-areas'],
    queryFn: async () => {
      const response = await axiosRequest<IRestaurantArea[]>({ url: restaurantAreasURL, hasAuth: true })
      return response?.data ?? []
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const createArea = useMutation({
    mutationFn: (payload: { name: string }) =>
      axiosRequest({ url: restaurantAreasURL, method: 'post', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-areas'] }),
  })

  const updateArea = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; name: string }) =>
      axiosRequest({ url: `${restaurantAreasURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-areas'] }),
  })

  const deleteArea = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantAreasURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-areas'] }),
  })

  return {
    isLoading,
    areas: areas ?? [],
    createArea,
    updateArea,
    deleteArea,
  }
}
