import { Modal, Form, DatePicker, Button, Select, Spin } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC } from 'react'
import { DataPropsForm } from '../../types/GlobalTypes'
import { IconDownload } from '@tabler/icons-react'
import { Moment } from 'moment'
import { axiosRequest } from '../../api/api'
import { useMutation } from '@tanstack/react-query'
import { downloadReportURL } from '../../utils/network'
import { toast } from 'sonner'

export const downloadReport = async (data: { payload: DataPropsForm | undefined; url: string }) => {
  const response = await axiosRequest({
    url: downloadReportURL + data.url,
    method: 'post',
    hasAuth: true,
    showError: true,
    payload: data.payload ? data.payload : undefined,
    isFile: true,
  })
  if (response) {
    const contentDisposition = response.headers['content-disposition']
    const fileName = contentDisposition.split('filename=')[1].trim().split(';')[0].replace(/"/g, '')
    const url = URL.createObjectURL(new Blob([response.data as Blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName.toString())
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

const { RangePicker } = DatePicker
const dateFormat = 'YYYY-MM-DD'

interface IModalDownloadReports {
  isVisible: boolean
  onSuccessCallback: () => void
  onCancelCallback: () => void
}

interface IReportToDownload {
  url: string
  name: string
}

const reportsToDownload: IReportToDownload[] = [
  {
    url: 'daily_report_export/',
    name: 'Reporte Diario',
  },
  {
    url: 'inventories_report_export/',
    name: 'Reporte de inventarios',
  },
  {
    url: 'product_sales_report_export/',
    name: 'Reporte Ventas de Productos',
  },
  {
    url: 'invoices_report_export/',
    name: 'Reporte de Facturas',
  },
  {
    url: 'factura_electronica_export/',
    name: 'Reporte Facturación Electrónica',
  },
]

const DownloadReports: FC<IModalDownloadReports> = ({
  isVisible,
  onCancelCallback,
  onSuccessCallback,
}) => {
  const [form] = useForm()
  const initialValues = {
    report_type: 'daily_report_export/',
    document_dates: [],
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: downloadReport,
    onSuccess: () => {
      onSuccessCallback()
      toast.success('Reporte descargado!')
      form.resetFields()
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading) return
    if (!values || values === null) return

    if (values['report_type'] === 'inventories_report_export/') {
      mutate({ payload: undefined, url: values['report_type'] })
      return
    }
    const dowloadDates: Moment[] = values['document_dates'] as Moment[]
    const newDates = dowloadDates.map((date) => {
      const year = date.year()
      const month = date.month()
      const day = date.date()
      const newDate = new Date(year, month, day)
      return newDate.toISOString().split('T')[0]
    })

    mutate({
      payload: { start_date: newDates[0], end_date: newDates[1] },
      url: values['report_type'] as string,
    })
  }

  return (
    <Modal
      title='Descarga de reportes'
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
          <span>Descargando...</span>
        </div>
      ) : (
        <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={initialValues}>
          <Form.Item
            style={{ width: '100%' }}
            label='Tipo de cuenta'
            name='report_type'
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder='Selecciona el Reporte a Descargar'
              options={[
                ...reportsToDownload.map((report) => ({
                  value: report.url,
                  label: report.name,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues['report_type'] !== currentValues['report_type']
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('report_type') !== 'inventories_report_export/' ? (
                <Form.Item
                  style={{ width: '100$' }}
                  name='document_dates'
                  label='Fechas del reporte'
                  rules={[{ required: true }]}
                >
                  <RangePicker style={{ width: '100%' }} format={dateFormat} picker='date' />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item>
            <Button htmlType='submit' type='primary' block loading={false}>
              <div className='flex items-center justify-center gap-3'>
                <IconDownload size={18} />
                <span>Descargar</span>
              </div>
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}

export { DownloadReports }
