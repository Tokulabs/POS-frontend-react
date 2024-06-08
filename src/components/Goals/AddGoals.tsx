import { FC, useEffect, useState } from 'react'
// Third Party
import { Modal, Button, Space, InputNumber, Spin } from 'antd'
import { IconDeviceFloppy } from '@tabler/icons-react'
// Hooks
import { useGetGoals } from '../../hooks/useSummaryData'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postGoalsData, putGoalsData } from './services'
import { toast } from 'sonner'

interface IModalGoals {
  isVisible: boolean
  onSuccessCallback: () => void
  onCancelCallback: () => void
}

type valuesGoalsType = {
  goalValue: number
  goalId: number | null
}

const AddGoals: FC<IModalGoals> = ({ isVisible, onCancelCallback, onSuccessCallback }) => {
  const [valueGoalDairy, setValueGoalDairy] = useState<valuesGoalsType>({} as valuesGoalsType)
  const [valueGoalWeekly, setValueGoalWeekly] = useState<valuesGoalsType>({} as valuesGoalsType)
  const [valueGoalMonthly, setValueGoalMonthly] = useState<valuesGoalsType>({} as valuesGoalsType)
  const [valueGoalAnnual, setValueGoalAnnual] = useState<valuesGoalsType>({} as valuesGoalsType)

  const queryClient = useQueryClient()
  const { isLoading, goals } = useGetGoals('getGoals')

  const filterGoalsValue = (type: string) => {
    return {
      goalValue: goals?.filter((i) => i.goal_type === type)[0]?.goal_value || 0,
      goalId: goals?.filter((i) => i.goal_type === type)[0]?.id || null,
    }
  }

  useEffect(() => {
    if (goals) {
      setValueGoalDairy(filterGoalsValue('diary'))
      setValueGoalWeekly(filterGoalsValue('weekly'))
      setValueGoalMonthly(filterGoalsValue('monthly'))
      setValueGoalAnnual(filterGoalsValue('annual'))
    }
  }, [goals])

  const { mutate: mutatePost, isPending: isLoadingPost } = useMutation({
    mutationFn: postGoalsData,
    onSuccess: () => {
      onSuccessCallback()
      toast.success('Meta guardada!')
      queryClient.invalidateQueries({ queryKey: ['getGoals'] })
    },
  })

  const { mutate: mutatePut, isPending: isLoadingPut } = useMutation({
    mutationFn: putGoalsData,
    onSuccess: () => {
      onSuccessCallback()
      toast.success('Meta guardada!')
      queryClient.invalidateQueries({ queryKey: ['getGoals'] })
    },
  })

  const onSave = async (type: string, values: valuesGoalsType) => {
    if (values.goalId) {
      const payload = {
        goal_type: type,
        goal_value: values.goalValue,
      }
      mutatePut({ payload, id: values.goalId })
    } else {
      const payload = {
        goal_type: type,
        goal_value: values.goalValue,
      }
      mutatePost(payload)
    }
  }

  return (
    <Modal
      title='Metas Generales'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
      }}
      footer={false}
    >
      <section className='flex flex-col gap-4'>
        {isLoading && <Spin size='large' />}
        {!isLoading && goals && (
          <section className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <span>Meta Diaria</span>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Meta Diaria'
                  value={valueGoalDairy.goalValue}
                  onChange={(value) => {
                    setValueGoalDairy({ ...valueGoalDairy, goalValue: value as number })
                  }}
                />
                <Button
                  type='primary'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => onSave('diary', valueGoalDairy)}
                  loading={isLoadingPost || isLoadingPut}
                >
                  <IconDeviceFloppy />
                </Button>
              </Space.Compact>
            </div>
            <div className='flex flex-col'>
              <span>Meta Semanal</span>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Meta Semanal'
                  value={valueGoalWeekly.goalValue}
                  onChange={(value) => {
                    setValueGoalWeekly({ ...valueGoalWeekly, goalValue: value as number })
                  }}
                />
                <Button
                  type='primary'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => onSave('weekly', valueGoalWeekly)}
                  loading={isLoadingPost || isLoadingPut}
                >
                  <IconDeviceFloppy />
                </Button>
              </Space.Compact>
            </div>
            <div className='flex flex-col'>
              <span>Meta Mensual</span>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Meta Mensual'
                  value={valueGoalMonthly.goalValue}
                  onChange={(value) => {
                    setValueGoalMonthly({ ...valueGoalMonthly, goalValue: value as number })
                  }}
                />
                <Button
                  type='primary'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => onSave('monthly', valueGoalMonthly)}
                  loading={isLoadingPost || isLoadingPut}
                >
                  <IconDeviceFloppy />
                </Button>
              </Space.Compact>
            </div>
            <div className='flex flex-col'>
              <span>Meta Anual</span>
              <Space.Compact style={{ width: '100%' }}>
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder='Meta Anual'
                  value={valueGoalAnnual.goalValue}
                  onChange={(value) => {
                    setValueGoalAnnual({ ...valueGoalAnnual, goalValue: value as number })
                  }}
                />
                <Button
                  type='primary'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onClick={() => onSave('annual', valueGoalAnnual)}
                  loading={isLoadingPost || isLoadingPut}
                >
                  <IconDeviceFloppy />
                </Button>
              </Space.Compact>
            </div>
          </section>
        )}
      </section>
    </Modal>
  )
}

export { AddGoals }
