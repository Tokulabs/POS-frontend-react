import { IconCircleCheckFilled, IconAlertCircleFilled } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

interface UploadResultsProps {
  productos: string[]
  errores: string[]
  mensajeError?: string
  onFixErrors?: () => void
  type?: 'import' | 'update'
}

export default function UploadResults({
  productos = [],
  errores = [],
  mensajeError,
  onFixErrors,
  type = 'import',
}: UploadResultsProps) {
  const tituloProductos = type === 'update' ? 'Productos actualizados' : 'Nuevos Productos'
  console.log('Productos:', productos)
  console.log('Errores:', errores)

  const hayProductos = productos.length > 0
  const hayErrores = errores.length > 0

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
            hayProductos && hayErrores ? 'justify-between' : 'justify-center'
          }`}
        >
          {hayProductos && (
            <div className='bg-gray-50 rounded-lg shadow-sm border p-4 w-full max-w-md'>
              <div className='flex items-center gap-2 mb-4'>
                <IconCircleCheckFilled className='text-green-600' size={22} />
                <span className='font-semibold text-green-700'>{tituloProductos}</span>
              </div>
              <ul className='divide-y text-gray-800 text-sm max-h-80 overflow-y-auto'>
                {productos.map((code, i) => (
                  <li key={i} className='py-1'>
                    {code}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hayErrores && (
            <div className='bg-gray-50 rounded-lg shadow-sm border p-4 w-full max-w-md'>
              <div className='flex items-center gap-2 mb-2 font-semibold'>
                <IconAlertCircleFilled className='text-red-600' size={28} />
                Errores
              </div>
              {mensajeError && <p className='text-red-600 text-sm mb-2'>{mensajeError}</p>}
              <ul className='divide-y text-gray-800 text-sm max-h-80 overflow-y-auto'>
                {errores.map((err, i) => (
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
            hayErrores && !hayProductos
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : hayProductos && !hayErrores
                ? 'bg-green-600 text-white hover:bg-green-700'
                : hayProductos && hayErrores
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hayErrores) {
              onFixErrors?.()
            } else if (hayProductos && !hayErrores) {
              navigate('/')
            }
          }}
          disabled={!hayProductos && !hayErrores}
        >
          {hayErrores && !hayProductos
            ? 'Solucionar errores'
            : hayProductos && !hayErrores
              ? 'Finalizar'
              : hayProductos && hayErrores
                ? 'Solucionar errores'
                : 'Sin resultados'}
        </button>
      </div>
    </div>
  )
}
