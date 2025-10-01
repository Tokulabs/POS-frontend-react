import { IconPhoto, IconPhotoX, IconPlus } from '@tabler/icons-react'
import { useState, useRef, ChangeEvent, FC } from 'react'
import { ImageUploadAWSProps } from '@/pages/Inventories/types/InventoryTypes'
import { postUploadImageToAWS } from '@/pages/Inventories/helpers/services'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spin } from 'antd'

interface ImageUploadProps {
  onImageChange: (awsData: ImageUploadAWSProps | null, formData: FormData) => void
  imageURL: string
}

const ImageUpload: FC<ImageUploadProps> = ({ onImageChange, imageURL }) => {
  const [avatarURL, setAvatarURL] = useState(imageURL)
  const [formDataImage, setFormDataImage] = useState<FormData>(new FormData())
  const validFileTypes = ['image/png', 'image/jpeg', 'image/webp']
  const fileUploadRef = useRef<HTMLInputElement>(null)

  const { mutate: mutateImage, isPending } = useMutation({
    mutationFn: postUploadImageToAWS,
    onSuccess: (awsData) => {
      if (!awsData) return toast.error('Error al subir la imagen')
      onImageChange(awsData.data, formDataImage)
    },
  })

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (fileUploadRef.current?.files) {
      const uploadedFile = fileUploadRef.current?.files[0]
      const formData = new FormData()

      // Validar el tipo de archivo
      if (!validFileTypes.includes(uploadedFile.type)) {
        toast.error('Tipo de archivo no válido. Por favor, sube una imagen PNG, JPEG o WEBP.')
        return
      }

      // Validar el tamaño del archivo
      const maxSizeInBytes = 0.5 * 1024 * 1024 // 500KB
      if (uploadedFile.size > maxSizeInBytes) {
        toast.error(
          'El tamaño del archivo supera el límite de 500KB. Por favor, sube una imagen más pequeña.',
        )
        return
      }

      formData.append('file', uploadedFile)
      mutateImage(formData)
      setFormDataImage(formData)
      const cachedURL = URL.createObjectURL(uploadedFile)
      setAvatarURL(cachedURL)
    }
  }

  const removeImage = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    setAvatarURL('')
    setFormDataImage(new FormData())
    onImageChange(null, new FormData())
  }

  return (
    <div className='flex justify-center w-full text-white'>
      <div
        className={`w-24 h-24 rounded-full flex flex-col justify-center items-center cursor-pointer ${
          avatarURL ? '' : 'bg-gray-1'
        }`}
        onClick={() => fileUploadRef.current?.click()}
      >
        {isPending && <Spin size='large' />}
        {!isPending && avatarURL ? (
          <div className='relative w-40 h-full'>
            <span
              className='absolute bottom-0 right-0 z-10 flex items-center justify-center p-1 text-white bg-green-1'
              onClick={removeImage}
            >
              <IconPhotoX />
            </span>
            <img className='object-cover w-full h-full' src={avatarURL} />
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center'>
            <IconPhoto />
            <span className='flex items-center justify-center'>
              <IconPlus size={15} />
              Foto
            </span>
          </div>
        )}
      </div>
      <input
        type='file'
        style={{ display: 'none' }}
        ref={fileUploadRef}
        onChange={handleImageUpload}
        accept={validFileTypes.join(', ')}
      />
    </div>
  )
}

export { ImageUpload }
