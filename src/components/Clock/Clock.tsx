import { FC, useEffect, useMemo, useState } from 'react'

const Clock: FC = () => {
  const [dateTime, setDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = useMemo(() => {
    return (date: Date) => {
      const day = date.toLocaleString('default', { day: 'numeric' }).padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
  }, [])

  const formatTime = useMemo(() => {
    return (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }
  }, [])

  return (
    <div className='flex gap-2'>
      <p className='m-0'>{formatDate(dateTime)}</p>
      <p className='m-0'>{formatTime(dateTime)}</p>
    </div>
  )
}

export default Clock
