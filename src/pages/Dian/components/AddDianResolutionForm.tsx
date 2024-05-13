import { Form, Modal, Input, Button, DatePicker } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IModalFormProps } from '../../../types/ModalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Moment } from 'moment'
import { postDianResolution } from '../helpers/services'
import { toast } from 'sonner'

const { RangePicker } = DatePicker
const dateFormat = 'YYYY-MM-DD'

const AddDianResolutionForm: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const queryClient = useQueryClient()

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postDianResolution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
      onSuccessCallback()
      toast.success('Resolución Creada!')
      form.resetFields()
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading) return
    if (!values || values === null) return

    const dianDates: Moment[] = values['dian_resolution_dates'] as Moment[]

    const newDates = dianDates.map((date) => {
      const year = date.year() // Año
      const month = date.month() // Mes (0-11)
      const day = date.date() // Día
      const newDate = new Date(year, month, day)
      return newDate.toISOString().split('T')[0]
    })

    const newValues = { ...values, from_date: newDates[0], to_date: newDates[1] }
    mutate(newValues)
  }

  return (
    <Modal
      title='Crear Resolucion de la DIAN'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form}>
        <Form.Item
          label='Numero de Resolución'
          name='document_number'
          rules={[{ required: true, message: 'Campo requerido' }]}
        >
          <Input placeholder='Numero de Resolución' type='text' />
        </Form.Item>
        <Form.Item
          label='Fechas de Resolución'
          name='dian_resolution_dates'
          rules={[{ required: true, message: 'Campo requerido' }]}
        >
          <RangePicker format={dateFormat} picker='date' />
        </Form.Item>
        <Form.Item
          label='Habilita desde'
          name='from_number'
          rules={[{ required: true, message: 'Campo requerido' }]}
        >
          <Input placeholder='Habilita desde' type='number' />
        </Form.Item>
        <Form.Item
          label='Habilita hasta'
          name='to_number'
          rules={[{ required: true, message: 'Campo requerido' }]}
        >
          <Input placeholder='Habilita hasta' type='number' />
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={false}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddDianResolutionForm
