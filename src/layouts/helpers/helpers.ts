export const formatDateTime = (dateString?: string | undefined) => {
  if (!dateString) return getDateFormated()
  const date = new Date(dateString)
  date.setHours(date.getHours())

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }

  const formatter = new Intl.DateTimeFormat('es-CO', options)
  const formattedDate = formatter.format(date)
  return formattedDate
}

const getDateFormated = () => {
  const date = new Date()
  const dia = date.getDate()
  const mes = date.getMonth() + 1
  const anio = date.getFullYear()
  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes
    .toString()
    .padStart(2, '0')}/${anio.toString()}`
  return fechaFormateada
}
