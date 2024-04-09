import { useState, FC } from 'react'
// Components
import { AddItemsToPurchase } from './AddItemsToPurchase'
// Third Party
import { Button, Divider, Steps } from 'antd'
import { IconPlus } from '@tabler/icons-react'
// Helpers
import { checkIfObjectHasEmptyFields } from '../../../utils/helpers'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
import { useCart } from '../../../store/useCartStoreZustand'

const steps = [
  {
    title: 'Agregar Productos',
    content: <AddItemsToPurchase />,
  },
  {
    title: 'Métodos de Pago',
    content: 'Second-content',
  },
  {
    title: 'Confirmar Venta',
    content: 'Last-content',
  },
]

export const POSStepper: FC = () => {
  const [current, setCurrent] = useState(0)
  const { toggleModalAddCustomer, customer } = useCustomerData()
  const { cartItems } = useCart()

  const next = () => {
    setCurrent(current + 1)
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const items = steps.map((item) => ({ key: item.title, title: item.title }))

  return (
    <section className='h-full flex flex-col justify-between'>
      <header className='flex flex-col'>
        <Steps current={current} items={items} />
        <Divider />
        <section className='w-full flex flex-col border-t-2 gap-4'>
          <div className='flex justify-between items-end'>
            <h1 className='text-2xl font-semibold text-green-1 m-0'>Crear Venta</h1>
            <Button
              type='primary'
              icon={<IconPlus />}
              size='large'
              style={{ display: 'flex', justifyItems: 'center', alignItems: 'center' }}
              onClick={() => toggleModalAddCustomer(true)}
            >
              {checkIfObjectHasEmptyFields(customer) ? 'Editar Cliente' : 'Agregar Cliente'}
            </Button>
          </div>
          <div>{steps[current].content}</div>
        </section>
      </header>
      <footer className='flex justify-end'>
        {current === 0 && (
          <Button type='primary' onClick={() => next()} disabled={!cartItems.length}>
            Siguiente
          </Button>
        )}
        {current === 1 && (
          <Button type='primary' onClick={() => next()}>
            Pagar
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Volver
          </Button>
        )}
      </footer>
    </section>
  )
}
