export enum PaymentMethodsEnum {
  cash = 'Efectivo',
  debitCard = 'Tarjeta Débito',
  creditCard = 'Tarjeta Crédito',
  nequi = 'Nequi',
  bankTransfer = 'Transferencia Bancaria',
}

export interface IPaymentMethod {
  name: PaymentMethodsEnum
  paidAmount: number
  backAmount: number
  receivedAmount: number
  transactionNumber: string
}
