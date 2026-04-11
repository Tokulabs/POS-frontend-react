import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantMembershipCardsURL } from '@/utils/network'

export interface IMembershipCard {
  id: number
  card_id: string
  customer: number | null
  customer_name: string | null
  customer_phone: string | null
  client_name: string
  phone: string
  stamps: number
  max_stamps: number
  created_at: string
  updated_at: string
}

interface IPaginationProps<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CreateMembershipCardPayload {
  client_name: string
  phone: string
  max_stamps: number
  customer_id?: number | null
}

export const useMembershipCards = (params?: { keyword?: string; page?: number }) => {
  const queryClient = useQueryClient()
  const { keyword = '', page = 1 } = params ?? {}

  const { isLoading, data } = useQuery({
    queryKey: ['membership-cards', keyword, page],
    queryFn: async () => {
      const url = new URL(restaurantMembershipCardsURL)
      if (keyword) url.searchParams.set('keyword', keyword)
      url.searchParams.set('page', String(page))
      url.searchParams.set('page_size', '10')
      const response = await axiosRequest<IPaginationProps<IMembershipCard>>({ url, hasAuth: true })
      return response?.data ?? { count: 0, results: [], next: null, previous: null }
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['membership-cards'] })
  const invalidateReport = () => queryClient.invalidateQueries({ queryKey: ['membership-cards-report'] })

  const createCard = useMutation({
    mutationFn: (payload: CreateMembershipCardPayload) =>
      axiosRequest({ url: restaurantMembershipCardsURL, method: 'post', payload, hasAuth: true }),
    onSuccess: () => { invalidate(); invalidateReport() },
  })

  const patchCard = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; stamps?: number; customer_id?: number | null; client_name?: string; phone?: string }) =>
      axiosRequest({ url: `${restaurantMembershipCardsURL}${id}/`, method: 'patch', payload, hasAuth: true }),
    onSuccess: () => { invalidate(); invalidateReport() },
  })

  const deleteCard = useMutation({
    mutationFn: (id: number) =>
      axiosRequest({ url: `${restaurantMembershipCardsURL}${id}/`, method: 'delete', hasAuth: true }),
    onSuccess: () => { invalidate(); invalidateReport() },
  })

  return {
    isLoading,
    cards: data?.results ?? [],
    totalCount: data?.count ?? 0,
    createCard,
    patchCard,
    deleteCard,
  }
}
