import { useQuery } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantMembershipCardsURL } from '@/utils/network'
import { IMembershipCard } from './useMembershipCards'

export interface IMembershipCardReportSummary {
  total_cards: number
  completed_cards: number
  total_stamps_given: number
  avg_progress: number
}

export interface IMembershipCardReport {
  summary: IMembershipCardReportSummary
  cards: IMembershipCard[]
}

export const useMembershipCardsReport = (params: { startDate?: string; endDate?: string; enabled: boolean }) => {
  const { startDate, endDate, enabled } = params

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['membership-cards-report', startDate, endDate],
    queryFn: async () => {
      const url = new URL(`${restaurantMembershipCardsURL}report/`)
      if (startDate) url.searchParams.set('start_date', startDate)
      if (endDate) url.searchParams.set('end_date', endDate)
      const response = await axiosRequest<IMembershipCardReport>({ url, hasAuth: true })
      return response?.data ?? { summary: { total_cards: 0, completed_cards: 0, total_stamps_given: 0, avg_progress: 0 }, cards: [] }
    },
    enabled,
    staleTime: 1000 * 60,
  })

  return {
    isLoading,
    summary: data?.summary,
    cards: data?.cards ?? [],
    refetch,
  }
}
