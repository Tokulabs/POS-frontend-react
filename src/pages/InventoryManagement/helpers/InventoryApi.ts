import { axiosRequest } from '@/api/api'
import { inventoryCSVURL } from '@/utils/network'

export const inventoryCsvRequest = async <
  T extends { created_items?: string[]; error_list?: string[]; errors?: string[] }
>(
  file: File,
  method: 'post' | 'put'
): Promise<T> => {
  const formData = new FormData()
  formData.append('data', file)

  // Usamos returnErrorResponse para capturar errores del backend
  const response = await axiosRequest<T>({
    method,
    url: `${inventoryCSVURL}/`,
    payload: formData,
    hasAuth: true,
    showError: false,             // no mostrar toasts automáticos
    returnErrorResponse: true,    // capturar respuesta aunque sea error HTTP
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  const data = response!.data

  // Si el backend retorna errores, lanzarlos para que onError los capture
  if (data.error_list?.length || data.errors?.length) {
    throw new Error(JSON.stringify(data))
  }

  return data
}
