import { FC } from 'react'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { PaymentMethodsEnum } from '../../pages/Purchase/types/PurchaseTypes'
import { getTotal } from './../../pages/Purchase/helpers/PurchaseHelpers'
import LogoSignos from './../../assets/logos/signos_logo.png'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { IPrintData } from '../../types/GlobalTypes'
import OverrideImage from '../../../public/images.png'

const PrintOut: FC<{
  printData: IPrintData
}> = ({ printData }) => {
  const {
    customerData,
    data,
    paymentMethods,
    saleName,
    date,
    dianResolution,
    invoiceNumber,
    isOverride,
  } = printData
  const { iva, subTotalBase, total } = getTotal(data)

  return (
    <article className='bg-transparent flex flex-col w-80 justify-center items-center text-center p-4 gap-2 relative'>
      {isOverride && (
        <img
          className='absolute top-24 left-0 -z-10 opacity-40 w-72 h-96'
          src={OverrideImage}
          alt=''
        />
      )}
      <img src={LogoSignos} alt='Logo signos' className='w-full h-20 object-cover' />
      <h4 className='m-0'>Signos Studio SAS</h4>
      <h5 className='m-0'>NIT. 832004603-8</h5>
      <h5 className='m-0'>COMPLEJO TURISTICO CATEDRAL DE SAL</h5>
      <section className='flex flex-col justify-center items-center gap-1'>
        <p className='m-0 text-sm'>Tel. (091) 851 0935/0654</p>
        <p className='m-0 text-xs'>
          {`Documento oficial Nro, ${dianResolution.document_number}\n del ${dianResolution.from_date} Vigente hasta ${dianResolution.to_date}`}
        </p>
        <p className='m-0 text-[0.75rem] mb-2'>
          habilita del {dianResolution.from_number} al {dianResolution.to_number}
        </p>
        <p className='m-0 text-xs self-start'>
          Nombre: {customerData.customerName} ID: {customerData.customerId}
        </p>
        <section className='flex justify-between items-center w-full'>
          <p className='m-0 text-xs text-start'>D. E ./P. O. S GUA-{invoiceNumber}</p>
          <p className='m-0 text-xs text-start'>
            Fec. {date ? formatDateTime(date, true, false) : formatDateTime(undefined, true)}
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
          {data.map((item, index) => {
            return (
              <div key={index} className='grid grid-cols-4 w-full gap-2'>
                <p className='m-0 text-left text-xs truncate'>{item.code}</p>
                <p className='m-0 text-left text-xs uppercase'>{item.item}</p>
                <p className='m-0 text-right text-xs'>{item.qty}</p>
                <p className='m-0 text-right text-xs'>{formatNumberToColombianPesos(item.total)}</p>
              </div>
            )
          })}
        </section>
        <section className='grid grid-cols-2 pt-3 border-0 border-b-[1px] border-black border-solid p-1'>
          <section className='text-xs text-right font-bold'>
            <p className='m-0 text-right text-sm'>Subtotal base</p>
            <p className='m-0 text-right text-sm'>IVA 19%</p>
            <p className='m-0 text-right text-sm'>INC</p>
            <p className='m-0 text-right text-sm'>Total</p>
          </section>
          <section className='text-xs text-right'>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(subTotalBase)}</p>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(iva)}</p>
            <p className='m-0 text-right text-sm'>0</p>
            <p className='m-0 text-right text-sm'>{formatNumberToColombianPesos(total)}</p>
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
                <p className='m-0 text-left text-xs'>{PaymentMethodsEnum[item.name]}</p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.paid_amount)}
                </p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.received_amount)}
                </p>
                <p className='m-0 text-right text-xs'>
                  {formatNumberToColombianPesos(item.back_amount)}
                </p>
              </div>
            )
          })}
        </section>
      </article>
      <h5 className='self-start'>Venderdor: {saleName}</h5>
      <h4 className='font-bold uppercase'>GRACIAS POR SU COMPRA !!!!</h4>
    </article>
  )
}

export default PrintOut
