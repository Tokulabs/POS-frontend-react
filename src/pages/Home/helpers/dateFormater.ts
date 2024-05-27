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
  const firstDay = new Date(year, 0, 1 + (weekNumber - 1) * 7)
  const lastDay = new Date(year, 0, 1 + (weekNumber - 1) * 7 + 6)
  const firstDayFormatted = `${firstDay.getDate()}/${firstDay.getMonth() + 1}`
  const lastDayFormatted = `${lastDay.getDate()}/${lastDay.getMonth() + 1}`
  return `${firstDayFormatted}-${lastDayFormatted}`
}
