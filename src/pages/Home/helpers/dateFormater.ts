export const dateFormater = (date: string) => {
  const [day, month] = date.split('/')
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  return `${months[parseInt(month) - 1]} ${day}`
}

export const convertToCurrentWeek = (weekStr: string): string => {
  const weekNumber = parseInt(weekStr.split(' ')[1])
  const year = new Date().getFullYear()

  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1)

  // Calculate the day of the week for the first day of the year (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = firstDayOfYear.getDay()

  // Calculate the difference to the first Monday of the year
  const diffToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek

  // Get the first Monday of the year
  const firstMonday = new Date(year, 0, 1 + diffToMonday)

  // Calculate the first day of the week (Monday) for the given week number
  const firstDay = new Date(firstMonday)
  firstDay.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

  // Calculate the last day of the week (Sunday)
  const lastDay = new Date(firstDay)
  lastDay.setDate(firstDay.getDate() + 6)

  // Format the dates as DD/MM
  const firstDayFormatted = `${firstDay.getDate()}/${firstDay.getMonth() + 1}`
  const lastDayFormatted = `${lastDay.getDate()}/${lastDay.getMonth() + 1}`

  return `${firstDayFormatted}-${lastDayFormatted}`
}
