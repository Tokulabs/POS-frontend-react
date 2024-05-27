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
  const weekNumber = parseInt(weekStr.split(' ')[1], 10)
  const year = new Date().getFullYear()
  const firstDayOfYear = new Date(year, 0, 1)
  const firstDayWeekDay = firstDayOfYear.getDay()
  const offsetToFirstMonday = firstDayWeekDay === 0 ? 1 : 8 - firstDayWeekDay
  const dayOfYearOfWeekStart = (weekNumber - 1) * 7 + offsetToFirstMonday
  const weekStart = new Date(year, 0, dayOfYearOfWeekStart)
  const weekEnd = new Date(year, 0, dayOfYearOfWeekStart + 6)
  const weekStartStr = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`
  const weekEndStr = `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
  return `${weekStartStr} - ${weekEndStr}`
}
