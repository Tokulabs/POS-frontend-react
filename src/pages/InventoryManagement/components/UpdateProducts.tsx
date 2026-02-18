import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import UploadResults from './UploadResults'
import FileUploadForm from './FileUpdateForm'
import { toast } from 'sonner'
import { inventoryCsvRequest } from '../helpers/InventoryApi'

interface UpdateResponse {
  updated: string[]
  errors: string[]
  error?: string | string[]
  details?: string[]
}

interface UpdateProductsProps {
  onBack?: () => void
}

export default function UpdateProducts({ onBack }: UpdateProductsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [errorData, setErrorData] = useState<UpdateResponse | null>(null)
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  const updateMutation = useMutation<UpdateResponse, Error, File>({
    mutationFn: (file) => inventoryCsvRequest<UpdateResponse>(file, 'put'),
    onSuccess: (data) => {
      const errorCount = data.errors?.length ?? data.details?.length ?? 0
      const updatedCount = data.updated?.length ?? 0
      const hasGlobalError = !!data.error

      if ((errorCount > 0 && updatedCount === 0) || hasGlobalError) {
        const message = hasGlobalError
          ? Array.isArray(data.error)
            ? data.error.join(', ')
            : data.error
          : `Se encontraron ${errorCount} errores en la actualización`

        setErrorData({
          updated: data.updated ?? [],
          errors: [
            ...(data.errors ?? []),
            ...(data.details ?? []),
            ...(data.error
              ? Array.isArray(data.error)
                ? data.error
                : [data.error]
              : []),
          ],
        })

        toast.error(message)
        setShowResults(true)
        return
      }

      toast.success('Productos actualizados correctamente')
      setShowResults(true)
    },
    onError: (e) => {
      let parsedData: UpdateResponse
      try {
        parsedData = JSON.parse(e.message)
      } catch {
        parsedData = { updated: [], errors: ['Error desconocido'] }
      }

      setErrorData(parsedData)

      const errorCount = parsedData.errors?.length ?? parsedData.details?.length ?? 0
      const updatedCount = parsedData.updated?.length ?? 0

      if (updatedCount === 0 && errorCount > 0) {
        toast.error(parsedData.error || 'Error en la actualización')
      } else {
        toast.error(
          errorCount > 0
            ? `Se encontraron ${errorCount} errores en la actualización`
            : 'Ocurrió un error'
        )
      }

      setShowResults(true)
    },
  })

  const handleUpload = () => {
    if (!file) return toast.error('Seleccione un archivo CSV primero')
    updateMutation.mutate(file)
  }

  if (showResults) {
    const data = errorData || updateMutation.data!
    return (
      <UploadResults
        products={Array.isArray(data?.updated) ? data.updated : []}
        errors={Array.isArray(data?.errors) ? data.errors : []}
        onFixErrors={() => {
          setShowResults(false)
          setErrorData(null)
          setShowErrorBanner(true)
        }}
        onFinish={onBack}
        type="update"
      />
    )
  }

  return (
    <FileUploadForm
      title="Actualizar Productos"
      description="Edite la información de múltiples productos utilizando un archivo CSV"
      onFileChange={setFile}
      file={file}
      onUpload={handleUpload}
      isLoading={updateMutation.isPending}
      onBack={onBack}
      showErrorBanner={showErrorBanner}
      templateUrl='/actualizar_productos.csv'
      recommendations={[
        'Solo se aceptan archivos con extensión .csv.',
        'El peso del archivo no puede exceder 2MB',
        'El único campo obligatorio es el código de producto, los demás campos son opcionales',
      ]}
       />
  )
}
