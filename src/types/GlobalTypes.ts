export interface IPurchaseAddRemoveProps {
  [key: number]: number
}

export interface DataPropsForm {
  [key: string]:
    | string
    | boolean
    | number
    | DataPropsForm
    | React.ReactElement
    | null
    | DataPropsForm[]
}
