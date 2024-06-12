import { IconPhoto, IconPlus } from '@tabler/icons-react'
import { useState, useRef, ChangeEvent, FC } from 'react'
import { ImageUploadAWSProps } from '../../pages/Inventories/types/InventoryTypes'
import { postUploadImageToAWS } from '../../pages/Inventories/helpers/services'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spin } from 'antd'

interface ImageUploadProps {
  onImageChange: (awsData: ImageUploadAWSProps, formData: FormData) => void
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

  return (
    <div className='w-full flex justify-center text-white'>
      <div
        className={`w-24 h-24 rounded-full flex flex-col justify-center items-center cursor-pointer ${
          avatarURL ? '' : 'bg-gray-1'
        }`}
        onClick={() => fileUploadRef.current?.click()}
      >
        {isPending && <Spin size='large' />}
        {!isPending && avatarURL ? (
          <img
            className='w-40 object-contain overflow-hidden hover:scale-150 transition-all transform-cpu duration-300 ease-in-out rounded-full'
            src={avatarURL}
          />
        ) : (
          <div className='flex flex-col justify-center items-center'>
            <IconPhoto />
            <span className='flex justify-center items-center'>
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
