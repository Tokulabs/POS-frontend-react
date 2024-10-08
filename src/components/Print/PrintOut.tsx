import { FC, useContext } from 'react'
import { formatDateTime } from '@/layouts/helpers/helpers'
import LogoSignos from '@/assets/logos/signos_logo.png'
import { calcTotalPrices, formatNumberToColombianPesos } from '@/utils/helpers'
import OverrideImage from '@/assets/logos/images.png'
import { PaymentMethodsEnum } from '@/pages/POS/components/types/PaymentMethodsTypes'
import { IPrintData } from '@/types/GlobalTypes'
import { store } from '@/store'

interface IPrintCOmponent {
  printDataComponent: IPrintData
}

const PrintOut: FC<IPrintCOmponent> = ({ printDataComponent }) => {
  const { state } = useContext(store)

  const {
    customerData,
    dataItems,
    paymentMethods,
    saleBy,
    dianResolution,
    invoiceNumber,
    isOverride,
    created_at,
  } = printDataComponent

  const { discountCOP, taxesIVACOP, totalCOP, subtotalCOP } = calcTotalPrices(dataItems)

  return (
    <article className='bg-transparent flex flex-col w-[18.5rem] justify-center items-center text-center p-2 gap-1 relative'>
      {isOverride && (
        <img
          className='absolute top-24 left-0 -z-10 opacity-40 w-72 h-96'
          src={OverrideImage}
          alt=''
        />
      )}
      <img src={LogoSignos} alt='Logo signos' className='w-full h-20 object-cover' />
      <h4 className='m-0'>{state.user?.company.name}</h4>
      <h5 className='m-0'>{`NIT. ${state.user?.company.nit}`}</h5>
      <h5 className='m-0'>COMPLEJO TURISTICO CATEDRAL DE SAL</h5>
      <section className='flex flex-col justify-center items-center gap-1'>
        <p className='m-0 text-sm'>Tel. +57 3133779890</p>
        <p className='m-0 text-xs'>
          {`Documento informativo, pendiente expedición FE, ${dianResolution?.document_number}`}
        </p>
        <p className='m-0 text-xs'>{`del ${dianResolution?.from_date} Vigente hasta ${dianResolution?.to_date}`}</p>
        <p className='m-0 text-[0.75rem] mb-2'>
          habilita del {dianResolution?.from_number} al {dianResolution?.to_number}
        </p>
        <p className='m-0 text-xs self-start'>
          Nombre: {customerData.name} ID: {customerData.document_id}
        </p>
        <section className='flex justify-between items-center w-full'>
          <p className='m-0 text-xs text-start'>D. E ./P. O. S GUA-{invoiceNumber}</p>
          <p className='m-0 text-xs text-start'>
            Fec.{' '}
            {created_at ? formatDateTime(created_at, true, false) : formatDateTime(undefined, true)}
          </p>
        </section>
      </section>
      <article>
        <section className='grid grid-cols-4 w-full p-1 border-0 border-b-[1px] border-black border-solid'>
          <p className='m-0 text-left text-sm font-bold'>Cod.</p>
          <p className='m-0 text-left text-sm font-bold'>Descripción</p>
          <p className='m-0 text-right text-sm font-bold'>Cant.</p>
          <p className='m-0 text-right text-sm font-bold'>Subtotal</p>
        </section>
        <section className='border-0 border-b-[1px] border-black border-solid p-1'>
          {dataItems.map((item, index) => {
            return (
              <div key={index} className='grid grid-cols-4 w-full gap-2'>
                <p className='m-0 text-left text-xs truncate'>{item.code}</p>
                <p className='m-0 text-left text-xs uppercase'>{item.name}</p>
                <p className='m-0 text-right text-xs'>{item.quantity}</p>
                <p className='m-0 text-right text-xs'>{formatNumberToColombianPesos(item.total)}</p>
              </div>
            )
          })}
        </section>
        <section className='grid grid-cols-2 pt-3 border-0 border-b-[1px] border-black border-solid p-1'>
          <section className='text-xs text-right font-bold'>
            <p className='m-0 text-right text-sm'>Subtotal base</p>
            <p className='m-0 text-right text-sm'>IVA 19%</p>
            <p className='m-0 text-right text-sm'>Descuento</p>
            <p className='m-0 text-right text-sm'>Total</p>
          </section>
          <section className='text-xs text-right'>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(subtotalCOP)}</p>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(taxesIVACOP)}</p>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(discountCOP)}</p>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(totalCOP)}</p>
          </section>
        </section>
        <section className='grid grid-cols-4 w-full p-1'>
          <p className='m-0 text-left text-xs font-bold'>Medio pago</p>
          <p className='m-0 text-right text-xs font-bold'>pago</p>
          <p className='m-0 text-right text-xs font-bold'>recibe</p>
          <p className='m-0 text-right text-xs font-bold'>camb</p>
        </section>
        <section className='p-1'>
          {paymentMethods.map((item, index) => {
            return (
              <div key={index} className='grid grid-cols-4 w-full gap-2'>
                <p className='m-0 text-left text-xs'>
                  {PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum]}
                  {item.transaction_code ? ` - ${item.transaction_code}` : ''}
                </p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.paid_amount ?? 0)}
                </p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.received_amount ?? 0)}
                </p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.back_amount ?? 0)}
                </p>
              </div>
            )
          })}
        </section>
      </article>
      <h5 className='self-start'>Venderdor: {saleBy.fullname}</h5>
      <h4 className='font-bold uppercase'>GRACIAS POR SU COMPRA !!!!</h4>
    </article>
  )
}

export default PrintOut
