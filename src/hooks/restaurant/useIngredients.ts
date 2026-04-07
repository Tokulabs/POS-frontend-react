import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantIngredientsURL } from '@/utils/network'
import { IIngredient, IIngredientMovement, IngredientMovementType } from '@/pages/Restaurant/types/RestaurantTypes'
import { IPaginationProps } from '@/types/GlobalTypes'

type IngredientPayload = {
  name: string
  unit: number
  stock_quantity: number
  min_stock: number
  cost_per_unit: number
  provider_id?: number | null
  active?: boolean
}

type MovementPayload = {
  movement_type: IngredientMovementType
  quantity: string   // signed decimal string
  cost_per_unit?: string | null
  provider?: number | null
  notes?: string
}

export const useIngredients = (params?: { keyword?: string; page?: number }) => {
  const queryClient = useQueryClient()
  const { keyword = '', page = 1 } = params ?? {}

  const { isLoading, data } = useQuery({
    queryKey: ['restaurant-ingredients', keyword, page],
    queryFn: async () => {
      const url = new URL(restaurantIngredientsURL)
      if (keyword) url.searchParams.set('keyword', keyword)
      if (params?.page !== undefined) url.searchParams.set('page', String(page))
      const response = await axiosRequest<IPaginationProps<IIngredient>>({ url, hasAuth: true })
      return response?.data ?? { count: 0, results: [], next: null, previous: null }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['restaurant-ingredients'] })

  const createIngredient = useMutation({
    mutationFn: (payload: IngredientPayload) =>
      axiosRequest({ url: restaurantIngredientsURL, method: 'post', payload: { active: true, ...payload }, hasAuth: true }),
    onSuccess: invalidate,
  })

  const updateIngredient = useMutation({
    mutationFn: ({ id, ...payload }: Partial<IngredientPayload> & { id: number }) =>
      axiosRequest({ url: `${restaurantIngredientsURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: invalidate,
  })

  const deleteIngredient = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantIngredientsURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: invalidate,
  })

  const addMovement = useMutation({
    mutationFn: ({ ingredientId, ...payload }: { ingredientId: number } & MovementPayload) =>
      axiosRequest({
        url: `${restaurantIngredientsURL}${ingredientId}/movements/`,
        method: 'post',
        payload,
        hasAuth: true,
      }),
    onSuccess: (_data, vars) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['ingredient-movements', vars.ingredientId] })
    },
  })

  return {
    isLoading,
    ingredients: data?.results ?? [],
    totalCount: data?.count ?? 0,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    addMovement,
  }
}

export const useIngredientMovements = (ingredientId: number | null) =>
  useQuery({
    queryKey: ['ingredient-movements', ingredientId],
    queryFn: async () => {
      const res = await axiosRequest<IIngredientMovement[]>({
        url: `${restaurantIngredientsURL}${ingredientId}/movements/`,
        hasAuth: true,
      })
      return res?.data ?? []
    },
    enabled: !!ingredientId,
    staleTime: 0,
  })
