import { IconCircleCheckFilled, IconAlertCircleFilled } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

interface UploadResultsProps {
  products: string[]
  errors: string[]
  errorMessage?: string
  onFixErrors?: () => void
  type?: 'import' | 'update'
}

export default function UploadResults({
  products = [],
  errors = [],
  errorMessage,
  onFixErrors,
  type = 'import',
}: UploadResultsProps) {
  const productsTitle = type === 'update' ? 'Productos actualizados' : 'Nuevos Productos'
  console.log('Productos:', products)
  console.log('Errores:', errors)

  const hasProducts = products.length > 0
  const hasErrors = errors.length > 0

  const navigate = useNavigate()

  return (
    <div className='flex flex-col w-full h-full bg-white'>
      <div className='flex flex-col items-start px-10 pt-10'>
        <h1 className='text-3xl font-semibold font-sans'>Resultados de la Carga de Productos</h1>
        <p className='text-gray-600 text-2xl'>
          A continuación, puede ver el resultado de la carga de productos:
        </p>
      </div>
      <h1 className='text-3xl font-semibold flex justify-center pt-8'>Resultados</h1>
      <div className='flex justify-center py-12'>
        <div
          className={`flex gap-8 w-full max-w-5xl ${
            hasProducts && hasErrors ? 'justify-between' : 'justify-center'
          }`}
        >
          {hasProducts && (
            <div className='bg-gray-50 rounded-lg shadow-lg border p-4 w-full max-w-md'>
              <div className='flex items-center gap-2 mb-4'>
                <IconCircleCheckFilled className='text-green-600' size={22} />
                <span className='font-semibold text-green-700'>{productsTitle}</span>
              </div>
              <ul className='divide-y text-gray-800 text-sm max-h-80 overflow-y-auto'>
                {products.map((code, i) => (
                  <li key={i} className='py-1'>
                    {code}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasErrors && (
            <div className='bg-gray-50 rounded-lg shadow-lg border p-4 w-full max-w-md'>
              <div className='flex items-center gap-2 mb-2 font-semibold'>
                <IconAlertCircleFilled className='text-red-600' size={28} />
                Errores
              </div>
              {errorMessage && <p className='text-red-600 text-sm mb-2'>{errorMessage}</p>}
              <ul className='divide-y text-gray-800 text-sm max-h-80 overflow-y-auto'>
                {errors.map((err, i) => (
                  <li key={i} className='py-1'>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end px-8 py-4 w-[80%]'>
        <button
          className={`w-48 py-2 rounded-md ${
            hasErrors && !hasProducts
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : hasProducts && !hasErrors
                ? 'bg-green-600 text-white hover:bg-green-700'
                : hasProducts && hasErrors
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasErrors) {
              onFixErrors?.()
            } else if (hasProducts && !hasErrors) {
              navigate('/')
            }
          }}
          disabled={!hasProducts && !hasErrors}
        >
          {hasErrors && !hasProducts
            ? 'Solucionar errores'
            : hasProducts && !hasErrors
              ? 'Finalizar'
              : hasProducts && hasErrors
                ? 'Solucionar errores'
                : 'Sin resultados'}
        </button>
      </div>
    </div>
  )
}
