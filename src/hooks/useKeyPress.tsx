import { useEffect, useRef } from 'react'

export const useKeyPress = (targetKey: string, callback: () => void): void => {
  function handleKeyPress(event: KeyboardEvent): void {
    if (event.key === targetKey) {
      event.preventDefault()
      callback()
    }
  }
  const savedCallback = useRef<() => void>()
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      handleKeyPress(event)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
