import { FC, useState, useEffect, ChangeEvent, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react'

interface FileUploadPreviewProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  initialPreview?: string
  className?: string
  accept?: string
  onPreviewChange?: (preview: string) => void
  onError?: (error: string) => void
  onFileSelect?: (file: File | null) => void // New callback for file selection
}

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  // FileList is immutable, so we need to create a new one
  const dataTransfer = new DataTransfer()

  // Add newly uploaded images
  Array.from(event.target.files!).forEach((image) => dataTransfer.items.add(image))

  const files = dataTransfer.files
  const displayUrl = URL.createObjectURL(event.target.files![0])

  return { files, displayUrl }
}

function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 500 * 1024 // 500KB in bytes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Solo se permiten archivos JPG, PNG y WebP.',
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo debe ser menor a 500KB.',
    }
  }

  return { isValid: true }
}

const FileUploadPreview = <T extends FieldValues>({
  control,
  name,
  label,
  description = 'Placeholder description',
  initialPreview = '',
  className = '',
  accept = '.jpg,.jpeg,.png,.webp',
  onPreviewChange,
  onError,
  onFileSelect,
}: FileUploadPreviewProps<T>): JSX.Element => {
  const [preview, setPreview] = useState(initialPreview)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(initialPreview)
  }, [initialPreview])

  const handlePreviewChange = (displayUrl: string) => {
    setPreview(displayUrl)
    onPreviewChange?.(displayUrl)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (onChange: (value: any) => void, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering the file input
    setPreview('')
    onChange('') // Set form value to empty string instead of null
    onFileSelect?.(null) // Notify parent (null is fine for file selection)
    onPreviewChange?.('') // Clear preview

    // Clear the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <FormField
        control={control}
        name={name}
        render={({ field: { onChange, value, ...rest } }) => (
          <FormItem>
            <Label>{label}</Label>
            <FormControl>
              <div className='relative'>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept={accept}
                  className='hidden'
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) {
                      onChange('') // Set to empty string instead of null
                      onFileSelect?.(null)
                      return
                    }
                    const validation = validateFile(file)
                    if (!validation.isValid) {
                      onError?.(validation.error!)
                      event.target.value = ''
                      onFileSelect?.(null)
                      return
                    }

                    const { files, displayUrl } = getImageData(event)
                    handlePreviewChange(displayUrl)
                    onChange(files)
                    onFileSelect?.(file)
                  }}
                />

                {/* Clickable upload area */}
                <div
                  onClick={handleClick}
                  className='p-4 transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer md:p-6 hover:border-gray-400 hover:bg-gray-50'
                >
                  {preview ? (
                    <div className='flex flex-col items-center'>
                      <div className='relative'>
                        <img
                          src={preview}
                          alt='Preview'
                          className='object-cover w-20 h-20 mb-2 rounded-lg md:w-24 md:h-24'
                        />
                        <button
                          type='button'
                          onClick={(e) => handleRemove(onChange, e)}
                          className='absolute p-1 text-white transition-colors bg-red-500 rounded-full shadow-lg -top-2 -right-2 hover:bg-red-600'
                        >
                          <IconX className='w-3 h-3' />
                        </button>
                      </div>
                      <div className='flex items-center text-xs text-center text-gray-500 md:text-sm'>
                        <IconUpload className='flex-shrink-0 w-3 h-3 mr-1 md:w-4 md:h-4' />
                        <span>
                          Haz click para cambiar la imagen, formatos JPG, PNG, WebP máximo 500KB
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center text-center'>
                      <IconPhoto className='w-10 h-10 mb-2 text-gray-400 md:w-12 md:h-12 md:mb-3' />
                      <div className='flex items-center mb-1 text-xs font-medium text-gray-700 md:text-sm'>
                        <IconUpload className='flex-shrink-0 w-3 h-3 mr-1 md:w-4 md:h-4' />
                        Haz click para subir imagen
                      </div>
                      <p className='text-xs text-gray-500'>JPG, PNG, WebP máximo 500KB</p>
                    </div>
                  )}
                </div>
              </div>
            </FormControl>
            <FormDescription className='mt-2 text-xs text-gray-500'>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default FileUploadPreview
