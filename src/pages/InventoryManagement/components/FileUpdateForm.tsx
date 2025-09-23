import { useState } from 'react'
import { IconDownload, IconUpload, IconLoader2, IconArrowLeft } from '@tabler/icons-react'

interface FileUploadFormProps {
  title: string
  description: string
  onFileChange: (file: File | null) => void
  file: File | null
  onUpload: () => void
  isLoading: boolean
  onBack?: () => void
  showErrorBanner?: boolean
}

export default function FileUploadForm({
  title,
  description,
  onFileChange,
  file,
  onUpload,
  isLoading,
  onBack,
  showErrorBanner = false,
}: FileUploadFormProps) {
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 1 * 1024 * 1024 || selectedFile.type !== 'text/csv') {
        // 1 MB & CSV
        setFileError(
          'Hemos detectado errores en tu archivo, por favor carga la información nuevamente',
        )
        onFileChange(null)
      } else {
        setFileError(null)
        onFileChange(selectedFile)
      }
    }
  }

  return (
    <div className='bg-white p-10 h-full w-full'>
      <header className='mb-1 items-center gap-4'>
        {onBack && (
          <button
            onClick={onBack}
            className='flex items-center gap-2 px-4 py-2 text-green-1 hover:text-green-700 hover:underline'
          >
            <IconArrowLeft size={18} />
            Volver
          </button>
        )}
        <h1 className='text-3xl font-semibold'>{title}</h1>
        <p className='text-gray-500 text-2xl'>{description}</p>
      </header>

      {(fileError || showErrorBanner) && (
        <div className='px-8 p-1 mt-3 bg-[#F6B5B5] text-[#C41B1B] rounded-lg w-[80%]'>
          Hemos detectado errores en tu archivo, por favor carga la información nuevamente
        </div>
      )}

      <div className='w-[85%] mt-7 justify-self-center relative'>
        {/* Overlay gris con loading */}
        {isLoading && (
          <div className='absolute inset-0 bg-gray-100/70 flex items-center justify-center z-10'>
            <IconLoader2 className='animate-spin' size={100} />
          </div>
        )}

        <section
          className={`shadow-lg rounded-xl flex gap-16 p-16 transition-colors ${
            isLoading ? 'pointer-events-none' : ''
          }`}
        >
          <div className='flex-1 mt-16'>
            <h1 className='font-semibold mb-4 text-2xl'>Recomendaciones</h1>
            <ul className='list-disc list-inside space-y-2 text-gray-600'>
              <li>Solo se aceptan archivos con extensión .csv.</li>
              <li>El peso del archivo no puede exceder 2MB</li>
              <li>Recuerde incluir el código de producto y el precio</li>
            </ul>
          </div>

          <div className='flex-1 space-y-8'>
            <h3 className='text-2xl font-semibold mb-2'>1. Descargar Plantilla</h3>
            <button
              disabled={isLoading || !!fileError}
              className='flex items-center gap-2 px-20 py-2 bg-green-1 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-gray-1 disabled:cursor-not-allowed'
            >
              <IconDownload size={18} />
              Descargar
            </button>

            <h3 className='text-2xl font-semibold mb-2'>2. Subir Plantilla</h3>
            <label
              className={`border-2 border-dashed rounded-md p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${
                  isLoading
                    ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-60'
                    : file
                      ? 'border-green-1 text-green-1 bg-green-100'
                      : 'border-gray-300 text-gray-400 hover:border-green-1 hover:text-green-1'
                }
              `}
            >
              <IconUpload size={36} className={`${file && !isLoading ? 'text-green-600' : ''}`} />
              <span className={`font-semibold ${file && !isLoading ? 'text-green-700' : ''}`}>
                {file
                  ? `Archivo seleccionado: ${file.name}`
                  : 'Seleccione o arrastre un archivo...'}
              </span>
              <input
                type='file'
                accept='.csv'
                className='hidden'
                onChange={handleFileInput}
                disabled={isLoading}
              />
            </label>
          </div>
        </section>

        <div className='flex justify-end mt-10'>
          <button
            onClick={onUpload}
            disabled={isLoading || !!fileError}
            className={`transition-all px-20 py-2 bg-green-1 text-white rounded-md hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-1 flex items-center gap-2 ${
              isLoading ? 'hidden' : ''
            }`}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
