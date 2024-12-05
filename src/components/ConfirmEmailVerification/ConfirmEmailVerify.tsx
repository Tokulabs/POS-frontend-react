import { FC } from 'react'
// Third Party
import { Modal, Form, Button, Spin, Input } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
// Types
import { DataPropsForm } from '@/types/GlobalTypes'
import { IAuthProps } from '@/types/AuthTypes'
// Axios
import { axiosRequest } from '@/api/api'
// Utils
import { confirmEmailCode } from '@/utils/network'
// Hooks
import { useAuth } from '@/hooks/useAuth'

interface IModalDownloadReports {
  isVisible: boolean
  onSuccessCallback: () => void
  onCancelCallback: () => void
}

const confirmEmailVerify = async (payload: DataPropsForm) => {
  const response = await axiosRequest({
    url: confirmEmailCode,
    method: 'post',
    hasAuth: true,
    showError: true,
    payload: payload,
  })
  if (response) {
    return response
  }
}

const ConfirmEmailVerification: FC<IModalDownloadReports> = ({
  isVisible,
  onCancelCallback,
  onSuccessCallback,
}) => {
  const [form] = useForm()
  const navigate = useNavigate()
  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  const { checkUser } = useAuth(AuthProps)

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: confirmEmailVerify,
    onSuccess: () => {
      onSuccessCallback()
      toast.success('Email verificado con éxito!')
      form.resetFields()
      checkUser()
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading) return
    if (!values || values === null) return
    mutate(values)
  }

  return (
    <Modal
      title='Verifica tu correo'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
    >
      {isLoading ? (
        <div className='flex justify-center items-center gap-2'>
          <Spin />
          <span>Verificando...</span>
        </div>
      ) : (
        <Form layout='vertical' onFinish={onSubmit} form={form}>
          <Form.Item
            label='Codigo de confirmación'
            name='code'
            rules={[{ required: true, message: 'Debes ingresar un código' }]}
          >
            <Input.OTP formatter={(str) => str.toUpperCase()} size='large' />
          </Form.Item>
          <Form.Item>
            <Button htmlType='submit' type='primary' block loading={false}>
              <span>Confirmar</span>
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}

export { ConfirmEmailVerification }
