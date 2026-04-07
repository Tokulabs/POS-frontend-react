import { FC } from 'react'
import { IconChefHat, IconUser, IconLayoutList } from '@tabler/icons-react'
import { useRestaurantMode, RestaurantMode } from '@/store/useRestaurantMode'

const MODES: { key: RestaurantMode; label: string; Icon: FC<{ size?: number }> }[] = [
  { key: 'normal', label: 'Normal', Icon: IconLayoutList },
  { key: 'kitchen', label: 'Cocina', Icon: IconChefHat },
  { key: 'waiter', label: 'Mesero', Icon: IconUser },
]

const ModeSwitcher: FC = () => {
  const { mode, setMode } = useRestaurantMode()

  return (
    <div className='flex rounded-lg border border-border overflow-hidden shrink-0'>
      {MODES.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === key
              ? key === 'kitchen'
                ? 'bg-amber-500 text-white'
                : key === 'waiter'
                  ? 'bg-blue-600 text-white'
                  : 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Icon size={13} />
          <span className='hidden sm:inline'>{label}</span>
        </button>
      ))}
    </div>
  )
}

export { ModeSwitcher }
