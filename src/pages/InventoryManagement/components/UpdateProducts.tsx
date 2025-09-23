import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import UploadResults from './UploadResults'
import FileUploadForm from './FileUpdateForm'
import { toast } from 'sonner'
import { inventoryCsvRequest } from '../helpers/InventoryApi'

interface UpdateResponse {
  updated: string[]
  errors: string[]
}

interface UpdateProductsProps {
  onBack?: () => void
}

export default function UpdateProducts({ onBack }: UpdateProductsProps) {
  const [file, setFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [errorData, setErrorData] = useState<UpdateResponse | null>(null)

  const updateMutation = useMutation<UpdateResponse, Error, File>({
    mutationFn: (file) => inventoryCsvRequest<UpdateResponse>(file, 'put'),
    onSuccess: () => {
      toast.success('Productos actualizados correctamente')
      setShowResults(true)
    },
    onError: (e) => {
      try {
        setErrorData(JSON.parse(e.message))
      } catch {
        setErrorData({ updated: [], errors: ['Error desconocido'] })
      }
      toast.error('Error al actualizar cierto(s) producto(s)')
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
        }}
        type='update'
      />
    )
  }

  return (
    <FileUploadForm
      title='Actualizar Productos'
      description='Edite la información de múltiples productos utilizando un archivo CSV'
      onFileChange={setFile}
      file={file}
      onUpload={handleUpload}
      isLoading={updateMutation.isPending}
      onBack={onBack}
    />
  )
}
