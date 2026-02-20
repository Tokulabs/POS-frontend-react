import { IconCircleCheckFilled, IconAlertCircleFilled } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

interface UploadResultsProps {
  products: string[]
  errors: string[]
  errorMessage?: string
  onFixErrors?: () => void
  onFinish?: () => void
  type?: 'import' | 'update'
}

export default function UploadResults({
  products = [],
  errors = [],
  errorMessage,
  onFixErrors,
  onFinish,
  type = 'import',
}: UploadResultsProps) {
  const productsTitle = type === 'update' ? 'Productos actualizados' : 'Nuevos Productos'
  const hasProducts = products.length > 0
  const hasErrors = errors.length > 0

  const navigate = useNavigate()

  return (
    <div className='flex flex-col w-full h-full bg-card p-8 md:p-10 overflow-y-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100'>
          Resultados de la Carga de Productos
        </h1>
        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          A continuación, puede ver el resultado de la carga de productos:
        </p>
      </div>

      {/* Results */}
      <div className={`grid gap-6 ${
        hasProducts && hasErrors ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg'
      }`}>
        {hasProducts && (
          <div className='rounded-2xl border border-green-200 dark:border-green-800/40 bg-white dark:bg-zinc-800/50 shadow-xs p-6'>
            <div className='flex items-center gap-2.5 mb-4'>
              <IconCircleCheckFilled className='text-green-600 dark:text-green-400' size={22} />
              <span className='font-semibold text-green-700 dark:text-green-400 text-base'>{productsTitle}</span>
            </div>
            <ul className='divide-y divide-zinc-100 dark:divide-zinc-700/60 text-sm text-zinc-800 dark:text-zinc-300 max-h-80 overflow-y-auto'>
              {products.map((code, i) => (
                <li key={i} className='py-2'>
                  {code}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasErrors && (
          <div className='rounded-2xl border border-red-200 dark:border-red-800/40 bg-white dark:bg-zinc-800/50 shadow-xs p-6'>
            <div className='flex items-center gap-2.5 mb-4'>
              <IconAlertCircleFilled className='text-red-600 dark:text-red-400' size={22} />
              <span className='font-semibold text-red-700 dark:text-red-400 text-base'>Errores</span>
            </div>
            {errorMessage && (
              <p className='text-red-600 dark:text-red-400 text-sm mb-3'>{errorMessage}</p>
            )}
            <ul className='divide-y divide-zinc-100 dark:divide-zinc-700/60 text-sm text-zinc-800 dark:text-zinc-300 max-h-80 overflow-y-auto'>
              {errors.map((err, i) => (
                <li key={i} className='py-2'>
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className='flex justify-end mt-8'>
        <button
          className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            hasErrors && !hasProducts
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              : hasProducts && !hasErrors
                ? 'bg-green-1 text-white hover:bg-green-700'
                : hasProducts && hasErrors
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasErrors) {
              onFixErrors?.()
            } else if (hasProducts && !hasErrors) {
              onFinish ? onFinish() : navigate('/inventory-management')
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

