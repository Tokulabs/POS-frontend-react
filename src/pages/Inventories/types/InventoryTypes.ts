import { IModalFormProps } from '@/types/ModalTypes'
import { IGroupsProps } from '@/pages/Groups/types/GroupTypes'
import { IProvider } from '@/pages/Providers/types/ProviderTypes'

export interface IInventoryProps {
  id: number
  active: boolean
  code: string
  name: string
  created_by: {
    email: string
  }
  group: {
    name: string
    id: number
    belongs_to: {
      name: string
    }
  } | null
  provider: {
    name: string
    legal_name: string
    id: number
  } | null
  created_at: string
  total_in_shops: number
  total_in_storage: number
  buying_price: number
  selling_price: number
  usd_price: number
  photo: string
  sum_of_item?: number
  cost_center: string | null
}

export interface IAddInventoryFormProps extends IModalFormProps {
  initialData: IInventoryProps
  groups: IGroupsProps[]
  providers: IProvider[]
}

export interface ImageUploadAWSProps {
  final_url: string
  endpoint_data: EndpointData
}

export interface EndpointData {
  url: string
  fields: Fields
}

export interface Fields {
  'Content-Type': string
  key: string
  AWSAccessKeyId: string
  policy: string
  signature: string
}
