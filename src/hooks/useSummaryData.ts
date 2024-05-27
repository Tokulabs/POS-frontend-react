import { QueryKey, useQuery } from '@tanstack/react-query'
import { DataPropsForm, IQueryParams } from '../types/GlobalTypes'
import {
  getSummaryByHour,
  getSummaryByKeyFrame,
  getSummarybyUser,
} from '../pages/Home/helpers/services'

export const useSummaryByhour = (queryKey: string) => {
  const queryKeyToSend: QueryKey = [queryKey]
  const { isLoading, data: summaryByHour } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => await getSummaryByHour(),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    summaryByHour,
  }
}

export const useSummmaryByKeyFrame = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  if (queryParamas?.type === '1') return { isLoading: false, summaryByKeyframe: null }
  const { isLoading, data: summaryByKeyframe } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => await getSummaryByKeyFrame(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    summaryByKeyframe,
  }
}

export const useSummaryByUser = (queryKey: string, payload: DataPropsForm) => {
  const queryKeyToSend: QueryKey = [queryKey]
  const { isLoading, data: summaryByUser } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => await getSummarybyUser(payload),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    summaryByUser,
  }
}
