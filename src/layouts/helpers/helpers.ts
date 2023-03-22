export const formatDateTime = (
  dateString?: string | undefined,
  haveHour?: boolean,
  isLongFormat?: boolean,
) => {
  if (!dateString) return getDateFormated(undefined, haveHour)
  if (!isLongFormat && haveHour) return getDateFormated(dateString, haveHour)
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

const getDateFormated = (dateString: string | undefined, haveHour?: boolean) => {
  const date = dateString ? new Date(dateString) : new Date()
  const dia = date.getDate()
  const mes = date.getMonth() + 1
  const anio = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()

  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes
    .toString()
    .padStart(2, '0')}/${anio.toString()}`
  if (haveHour) {
    const hourFormatted = hour.toString().padStart(2, '0')
    const minuteFormatted = minute.toString().padStart(2, '0')
    return `${fechaFormateada} ${hourFormatted}:${minuteFormatted}`
  }
  return fechaFormateada
}
