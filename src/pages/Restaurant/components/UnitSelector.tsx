import { FC } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IUnitOfMeasure } from '@/pages/Restaurant/types/RestaurantTypes'

interface UnitSelectorProps {
  units: IUnitOfMeasure[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

const UnitSelector: FC<UnitSelectorProps> = ({
  units,
  value,
  onChange,
  placeholder = 'Seleccionar unidad',
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className='w-full'>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {units.map((unit) => (
        <SelectItem key={unit.id} value={String(unit.id)}>
          {unit.name}
          <span className='text-muted-foreground ml-1'>({unit.symbol})</span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export { UnitSelector }
