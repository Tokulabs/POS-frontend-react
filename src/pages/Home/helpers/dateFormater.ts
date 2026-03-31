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
  // API sends plain numbers ("13"); also handle prefixed strings ("Week 13", "Semana 13")
  const parts = weekStr.trim().split(' ')
  const weekNumber = parseInt(parts.length > 1 ? parts[parts.length - 1] : parts[0])
  if (isNaN(weekNumber)) return weekStr

  const year = new Date().getFullYear()

  // ISO 8601: week 1 is the week containing the first Thursday of the year.
  // Jan 4 is always in ISO week 1, so we find the Monday of that week.
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7 // treat Sunday (0) as 7 so Monday = 1
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - (dayOfWeek - 1))

  // Advance by (weekNumber - 1) full weeks from ISO week 1 Monday
  const firstDay = new Date(week1Monday)
  firstDay.setDate(week1Monday.getDate() + (weekNumber - 1) * 7)

  const lastDay = new Date(firstDay)
  lastDay.setDate(firstDay.getDate() + 6)

  const firstDayFormatted = `${firstDay.getDate()}/${firstDay.getMonth() + 1}`
  const lastDayFormatted = `${lastDay.getDate()}/${lastDay.getMonth() + 1}`

  return `${firstDayFormatted}-${lastDayFormatted}`
}
