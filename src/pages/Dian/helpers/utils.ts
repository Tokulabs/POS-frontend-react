/** Format ISO date string (YYYY-MM-DD) to friendly locale format */
export const formatDate = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/** Check if a resolution's date range has expired */
export const isExpired = (toDate: string): boolean => {
  try {
    const [year, month, day] = toDate.split('-').map(Number)
    const end = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return end < today
  } catch {
    return false
  }
}

