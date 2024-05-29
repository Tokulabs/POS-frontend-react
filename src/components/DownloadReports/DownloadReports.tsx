import { FC } from 'react'
// Third Party
import { Modal, Form, DatePicker, Button, Select, Spin } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { IconDownload } from '@tabler/icons-react'
import { Moment } from 'moment'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
// Types
import { DataPropsForm } from '../../types/GlobalTypes'
// Axios
import { axiosRequest } from '../../api/api'
// Utils
import { downloadReportURL } from '../../utils/network'
// Helpers
import { getArrayDatesOrDateWithHour } from '../../layouts/helpers/helpers'
import { useRolePermissions } from '../../hooks/useRolespermissions'
import { UserRolesEnum } from '../../pages/Users/types/UserTypes'

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
const dateFormatHour = 'YYYY-MM-DD HH:mm:ss'

interface IModalDownloadReports {
  isVisible: boolean
  onSuccessCallback: () => void
  onCancelCallback: () => void
}

interface IReportToDownload {
  url: string
  name: string
  show: boolean
}

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

  const allowedRolesSales = [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin]
  const { hasPermission: hasPermissionSales } = useRolePermissions(allowedRolesSales)

  console.log('hasPermissionSales', hasPermissionSales)

  const reportsToDownload: IReportToDownload[] = [
    {
      url: 'daily_report_export/',
      name: 'Reporte Diario',
      show: true,
    },
    {
      url: 'inventories_report_export/',
      name: 'Reporte de inventarios',
      show: true,
    },
    {
      url: 'product_sales_report_export/',
      name: 'Reporte Ventas de Productos',
      show: true,
    },
    {
      url: 'invoices_report_export/',
      name: 'Reporte de Facturas',
      show: hasPermissionSales,
    },
    {
      url: 'electronic_invoice_export/',
      name: 'Reporte Facturación Electrónica',
      show: hasPermissionSales,
    },
  ]

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

    let newDates: string[]

    if (values['report_type'] === 'electronic_invoice_export/')
      newDates = getArrayDatesOrDateWithHour(dowloadDates, true)
    else newDates = getArrayDatesOrDateWithHour(dowloadDates, false)

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
                ...reportsToDownload
                  .filter((item) => item.show)
                  .map((report) => ({
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
                  <RangePicker
                    showTime={getFieldValue('report_type') === 'electronic_invoice_export/'}
                    style={{ width: '100%' }}
                    format={
                      getFieldValue('report_type') !== 'electronic_invoice_export/'
                        ? dateFormat
                        : dateFormatHour
                    }
                    picker='date'
                  />
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
