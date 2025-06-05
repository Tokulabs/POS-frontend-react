import { FC, useContext } from 'react'
import { formatDateTime } from '@/layouts/helpers/helpers'
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
          className='absolute left-0 top-24 -z-10 opacity-40 w-72 h-96'
          src={OverrideImage}
          alt='override_logo'
        />
      )}
      {state.user?.company.logo && (
        <img
          src={state.user?.company.logo}
          alt='logo_company'
          className='object-contain w-full h-32'
        />
      )}
      <h4 className='m-0'>{state.user?.company.name}</h4>
      <h5 className='m-0'>{`NIT. ${state.user?.company.nit}`}</h5>
      <h5 className='m-0'>COMPLEJO TURISTICO CATEDRAL DE SAL</h5>
      <section className='flex flex-col items-center justify-center gap-1'>
        <p className='m-0 text-sm'>Tel. +57 {state.user?.company.phone}</p>
        <p className='m-0 text-xs'>
          {`Documento informativo, pendiente expedición FE, ${dianResolution?.document_number}`}
        </p>
        <p className='m-0 text-xs'>{`del ${dianResolution?.from_date} Vigente hasta ${dianResolution?.to_date}`}</p>
        <p className='m-0 text-[0.75rem] mb-2'>
          habilita del {dianResolution?.from_number} al {dianResolution?.to_number}
        </p>
        <p className='self-start m-0 text-xs'>
          Nombre: {customerData.name} ID: {customerData.document_id}
        </p>
        <section className='flex items-center justify-between w-full'>
          <p className='m-0 text-xs text-start'>D. E ./P. O. S GUA-{invoiceNumber}</p>
          <p className='m-0 text-xs text-start'>
            Fec.{' '}
            {created_at ? formatDateTime(created_at, true, false) : formatDateTime(undefined, true)}
          </p>
        </section>
      </section>
      <article>
        <section className='grid grid-cols-4 w-full p-1 border-0 border-b-[1px] border-black border-solid'>
          <p className='m-0 text-sm font-bold text-left'>Cod.</p>
          <p className='m-0 text-sm font-bold text-left'>Descripción</p>
          <p className='m-0 text-sm font-bold text-right'>Cant.</p>
          <p className='m-0 text-sm font-bold text-right'>Subtotal</p>
        </section>
        <section className='border-0 border-b-[1px] border-black border-solid p-1'>
          {dataItems.map((item, index) => {
            return (
              <div key={index} className='grid w-full grid-cols-4 gap-2'>
                <p className='m-0 text-xs text-left truncate'>{item.code}</p>
                <p className='m-0 text-xs text-left uppercase'>{item.name}</p>
                <p className='m-0 text-xs text-right'>{item.quantity}</p>
                <p className='m-0 text-xs text-right'>{formatNumberToColombianPesos(item.total)}</p>
              </div>
            )
          })}
        </section>
        <section className='grid grid-cols-2 pt-3 border-0 border-b-[1px] border-black border-solid p-1'>
          <section className='text-xs font-bold text-right'>
            <p className='m-0 text-sm text-right'>Subtotal base</p>
            <p className='m-0 text-sm text-right'>IVA 19%</p>
            <p className='m-0 text-sm text-right'>Descuento</p>
            <p className='m-0 text-sm text-right'>Total</p>
          </section>
          <section className='text-xs text-right'>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(subtotalCOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(taxesIVACOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(discountCOP)}</p>
            <p className='m-0 text-sm text-right'>{formatNumberToColombianPesos(totalCOP)}</p>
          </section>
        </section>
        <section className='grid w-full grid-cols-4 p-1'>
          <p className='m-0 text-xs font-bold text-left'>Medio pago</p>
          <p className='m-0 text-xs font-bold text-right'>pago</p>
          <p className='m-0 text-xs font-bold text-right'>recibe</p>
          <p className='m-0 text-xs font-bold text-right'>camb</p>
        </section>
        <section className='p-1'>
          {paymentMethods.map((item, index) => {
            return (
              <div key={index} className='grid w-full grid-cols-4 gap-2'>
                <p className='m-0 text-xs text-left'>
                  {PaymentMethodsEnum[item.name as unknown as keyof typeof PaymentMethodsEnum]}
                  {item.transaction_code ? ` - ${item.transaction_code}` : ''}
                </p>
                <p className='m-0 text-xs text-right'>
                  {formatNumberToColombianPesos(item.paid_amount ?? 0)}
                </p>
                <p className='m-0 text-xs text-right'>
                  {formatNumberToColombianPesos(item.received_amount ?? 0)}
                </p>
                <p className='m-0 text-xs text-right'>
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
