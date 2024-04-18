import { useEffect, useRef, useState } from 'react'
// Hooks
import { useDianResolutions } from '../../../hooks/useDianResolution'
// Third party
import { Button, Select, Spin } from 'antd'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { IconPlus } from '@tabler/icons-react'
// Components
import Clock from '../../../components/Clock/Clock'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
// Helpers
import { getCustomers } from '../helpers/services'
// Types
import { ICustomerProps } from './types/CustomerTypes'

export const AddDataAndPaymentMethods = () => {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [value, setValue] = useState<string>()
  const [data, setData] = useState<ICustomerProps[]>([])

  const queryClient = useQueryClient()

  const { dianResolutionData, isLoading: isLoadingResolution } = useDianResolutions(
    'allDianResolutions',
    {},
  )
  const { toggleModalAddCustomer } = useCustomerData()

  const fetchCustomersByKeyword = async (keyword: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['customerByKeyword'],
        queryFn: async () => getCustomers({ keyword }),
      })
      setData(data?.results || [])
    } catch (error) {
      const e = error as AxiosError
      console.error(e)
    } finally {
      setIsLoadingSearch(false)
    }
  }

  const handleChange = (newValue: string) => {
    const item = data.filter((item) => item.document_id === newValue)[0]
    setValue(newValue)
    // TODO what happen when select a customer
    setValue(null as unknown as string)
  }

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
  }

  const debouncedSearch = useRef(
    debounce(async (criteria) => {
      fetchCustomersByKeyword(criteria)
    }, 300),
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <section className='flex flex-col gap-3 h-full justify-between'>
      {isLoadingResolution ? (
        <Spin />
      ) : (
        <section className='flex flex-col h-full justify-start gap-1'>
          <div className='flex justify-between items-end'>
            <span className='text-xs'>Resolución activa:</span>
            <span className='text-green-1 font-bold truncate'>
              {dianResolutionData?.results[0].document_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs'># de factura:</span>

            <span className='text-green-1 font-bold truncate'>
              GUA-{dianResolutionData?.results[0].current_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs'>Fecha y Hora:</span>
            <span className='text-green-1 font-bold truncate'>
              <Clock />
            </span>
          </div>
        </section>
      )}
      <section>
        <Select
          loading={isLoadingSearch}
          size='large'
          showSearch
          style={{ width: '100%' }}
          value={value}
          placeholder='Buscar Cliente'
          suffixIcon={null}
          filterOption={false}
          onSearch={handleSearch}
          onChange={handleChange}
          notFoundContent={true}
          placement='topLeft'
        >
          {data.map((item) => (
            <Select.Option key={item.document_id} value={item.document_id}>
              <div className='flex gap-6 items-center my-2'>
                <span className='h-full'>
                  {item.name} - {item.document_id}
                </span>
              </div>
            </Select.Option>
          ))}
          <Select.Option key={'search-id'} value={'search-id'}>
            <Button
              type='primary'
              icon={<IconPlus />}
              size='large'
              style={{
                display: 'flex',
                justifyItems: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '1rem',
              }}
              onClick={() => toggleModalAddCustomer(true)}
            >
              Agregar Cliente
            </Button>
          </Select.Option>
        </Select>
      </section>
      {/* <section>
        <span className='text-green-1 text-lg font-bold'>Datos del cliente</span>
        <div className='flex flex-col gap-1 items-start'>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Nombre:</span>
            <span className='font-bold truncate'>{customer.name ? customer.name : 'N/A'}</span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Documento:</span>
            <span className='font-bold truncate'>
              {customer.idNumber ? customer.idNumber : 'N/A'}
            </span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Teléfono:</span>
            <span className='font-bold truncate'>{customer.phone ? customer.phone : 'N/A'}</span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Dirección:</span>
            <span className='font-bold truncate'>
              {customer.address ? customer.address : 'N/A'}
            </span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Correo:</span>
            <span className='font-bold truncate'>{customer.email ? customer.email : 'N/A'}</span>
          </div>
        </div>
      </section> */}
    </section>
  )
}
