export const formatNumberToColombianPesos = (num: number): string => {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })

  return formatter.format(num)
}
