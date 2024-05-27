import { Progress } from 'antd'
import { useSummaryByUser } from '../../../hooks/useSummaryData'
import moment from 'moment'

const SalesByUser = () => {
  const today = moment().format('YYYY-MM-DD')

  const { summaryByUser } = useSummaryByUser('summaryByUser', {
    start_date: today,
    end_date: today,
  })
  return (
    <>
      {summaryByUser &&
        summaryByUser?.map((item) => (
          <div key={item.sale_by__id}>
            <h1>{item.sale_by__fullname}</h1>
            <Progress type='dashboard' percent={(item.total_invoice * 100) / 1000000} />
          </div>
        ))}
    </>
  )
}

export { SalesByUser }
