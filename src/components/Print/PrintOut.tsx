import { FC } from 'react'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { IPurchaseProps } from '../../pages/Purchase/types/PurchaseTypes'
import { getTotal } from './../../pages/Purchase/helpers/PurchaseHelpers'

const PrintOut: FC<{ data: IPurchaseProps[]; user: string; shopName: string }> = ({
  data,
  user,
  shopName,
}) => {
  const { iva, subTotalBase, total } = getTotal(data)

  return (
    <article className='bg-white flex flex-col w-80 justify-center items-center text-center p-4 gap-2'>
      <div>[Logo Signos]</div>
      <h4>Signos Studio SAS</h4>
      <h5>NIT. 832004603-8</h5>
      <h5>COMPLEJO TURISTICO CATEDRAL DE SAL</h5>
      <section className='flex flex-col justify-center items-center gap-1'>
        <p className='m-0 text-sm'>Tel. (091) 851 0935/0654</p>
        <p className='m-0 text-xs'>
          Documento oficial Nro, [Numero del documento] del [Fecha de inicio]. Vigente hasta [Fecha
          Final]
        </p>
        <p className='m-0 text-[0.75rem] mb-2'>habilita del [xxxxxxx] al [xxxxxx]</p>
        <p className='m-0 text-xs self-start'>
          Nombre: [Nombre del cLiente] Nit: [Nit del cliente]
        </p>
        <section className='flex justify-between items-center w-full'>
          <p className='m-0 text-xs text-start'>D. E ./P. O. S {shopName}-[numero C]</p>
          <p className='m-0 text-xs text-start'>Fec. {formatDateTime(undefined, true)}</p>
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
                <p className='m-0 text-right text-xs'>{item.total}</p>
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
            <p className='m-0 text-right text-sm'>{subTotalBase}</p>
            <p className='m-0 text-right text-sm'>{iva}</p>
            <p className='m-0 text-right text-sm'>0</p>
            <p className='m-0 text-right text-sm'>{total}</p>
          </section>
        </section>
        <section className='grid grid-cols-4 w-full p-1'>
          <p className='m-0 text-left text-xs font-bold'>Medio pago</p>
          <p className='m-0 text-right text-xs font-bold'>pago</p>
          <p className='m-0 text-right text-xs font-bold'>recibe</p>
          <p className='m-0 text-right text-xs font-bold'>camb</p>
        </section>
        <section className='p-1'>
          <div className='grid grid-cols-4 w-full gap-2'>
            <p className='m-0 text-left text-xs'>Transf. Nequi M12342</p>
            <p className='m-0 text-right text-xs'>70000</p>
            <p className='m-0 text-right text-xs'>700000</p>
            <p className='m-0 text-right text-xs'>0</p>
          </div>
        </section>
      </article>
      <h5 className='self-start'>Venderdor: {user}</h5>
      <h4 className='font-bold uppercase'>GRACIAS POR SU COMPRA !!!!</h4>
    </article>
  )
}

export default PrintOut
