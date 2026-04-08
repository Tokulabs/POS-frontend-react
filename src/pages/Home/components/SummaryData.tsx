import { useQuery } from '@tanstack/react-query'
import { dataSummary } from '../data/dataSummary'
import { ISummaryDataProps } from '../types/DashboardTypes'
import { getSummaryGeneral } from '../helpers/services'
import SummaryDataItem from './SummaryDataItem'

const SummaryData = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['summaryGeneral'],
    queryFn: getSummaryGeneral,
  })

  const summaryData: ISummaryDataProps = Object.fromEntries(
    Object.entries(dataSummary).map(([k, v]) => [
      k,
      { ...v, value: data?.[k] ?? v.value },
    ]),
  ) as ISummaryDataProps

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
      {Object.values(summaryData).map((item, index) => (
        <SummaryDataItem key={index} props={item} loading={isLoading} />
      ))}
    </div>
  )
}

export default SummaryData
