import { useEffect, useRef, useState } from 'react'
// Third party
import { Button, Select } from 'antd'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { IconEdit, IconPlus } from '@tabler/icons-react'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
import { useUsers } from '../../../hooks/useUsers'
import { useCart } from '../../../store/useCartStoreZustand'
// Helpers
import { getCustomers } from '../helpers/services'
// Types
import { ICustomerProps } from './types/CustomerTypes'

export const AddDataAndPaymentMethods = () => {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [value, setValue] = useState<string>()
  const [data, setData] = useState<ICustomerProps[]>([])

  const queryClient = useQueryClient()

  const { usersData } = useUsers('allUsers', { keyword: 'sales', is_active: 'True' })

  const { toggleModalAddCustomer, updateCustomerData, customer } = useCustomerData()
  const { saleById, updateSaleById } = useCart()

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
    if (newValue === 'search-id') {
      toggleModalAddCustomer(true, false)
      setValue(null as unknown as string)
    } else {
      const item = data.filter((item) => item.document_id === newValue)[0]
      setValue(newValue)
      updateCustomerData({
        id: item.id as number,
        name: item.name,
        idNumber: item.document_id,
        documentType: item.document_type,
        phone: item.phone || '',
        address: item.address || '',
        email: item.email,
      })
      setValue(null as unknown as string)
    }
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
    <section className='flex flex-col h-full gap-3 justify-start p-5 overflow-hidden overflow-y-scroll scrollbar-hide '>
      <section>
        <h1 className='font-bold text-xl text-green-1'>Vendedor</h1>
        <Select
          value={saleById}
          style={{ width: '100%' }}
          size='large'
          placeholder='Selecciona una vendedor'
          onChange={(value) => updateSaleById(value as number)}
          options={[
            { value: '', label: 'Selecciona un vendedor' },
            ...(usersData?.results ?? []).map((item) => ({
              value: item.id,
              label: item.fullname,
            })),
          ]}
        />
      </section>
      <section>
        <h1 className='font-bold text-xl text-green-1'>Cliente</h1>
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
                marginTop: data.length > 0 ? '0.5rem' : '0',
                marginBottom: data.length > 0 ? '0.5rem' : '0',
              }}
            >
              Agregar Cliente
            </Button>
          </Select.Option>
        </Select>
      </section>
      {customer && (
        <section>
          {!customer.idNumber ? (
            <span className='text-xs text-red-1'>Se requiere datos del cliente *</span>
          ) : (
            <>
              <div className='flex items-center gap-5'>
                <span className='text-green-1 text-lg font-bold'>Datos del cliente</span>
                <IconEdit
                  onClick={() => {
                    toggleModalAddCustomer(true, true)
                  }}
                  size={20}
                  className='text-green-1 cursor-pointer hover:text-green-800'
                />
              </div>
              <div className='flex flex-col gap-1 items-start'>
                <div className='flex flex-col justify-between'>
                  <span className='text-xs font-semibold'>Nombre:</span>
                  <span className='font-bold truncate text-sm'>
                    {customer.name ? customer.name : 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col justify-between'>
                  <span className='text-xs font-semibold'>Documento:</span>
                  <span className='font-bold truncate text-sm'>
                    {customer.documentType} {customer.idNumber ? customer.idNumber : 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col justify-between'>
                  <span className='text-xs font-semibold'>Teléfono:</span>
                  <span className='font-bold truncate text-sm'>
                    {customer.phone ? customer.phone : 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col justify-between'>
                  <span className='text-xs font-semibold'>Dirección:</span>
                  <span className='font-bold truncate text-sm'>
                    {customer.address ? customer.address : 'N/A'}
                  </span>
                </div>
                <div className='flex flex-col justify-between'>
                  <span className='text-xs font-semibold'>Correo:</span>
                  <span className='font-bold truncate text-sm'>
                    {customer.email ? customer.email : 'N/A'}
                  </span>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </section>
  )
}
