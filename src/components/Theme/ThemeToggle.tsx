import { FC } from 'react'
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react'
import { useThemeStore, Theme } from '@/store/useThemeStore'
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface ThemeOption {
  value: Theme
  label: string
  icon: typeof IconSun
}

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: IconSun },
  { value: 'dark', label: 'Oscuro', icon: IconMoon },
  { value: 'system', label: 'Sistema', icon: IconDeviceDesktop },
]

export const ThemeToggle: FC = () => {
  const { theme, setTheme, resolvedTheme } = useThemeStore()

  const CurrentIcon = resolvedTheme === 'dark' ? IconMoon : IconSun

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
        <CurrentIcon size={15} className="text-foreground" />
        <span className="font-bold">Tema</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value
          return (
            <DropdownMenuItem
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setTheme(option.value)}
            >
              <Icon size={15} className="text-foreground" />
              <span className="flex-1">{option.label}</span>
              {isActive && <IconCheck size={15} className="text-green-1" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
