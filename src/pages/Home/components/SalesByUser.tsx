import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useSummaryByUser } from '../../../hooks/useSummaryData'
import moment from 'moment'
import { formatNumberToColombianPesos } from '../../../utils/helpers'

const SalesByUser = () => {
  const dateFormat = 'YYYY-MM-DD'
  const today = moment().format(dateFormat)

  const { summaryByUser } = useSummaryByUser('summaryByUser', {
    start_date: today,
    end_date: today,
  })
  return (
    <section className='flex flex-col gap-7 w-full items-center'>
      <span className='text-lg'>
        Ventas por usuario hoy: <span className='font-bold text-xl'>{today}</span>
      </span>
      <section className='w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {summaryByUser &&
          summaryByUser?.map((item) => {
            const percentage =
              (item.total_invoice * 100) /
              (item.sale_by__daily_goal > 0 ? item.sale_by__daily_goal : 1000000)
            return (
              <div
                className='flex flex-col gap-2 justify-center items-center'
                key={item.sale_by__id}
              >
                <span
                  className={`font-bold text-lg text-center ${percentage < 50 ? 'text-[#FF0000]' : percentage > 100 ? 'text-[#269962]' : 'text-[#007bff]'}`}
                >
                  {item.sale_by__fullname}
                </span>
                <div className='w-32 h-32'>
                  <CircularProgressbar
                    value={percentage}
                    text={`${percentage.toFixed(0)}%`}
                    circleRatio={0.75}
                    styles={buildStyles({
                      rotation: 1 / 2 + 1 / 8,
                      strokeLinecap: 'butt',
                      trailColor: '#eee',
                      pathColor:
                        percentage < 50 ? '#FF0000' : percentage > 100 ? '#269962' : '#007bff',
                      textColor:
                        percentage < 50 ? '#FF0000' : percentage > 100 ? '#269962' : '#007bff',
                    })}
                  />
                </div>
                <div className='flex gap-2'>
                  <span className='font-lg'>Ventas Diarias</span>
                  <span className='font-xl font-bold'>
                    {formatNumberToColombianPesos(item.total_invoice)}
                  </span>
                </div>
              </div>
            )
          })}
      </section>
    </section>
  )
}

export { SalesByUser }
