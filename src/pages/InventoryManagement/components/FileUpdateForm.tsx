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
  templateUrl?: string
  recommendations?: string[]
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
  templateUrl,
  recommendations = [
    'Solo se aceptan archivos con extensión .csv.',
    'El peso del archivo no puede exceder 2MB',
    'Recuerde incluir el código de producto y el precio',
  ],
}: FileUploadFormProps) {
  const handleDownloadTemplate = () => {
    if (!templateUrl) return
    const link = document.createElement('a')
    link.href = templateUrl
    link.download = templateUrl.split('/').pop() || 'plantilla.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const [fileError, setFileError] = useState<string | null>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0]

      if (selectedFile.size > 1 * 1024 * 1024) {
        setFileError('El archivo es demasiado grande. El tamaño máximo es 1MB.')
        onFileChange(null)
        return
      } else if (selectedFile.type !== 'text/csv') {
        setFileError('El archivo debe ser un CSV.')
        onFileChange(null)
        return
      }

      // Leer primeras líneas para validar delimitador
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        const firstLine = text.split('\n')[0]

        // Contamos separadores
        const commas = (firstLine.match(/,/g) || []).length
        const semicolons = (firstLine.match(/;/g) || []).length

        if (semicolons > commas) {
          setFileError('El archivo usa ";" como separador. Por favor expórtelo con comas ",".')
          onFileChange(null)
        } else {
          setFileError(null)
          onFileChange(selectedFile)
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  return (
    <div className='bg-card h-full w-full p-8 md:p-10 overflow-y-auto'>
      <header className='mb-6'>
        {onBack && (
          <button
            onClick={onBack}
            className='flex items-center gap-2 px-3 py-1.5 mb-3 text-sm text-green-1 dark:text-green-400
              hover:text-green-700 dark:hover:text-green-300 hover:underline transition-colors rounded-lg'
          >
            <IconArrowLeft size={16} />
            Volver
          </button>
        )}
        <h1 className='text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100'>{title}</h1>
        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>{description}</p>
      </header>

      {(fileError || showErrorBanner) && (
        <div className='px-4 py-3 mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400
          border border-red-200 dark:border-red-800/40 rounded-xl text-sm'>
          {fileError ?? 'Hubo errores en la importación, por favor corrija y vuelva a cargar el archivo.'}
        </div>
      )}

      <div className='relative'>
        {/* Overlay gris con loading */}
        {isLoading && (
          <div className='absolute inset-0 bg-zinc-100/70 dark:bg-zinc-900/70 flex items-center justify-center z-10 rounded-2xl'>
            <IconLoader2 className='animate-spin text-green-1 dark:text-green-400' size={64} />
          </div>
        )}

        <section
          className={`rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/50 
            shadow-xs flex flex-col md:flex-row gap-10 p-8 md:p-10 transition-colors ${
            isLoading ? 'pointer-events-none' : ''
          }`}
        >
          {/* Recommendations */}
          <div className='flex-1'>
            <h2 className='font-semibold mb-4 text-lg text-zinc-900 dark:text-zinc-100'>Recomendaciones</h2>
            <ul className='list-disc list-inside space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400'>
              {recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Upload steps */}
          <div className='flex-1 space-y-6'>
            <div>
              <h3 className='text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100'>1. Descargar Plantilla</h3>
              <button
                onClick={handleDownloadTemplate}
                disabled={isLoading || !!fileError || !templateUrl}
                className='flex items-center gap-2 px-8 py-2.5 bg-green-1 text-white rounded-xl
                  hover:bg-green-700 transition-colors text-sm font-medium
                  disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 dark:disabled:text-zinc-400 disabled:cursor-not-allowed'
              >
                <IconDownload size={18} />
                Descargar
              </button>
            </div>

            <div>
              <h3 className='text-base font-semibold mb-3 text-zinc-900 dark:text-zinc-100'>2. Subir Plantilla</h3>
              <label
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${
                    isLoading
                      ? 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed opacity-60'
                      : file
                        ? 'border-green-1 dark:border-green-400 text-green-1 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-green-1 dark:hover:border-green-400 hover:text-green-1 dark:hover:text-green-400'
                  }
                `}
              >
                <IconUpload size={32} className={`mb-2 ${file && !isLoading ? 'text-green-600 dark:text-green-400' : ''}`} />
                <span className={`font-medium text-sm ${file && !isLoading ? 'text-green-700 dark:text-green-300' : ''}`}>
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
          </div>
        </section>

        <div className='flex justify-end mt-6'>
          <button
            onClick={onUpload}
            disabled={isLoading || !!fileError}
            className={`transition-all px-10 py-2.5 bg-green-1 text-white rounded-xl text-sm font-medium
              hover:bg-green-700 disabled:cursor-not-allowed
              disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500 dark:disabled:text-zinc-400
              flex items-center gap-2 ${
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

