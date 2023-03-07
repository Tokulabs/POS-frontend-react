import { Form, Modal, Button, notification } from 'antd'
import { ChangeEvent, FC, useState } from 'react'
import { inventoryCSVURL } from '../../../utils/network'
import { useForm } from 'antd/es/form/Form'
import { axiosRequest } from '../../../api/api'
import { IModalFormProps } from '../../../types/ModalTypes'

const AddInventoryFormCSV: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const [loading, setLoading] = useState(false)
  const [csvFile, setCSVFile] = useState<File | null>(null)

  const onSubmit = async () => {
    try {
      setLoading(true)

      if (!csvFile) return

      const formItem = new FormData()
      formItem.append('data', csvFile)

      const response = await axiosRequest({
        method: 'post',
        url: inventoryCSVURL,
        hasAuth: true,
        payload: formItem,
      })
      if (response) {
        onSuccessCallback()
        notification.success({
          message: 'Exito',
          description: 'Productos creado!',
        })
        form.resetFields()
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setCSVFile(e.target.files[0])
  }

  return (
    <Modal
      title='Agregar Productos (.csv)'
      open={isVisible}
      onOk={onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form}>
        <Form.Item
          label='Selecciona un archivo'
          rules={[{ required: true, message: 'Porfavor selecciona un archivo' }]}
        >
          <input type='file' accept='.csv' onChange={handleFileChange} />
        </Form.Item>
        <a href='/inventory_sample.csv' download>
          Descarga el archivo de ejemplo
        </a>
        <h4 className='text-red-600 mb-5'>
          Recuerda: No incluir los titulos de las columnas, son solo para referencia
        </h4>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddInventoryFormCSV
