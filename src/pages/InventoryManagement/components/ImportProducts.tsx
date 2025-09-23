import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import UploadResults from './UploadResults'
import FileUploadForm from './FileUpdateForm'
import { toast } from 'sonner'
import { inventoryCsvRequest } from '../helpers/InventoryApi'

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

  const importMutation = useMutation<ImportResponse, Error, File>({
    mutationFn: (file) => inventoryCsvRequest<ImportResponse>(file, 'post'),
    onSuccess: () => {
      toast.success('Productos importados correctamente')
      setShowResults(true)
    },
    onError: (e) => {
      let parsedData: ImportResponse
      try {
        parsedData = JSON.parse(e.message)
      } catch {
        parsedData = { created_items: [], error_list: ['Error desconocido'] }
      }

      setErrorData(parsedData)
      
      toast.error(parsedData.error)

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
        productos={Array.isArray(data?.created_items) ? data.created_items : []}
        errores={Array.isArray(data?.error_list) ? data.error_list : []}
        onFixErrors={() => {
          setShowResults(false)
          setErrorData(null)
        }}
        type="import"
      />
    )
  }

  return (
    <FileUploadForm
      title="Importar Productos"
      description="Cree nuevos productos de manera masiva utilizando un archivo CSV"
      onFileChange={setFile}
      file={file}
      onUpload={handleUpload}
      isLoading={importMutation.isPending}
      onBack={onBack}
    />
  )
}