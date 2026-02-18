import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import UploadResults from './UploadResults'
import FileUploadForm from './FileUpdateForm'
import { toast } from 'sonner'
import { inventoryCsvRequest } from '../helpers/InventoryApi'
import { set } from 'lodash'

interface ImportResponse {
  created_items: string[]
  error_list: string[]
  error?: string[]
}

interface ImportProductsProps {
  onBack?: () => void
}

export default function ImportProducts({ onBack }: ImportProductsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [errorData, setErrorData] = useState<ImportResponse | null>(null)
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  const importMutation = useMutation<ImportResponse, Error, File>({
    mutationFn: (file) => inventoryCsvRequest<ImportResponse>(file, 'post'),
    onSuccess: (data) => {
      const errorCount = data.error_list?.length ?? 0
      const createdCount = data.created_items?.length ?? 0
      const hasGlobalError = !!data.error

      if (errorCount > 0 && createdCount === 0) {
        // Errores en los items (toast con error global)
        setErrorData({
          created_items: data.created_items ?? [],
          error_list: [
            ...(data.error_list ?? []),
            ...(data.error ? (Array.isArray(data.error) ? data.error : [data.error]) : []),
          ],
        })

        const message = `Se encontraron ${errorCount} errores en la importación`
        toast.error(message)
        setShowResults(true)
        return
      } else if (hasGlobalError) {
        // Solo error global (NO mostrar toast)
        setErrorData({
          created_items: data.created_items ?? [],
          error_list: [
            ...(data.error_list ?? []),
            ...(data.error ? (Array.isArray(data.error) ? data.error : [data.error]) : []),
          ],
        })
        setShowResults(true)
        return
      }

      toast.success('Productos importados correctamente')
      setShowResults(true)
    },
    onError: (e) => {
      let parsedData: ImportResponse
      if (e.message == null) {
        parsedData = { created_items: [], error_list: ['Error desconocido'] }
      } else {
        parsedData = JSON.parse(e.message)
      }

      setErrorData(parsedData)

      const errorCount = parsedData.error_list?.length ?? 0
      const createdCount = parsedData.created_items?.length ?? 0

      if (createdCount === 0 && errorCount > 0) {
        toast.error(parsedData.error)
      } else {
        toast.error(
          errorCount > 0
            ? `Se encontraron ${errorCount} errores en la importación`
            : 'Ocurrió un error',
        )
      }

      setShowResults(true)
    },
  })

  const handleUpload = () => {
    if (!file) return toast.error('Seleccione un archivo CSV primero')
    importMutation.mutate(file)
  }

  if (showResults) {
    const data = errorData || importMutation.data!
    return (
      <UploadResults
        products={Array.isArray(data?.created_items) ? data.created_items : []}
        errors={Array.isArray(data?.error_list) ? data.error_list : []}
        onFixErrors={() => {
          setShowResults(false)
          setErrorData(null)
          setShowErrorBanner(true)
        }}
        type='import'
      />
    )
  }

  return (
    <FileUploadForm
      title='Importar Productos'
      description='Cree nuevos productos de manera masiva utilizando un archivo CSV'
      onFileChange={setFile}
      file={file}
      onUpload={handleUpload}
      isLoading={importMutation.isPending}
      onBack={onBack}
      showErrorBanner={showErrorBanner}
      templateUrl='/nuevos_productos.csv'
    />
  )
}
