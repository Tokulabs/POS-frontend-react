import { FC, ReactNode } from 'react'

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
  return (
    <div>
      <header
        className={`w-full flex justify-between rounded-md shadow-lg cursor-pointer ${className}`}
      >
        {options.map((option, index) => (
          <div
            key={option.label}
            onClick={() => onSelect(index)}
            className={`w-1/2 p-4 h-full flex justify-center items-center text-gray-1 rounded-md transition-all duration-200 
              ${index === 0 ? 'rounded-l-md' : 'rounded-r-md'} 
              ${selectedIndex === index ? 'text-white bg-green-1 font-semibold shadow-inner' : ''}`}
          >
            {option.label}
          </div>
        ))}
      </header>
      <div className={options[selectedIndex].content ? 'mt-4' : ''}>
        {options[selectedIndex].content}
      </div>
    </div>
  )
}

export { ToggleSwitch }
