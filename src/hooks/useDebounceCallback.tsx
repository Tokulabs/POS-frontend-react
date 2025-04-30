import { useRef, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback)

  // Mantener referencia actualizada del callback
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedFnRef = useRef(
    debounce((...args: Args) => {
      callbackRef.current(...args)
    }, delay),
  )

  // Cancelar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedFnRef.current.cancel()
    }
  }, [])

  return useCallback((...args: Args) => {
    debouncedFnRef.current(...args)
  }, [])
}
