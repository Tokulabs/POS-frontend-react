import { Progress, Spin } from 'antd'
import { useGetGoals, useSummmaryByKeyFrame } from '@/hooks/useSummaryData'
import { IGeneralGoals } from '../types/DashboardTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { useMemo } from 'react'

type GoalType = 'diary' | 'weekly' | 'monthly' | 'annual'
enum GoalTypeEnum {
  diary = 'Meta Diaria',
  weekly = 'Meta Semanal',
  monthly = 'Meta Mensual',
  annual = 'Meta Anual',
}

const GeneralGoals = () => {
  const { isLoading: isLoadingSummary, summaryByKeyframe: summaryGeneral } =
    useSummmaryByKeyFrame<IGeneralGoals>('summaryGeneral', {
      type: 'general',
    })
  const { isLoading: isLoadingGoals, goals } = useGetGoals('getGoals')

  const calculatePercentage = useMemo(() => {
    return (goalType: GoalType) => {
      const goal = goals?.find((g) => g.goal_type === goalType)
      const summaryValue = summaryGeneral ? summaryGeneral[goalType] : 0
      return goal ? ((summaryValue / goal.goal_value) * 100).toFixed(1) : 0
    }
  }, [goals, summaryGeneral])

  const progressItems = useMemo(() => {
    if (!goals || !summaryGeneral) {
      return []
    }
    return goals.map((goal) => ({
      title: GoalTypeEnum[goal.goal_type as GoalType],
      percent: calculatePercentage(goal.goal_type as GoalType),
      goalValue: goal.goal_value,
      id: goal.id,
    }))
  }, [goals, summaryGeneral, calculatePercentage])

  if (isLoadingSummary || isLoadingGoals) {
    return (
      <div className='bg-white h-full p-4 flex items-center justify-center shadow-md'>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <div className='bg-white h-full p-4 rounded-lg flex flex-col gap-4 shadow-md'>
      <span className='font-bold self-center'>Metas Generales</span>
      <section className='flex flex-col gap-4'>
        {progressItems ? (
          progressItems
            .sort((a, b) => (a.id < b.id ? -1 : 1))
            .map((item, index) => (
              <div key={index} className='w-full flex flex-col gap-2'>
                <div className='flex justify-between'>
                  <span className='font-medium'>{item.title}</span>
                  <span className='font-medium text-green-1'>
                    {formatNumberToColombianPesos(item.goalValue, true)}
                  </span>
                </div>
                <Progress
                  size={['100%', 18]}
                  type='line'
                  percent={Number(item.percent)}
                  strokeColor={
                    Number(item.percent) < 50
                      ? '#E62C37'
                      : Number(item.percent) >= 100
                        ? '#269962'
                        : '#007bff'
                  }
                  status={Number(item.percent) >= 100 ? 'success' : 'active'}
                />
              </div>
            ))
        ) : (
          <div>No hay metas generales...</div>
        )}
      </section>
    </div>
  )
}

export { GeneralGoals }
