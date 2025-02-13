// Third party
import { Select } from 'antd'
// Store
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { useUsers } from '@/hooks/useUsers'
import { useCart } from '@/store/useCartStoreZustand'
// Hooks
import { DialogAddUser } from './DialogAddUser'

export const AddDataAndPaymentMethods = () => {
  const { usersData } = useUsers('allUsers', { keyword: 'sales', is_active: 'True' })

  const { customer } = useCustomerData()
  const { saleById, updateSaleById } = useCart()

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
        <DialogAddUser />
      </section>
      <section>
        {!customer.idNumber ? (
          <span className='text-xs text-red-1'>Se requiere datos del cliente *</span>
        ) : (
          <>
            <div className='flex items-center gap-5'>
              <span className='text-green-1 text-lg font-bold'>Datos del cliente</span>
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
                <span className='text-xs font-semibold'>Ciudad:</span>
                <span className='font-bold truncate text-sm'>
                  {customer.city ? customer.city : 'N/A'}
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
    </section>
  )
}
