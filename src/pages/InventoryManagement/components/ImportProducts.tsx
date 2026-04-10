import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import UploadResults from './UploadResults'
import FileUploadForm from './FileUpdateForm'
import { toast } from 'sonner'
import { inventoryCsvRequest } from '../helpers/InventoryApi'
import { set } from 'lodash'
import { useRefreshSubscription } from '@/hooks/useSubscription'

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
  const refreshSubscription = useRefreshSubscription()

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
        const errorMsg = Array.isArray(data.error) ? data.error[0] : data.error
        const isQuotaError = typeof errorMsg === 'string' && errorMsg.includes('límite')
        if (isQuotaError) {
          toast.error('Has alcanzado el límite de productos de tu plan.')
        }
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
      refreshSubscription()
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
      const hasQuotaErrors = parsedData.error_list?.some((err) => err.includes('límite del plan')) ?? false

      if (createdCount > 0 && hasQuotaErrors) {
        // Partial success — some created, some rejected due to quota
        toast.warning(
          `${createdCount} producto${createdCount !== 1 ? 's' : ''} importado${createdCount !== 1 ? 's' : ''}. ${errorCount} rechazado${errorCount !== 1 ? 's' : ''} por límite del plan.`,
        )
        refreshSubscription()
      } else if (createdCount === 0 && errorCount > 0) {
        toast.error(parsedData.error ?? `Se encontraron ${errorCount} errores en la importación`)
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
      recommendations={[
        'Solo se aceptan archivos con extensión .csv.',
        'El peso del archivo no puede exceder 2MB.',
        'Se aceptan archivos separados por coma (,) o punto y coma (;).',
        'Los campos group_id, code y name son obligatorios.',
        'El campo "tax" es opcional — si se omite se aplica IVA 19% por defecto. Valores permitidos: IVA 0%, IVA 5%, IVA 19%, INC 8%.',
      ]}
    />
  )
}
