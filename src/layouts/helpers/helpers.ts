export const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  date.setHours(date.getHours() + 5)

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
