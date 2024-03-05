import { DataPropsForm } from './GlobalTypes'

export interface IModalFormProps {
  isVisible?: boolean
  onSuccessCallback: (data?: number | DataPropsForm) => void
  onCancelCallback: () => void
  currentPage?: number
}

export enum ModalStateEnum {
  addItem,
  addItemsCSV,
  off,
}
