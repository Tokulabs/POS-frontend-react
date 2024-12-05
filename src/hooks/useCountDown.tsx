import { useState, useEffect, useCallback } from 'react'

const useCountDown = (time: number, onTimeComplete: () => void) => {
  const initialTime = time * 60
  const [timeRemaining, setTimeRemaining] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(() => {
    setIsRunning(false)
    setTimeRemaining(initialTime)
    setIsRunning(true)
  }, [initialTime])

  useEffect(() => {
    if (!isRunning) return

    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timerInterval)
          setIsRunning(false)
          onTimeComplete()
          return 0
        } else {
          return prevTime - 1
        }
      })
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [isRunning, onTimeComplete])

  const hours = Math.floor(timeRemaining / 3600)
  const minutes = Math.floor((timeRemaining % 3600) / 60)
  const seconds = timeRemaining % 60

  return {
    time: `${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`,
    start,
  }
}

export { useCountDown }
