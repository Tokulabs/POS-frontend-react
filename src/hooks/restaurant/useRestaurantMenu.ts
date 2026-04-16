import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantMenuURL } from '@/utils/network'
import { IRestaurantProductDetail, MenuCategory } from '@/pages/Restaurant/types/RestaurantTypes'
import { IPaginationProps } from '@/types/GlobalTypes'

type MenuItemPayload = {
  product: number
  menu_category: MenuCategory
  prep_time_minutes: number
  prep_notes: string
  is_available?: boolean
  skip_stock_check?: boolean
}

export const useRestaurantMenu = (params?: { keyword?: string; page?: number; category?: MenuCategory | '' }) => {
  const queryClient = useQueryClient()
  const { keyword = '', page = 1, category = '' } = params ?? {}
  const isPaginated = params?.page !== undefined

  const { isLoading, data } = useQuery({
    // Use distinct keys for paginated vs full-list fetches to avoid cache collisions
    queryKey: isPaginated
      ? ['restaurant-menu', keyword, page, category]
      : ['restaurant-menu-all', keyword, category],
    queryFn: async () => {
      const url = new URL(restaurantMenuURL)
      if (keyword) url.searchParams.set('keyword', keyword)
      if (isPaginated) url.searchParams.set('page', String(page))
      if (category) url.searchParams.set('category', category)
      const response = await axiosRequest<IPaginationProps<IRestaurantProductDetail>>({ url, hasAuth: true })
      return response?.data ?? { count: 0, results: [], next: null, previous: null }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] })

  const addToMenu = useMutation({
    mutationFn: (payload: MenuItemPayload) =>
      axiosRequest({ url: restaurantMenuURL, method: 'post', payload, hasAuth: true }),
    onSuccess: invalidate,
  })

  const createCombo = useMutation({
    mutationFn: (payload: { name: string; selling_price: number }) =>
      axiosRequest({ url: `${restaurantMenuURL}create-combo/`, method: 'post', payload, hasAuth: true }),
    onSuccess: invalidate,
  })

  const updateMenuItem = useMutation({
    mutationFn: ({ id, ...payload }: Partial<MenuItemPayload> & { id: number }) =>
      axiosRequest<IRestaurantProductDetail>({ url: `${restaurantMenuURL}${id}/`, method: 'put', payload, hasAuth: true }),
    onSuccess: (response, variables) => {
      if (response?.data) queryClient.setQueryData(['restaurant-menu-item', variables.id], response.data)
      invalidate()
    },
  })

  const patchMenuItem = useMutation({
    mutationFn: ({ id, ...payload }: Partial<MenuItemPayload> & { id: number }) =>
      axiosRequest<IRestaurantProductDetail>({ url: `${restaurantMenuURL}${id}/`, method: 'patch', payload, hasAuth: true }),
    onSuccess: (response, variables) => {
      if (response?.data) queryClient.setQueryData(['restaurant-menu-item', variables.id], response.data)
      invalidate()
    },
  })

  const removeFromMenu = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantMenuURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: invalidate,
  })

  const bulkAddToMenu = useMutation({
    mutationFn: (payload: { items: MenuItemPayload[] }) =>
      axiosRequest<{ created: number; skipped: number; errors: { index: number; product_id: number | null; reason: string }[] }>({
        url: `${restaurantMenuURL}bulk-add/`,
        method: 'post',
        payload,
        hasAuth: true,
      }),
    onSuccess: invalidate,
  })

  return {
    isLoading,
    menuItems: data?.results ?? [],
    totalCount: data?.count ?? 0,
    addToMenu,
    createCombo,
    updateMenuItem,
    patchMenuItem,
    removeFromMenu,
    bulkAddToMenu,
  }
}

export const useMenuItemById = (id: number) => {
  const queryClient = useQueryClient()

  const { isLoading, data } = useQuery({
    queryKey: ['restaurant-menu-item', id],
    queryFn: async () => {
      const response = await axiosRequest<IRestaurantProductDetail>({
        url: `${restaurantMenuURL}${id}/`,
        hasAuth: true,
      })
      return response?.data ?? null
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['restaurant-menu-item', id] })
    queryClient.invalidateQueries({ queryKey: ['restaurant-menu'] })
    queryClient.invalidateQueries({ queryKey: ['restaurant-menu-all'] })
  }

  return { isLoading, menuItem: data ?? null, invalidate }
}
