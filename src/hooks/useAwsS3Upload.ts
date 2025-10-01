import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { awsPostImagetoS3, postUploadImageToAWS } from '@/pages/Inventories/helpers/services'

interface UseAwsS3UploadOptions {
  onSuccess?: (imageUrl: string) => void
  onError?: (error: Error) => void
  showToasts?: boolean
}

interface UseAwsS3UploadReturn {
  uploadFile: (file: File, key: string) => void
  isUploading: boolean
  uploadedUrl: string | null
  resetUpload: () => void
}

export const useAwsS3Upload = (options: UseAwsS3UploadOptions = {}): UseAwsS3UploadReturn => {
  const { onSuccess, onError, showToasts = true } = options

  const formDataRef = useRef<FormData | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [s3UploadData, setS3UploadData] = useState<{ url: string; key: string } | null>(null)

  // Second mutation: Upload to S3
  const { mutate: mutateUploadImagetoS3, isPending: isUploadingToS3 } = useMutation({
    mutationFn: awsPostImagetoS3,
    onSuccess: (response) => {
      // Construct the final image URL
      const finalImageUrl = constructImageUrl(response, s3UploadData)

      setUploadedUrl(finalImageUrl)

      if (showToasts) {
        toast.success('Imagen subida con éxito')
      }

      // Clean up
      formDataRef.current = null
      setS3UploadData(null)

      // Call success callback
      onSuccess?.(finalImageUrl)
    },
    onError: (error: unknown) => {
      console.error('Error uploading to S3:', error)

      if (showToasts) {
        toast.error('Error al subir la imagen a S3')
      }

      onError?.(error instanceof Error ? error : new Error('Upload failed'))
    },
  })

  // First mutation: Get AWS credentials
  const { mutate: mutateImageToServer, isPending: isGettingCredentials } = useMutation({
    mutationFn: postUploadImageToAWS,
    onSuccess: (awsData) => {
      if (!awsData?.data?.endpoint_data) {
        const error = 'Error: respuesta inválida del servidor'
        if (showToasts) {
          toast.error(error)
        }
        onError?.(new Error(error))
        return
      }

      try {
        const { endpoint_data } = awsData.data
        const { fields, url } = endpoint_data
        const { AWSAccessKeyId, key, policy, signature } = fields

        const originalFile = formDataRef.current?.get('file') as File
        if (!originalFile) {
          const error = 'Error: archivo no encontrado'
          if (showToasts) {
            toast.error(error)
          }
          onError?.(new Error(error))
          return
        }

        // Store S3 data for URL construction later
        setS3UploadData({ url, key })

        // Create FormData for S3 upload with proper structure
        const sentFormData = new FormData()
        sentFormData.append('Content-Type', fields['Content-Type'])
        sentFormData.append('key', key)
        sentFormData.append('AWSAccessKeyId', AWSAccessKeyId)
        sentFormData.append('policy', policy)
        sentFormData.append('signature', signature)
        sentFormData.append('file', originalFile)

        // Upload to S3
        mutateUploadImagetoS3({
          formData: sentFormData,
          url: url,
        })
      } catch (error) {
        console.error('Error processing AWS response:', error)

        if (showToasts) {
          toast.error('Error al procesar respuesta del servidor')
        }

        onError?.(error instanceof Error ? error : new Error('Processing failed'))
      }
    },
    onError: (error: unknown) => {
      console.error('Error getting AWS credentials:', error)

      if (showToasts) {
        toast.error('Error con el servidor')
      }

      onError?.(error instanceof Error ? error : new Error('Credentials failed'))
    },
  })

  // Helper function to construct the final image URL
  const constructImageUrl = (
    s3Response: unknown,
    uploadData: { url: string; key: string } | null,
  ): string => {
    if (!uploadData) {
      throw new Error('Upload data not available')
    }

    // Type guard for response with URL
    const responseWithUrl = s3Response as { url?: string; location?: string }

    // Method 1: If S3 response contains the full URL
    if (responseWithUrl?.url) {
      return responseWithUrl.url
    }

    // Method 2: If S3 response contains location header
    if (responseWithUrl?.location) {
      return responseWithUrl.location
    }

    // Method 3: Construct URL from base URL and key
    const baseUrl = uploadData.url.split('?')[0] // Remove query parameters
    return `${baseUrl}${uploadData.key}`
  }

  // Main upload function
  const uploadFile = (file: File, key: string) => {
    // Reset previous state
    setUploadedUrl(null)
    setS3UploadData(null)

    // Create FormData and store in ref for later use
    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', key)
    formDataRef.current = formData

    // Start the upload process
    mutateImageToServer(formData)
  }

  // Reset function
  const resetUpload = () => {
    setUploadedUrl(null)
    setS3UploadData(null)
    formDataRef.current = null
  }

  return {
    uploadFile,
    isUploading: isGettingCredentials || isUploadingToS3,
    uploadedUrl,
    resetUpload,
  }
}
