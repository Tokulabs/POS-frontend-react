import { DataPropsForm } from '@/types/GlobalTypes'
import { Button, Form } from 'antd'
import { FC, useState } from 'react'
import UpdatePasswordContainer from './InputPassword'

interface IAuthForm {
  onSubmit: (values: DataPropsForm) => void
  loading: boolean
}

export const ForceUpdatePassword: FC<IAuthForm> = ({ onSubmit, loading }) => {
  const [allValid, setAllValid] = useState(false)

  const handleAllValid = (value: boolean) => {
    setAllValid(value)
  }

  return (
    <Form layout='vertical' onFinish={onSubmit}>
      <UpdatePasswordContainer handleAllValid={handleAllValid} />
      <Form.Item>
        <Button htmlType='submit' type='primary' block loading={loading} disabled={!allValid}>
          Confirmar
        </Button>
      </Form.Item>
    </Form>
  )
}
