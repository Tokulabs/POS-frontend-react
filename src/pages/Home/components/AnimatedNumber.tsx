import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  className?: string
}

const DURATION = 700
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
const defaultFmt = (n: number) => Math.round(n).toLocaleString('es-CO')

const AnimatedNumber = ({ value, format = defaultFmt, className }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value)
  const [animKey, setAnimKey] = useState(0)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value

    if (from === to) return

    setAnimKey((k) => k + 1)

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const startTime = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / DURATION, 1)
      setDisplay(from + (to - from) * easeOutExpo(t))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
        setDisplay(to)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return (
    <motion.span
      key={animKey}
      className={className}
      initial={animKey === 0 ? false : { scale: 1.25, color: '#269962' }}
      animate={{ scale: 1, color: 'inherit' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {format(Math.round(display))}
    </motion.span>
  )
}

export default AnimatedNumber
