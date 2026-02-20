import { FC, ReactNode, useRef, useEffect, useState, useCallback } from 'react'

interface ToggleOption {
  label: string
  content?: ReactNode
}

interface ToggleSwitchProps {
  options: ToggleOption[]
  selectedIndex: number
  onSelect: (index: number) => void
  className?: string
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({
  options,
  selectedIndex,
  onSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  const updateIndicator = useCallback(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('[data-toggle-btn]')
      const activeBtn = buttons[selectedIndex]
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        })
      }
    }
  }, [selectedIndex])

  // Recalculate on selectedIndex change
  useEffect(() => {
    updateIndicator()
  }, [updateIndicator])

  // Recalculate on container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      updateIndicator()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [updateIndicator])

  return (
    <div className='w-full'>
      <div
        ref={containerRef}
        className={`relative w-full flex rounded-lg bg-muted p-1 ${className}`}
      >
        {/* Sliding indicator */}
        <div
          className='absolute top-1 bottom-1 rounded-md bg-green-1 shadow-xs transition-all duration-300 ease-out'
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {options.map((option, index) => (
          <button
            key={option.label}
            data-toggle-btn
            type='button'
            onClick={() => onSelect(index)}
            className={`relative z-10 flex-1 py-2.5 px-4 flex justify-center items-center rounded-md
              text-sm font-medium transition-colors duration-200 cursor-pointer
              focus:outline-hidden focus-visible:ring-2 focus-visible:ring-green-1/50
              ${
                selectedIndex === index
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className={options[selectedIndex].content ? 'mt-4' : ''}>
        {options[selectedIndex].content}
      </div>
    </div>
  )
}

export { ToggleSwitch }
