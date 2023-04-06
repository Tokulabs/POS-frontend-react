import { DataPropsForm } from './GlobalTypes'

export interface IModalFormProps {
  isVisible?: boolean
  onSuccessCallback: (data?: number | DataPropsForm) => void
  onCancelCallback: () => void
}
