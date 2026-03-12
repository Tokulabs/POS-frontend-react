import { FC, PropsWithChildren } from 'react'
import { useHasProduct } from '@/hooks/useSubscription'

interface ProductGuardProps {
  /** Product slug to check, e.g. 'pos_inventory' or 'restaurant' */
  product: string
}

/**
 * Route wrapper that blocks access if the company doesn't have
 * an active subscription for the given product.
 *
 * Usage in router:
 *   <Route element={<ProductGuard product="pos_inventory" />}>
 *     <Route path="/pos" element={<POS />} />
 *   </Route>
 */
const ProductGuard: FC<PropsWithChildren<ProductGuardProps>> = ({ product, children }) => {
  const hasProduct = useHasProduct(product)

  if (!hasProduct) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4 p-8'>
        <div className='text-6xl'>🔒</div>
        <h2 className='text-2xl font-bold text-foreground'>Producto no disponible</h2>
        <p className='text-muted-foreground text-center max-w-md'>
          Tu empresa no tiene una suscripción activa para este producto.
          Contacta al administrador para activarla.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

export { ProductGuard }
