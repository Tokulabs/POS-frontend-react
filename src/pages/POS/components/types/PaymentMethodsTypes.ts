export enum PaymentMethodsEnum {
  cash = 'Efectivo',
  debitCard = 'Tarjeta Débito',
  creditCard = 'Tarjeta Crédito',
  nequi = 'Nequi',
  bankTransfer = 'Transferencia Bancaria',
}

export interface IPaymentMethod {
  name: PaymentMethodsEnum
  paidAmount: number[]
  totalPaidAmount: number
  backAmount: number
  receivedAmount: number
  transactionNumber: string[]
}

export interface IPaymentMethodToSend {
  name: string | null
  paid_amount: number | null
  back_amount: number | null
  received_amount: number | null
  transaction_code: string | null
}
