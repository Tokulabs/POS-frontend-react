import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { creditNoteURL, sendCreditNoteDianURL } from '@/utils/network'
import { ICreditNoteMinimalProps, ICreditNoteProps } from '../types/CreditNoteTypes'

export const getCreditNotes = async (queryParams: IQueryParams) => {
  const finalURL = new URL(creditNoteURL)
  const searchParams = new URLSearchParams()
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return
      searchParams.set(key, value.toString())
    })
  }
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<IPaginationProps<ICreditNoteMinimalProps>>({
    url: finalURL,
    hasAuth: true,
    showError: false,
  })
  if (response) {
    const data: ICreditNoteMinimalProps[] = response.data.results.map((item) => ({
      ...item,
      key: item.id,
    }))
    return { ...response.data, results: data }
  }
  return { count: 0, page: 1, next: null, previous: null, results: [] as ICreditNoteMinimalProps[] }
}

export const getCreditNoteById = async (id: number | string) => {
  const finalURL = new URL(`${creditNoteURL}/${id}`)
  const result = await axiosRequest<ICreditNoteProps>({
    method: 'get',
    url: finalURL,
    hasAuth: true,
  })
  return result?.data
}

export const postCreditNote = async (values: DataPropsForm) => {
  return await axiosRequest<{ message: string; data: ICreditNoteProps }>({
    method: 'post',
    url: creditNoteURL,
    hasAuth: true,
    payload: values,
  })
}

export const postSendCreditNote = async (creditNoteId: number) => {
  return await axiosRequest<{ success: boolean; cude?: string; error?: string }>({
    method: 'post',
    url: sendCreditNoteDianURL,
    hasAuth: true,
    payload: { credit_note_id: creditNoteId },
  })
}
