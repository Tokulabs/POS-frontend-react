import { useEffect, useState } from 'react'
import { axiosRequest } from '@/api/api'
import { summaryURL } from '@/utils/network'
import { dataSummary } from '../data/dataSummary'
import { ISummaryDataProps } from '../types/DashboardTypes'
import SummaryDataItem from './SummaryDataItem'

const SummaryData = () => {
  const [summaryData, setsummaryData] = useState<ISummaryDataProps>(dataSummary)
  const [loading, setLoading] = useState(false)

  const getSummaryData = async () => {
    try {
      setLoading(true)
      const response = await axiosRequest({
        url: summaryURL,
        hasAuth: true,
      })
      if (response) {
        const result = response.data as { [key: string]: number }
        const tempData = Object.assign({}, summaryData)

        Object.keys(result).forEach((key) => {
          const count = result[key]
          if (tempData[key]) tempData[key].value = count || 0
        })

        setsummaryData(tempData)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSummaryData()
  }, [])
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
      {Object.values(summaryData).map((item, index) => (
        <SummaryDataItem key={index} props={item} loading={loading} />
      ))}
    </div>
  )
}

export default SummaryData
