export interface IModalFormProps {
  isVisible?: boolean
  onSuccessCallback: (data?: number) => void
  onCancelCallback: () => void
}
