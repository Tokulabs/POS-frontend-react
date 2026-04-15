import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp, IconList } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useComboOptionGroups } from '@/hooks/restaurant/useComboOptionGroups'
import { IComboOptionGroup, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { axiosRequest } from '@/api/api'
import { restaurantMenuURL } from '@/utils/network'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface ComboOptionsEditorProps {
  menuItemId: number
  optionGroups: IComboOptionGroup[]
}

type SelectedOption = { id: number; name: string; selling_price: number }

// Handles search + add for a single option group — server-side menu search
const GroupOptionAdder: FC<{
  alreadyInGroup: Set<number>
  onAdd: (productId: number, extraPrice: number) => void
  isAdding: boolean
}> = ({ alreadyInGroup, onAdd, isAdding }) => {
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<SelectedOption | null>(null)
  const [extraPrice, setExtraPrice] = useState('')

  const { data: searchResults = [] } = useQuery({
    queryKey: ['menu-search-option', search],
    queryFn: async () => {
      const url = new URL(restaurantMenuURL)
      url.searchParams.set('keyword', search)
      const response = await axiosRequest<{ results: IRestaurantProductDetail[] }>({ url, hasAuth: true })
      return response?.data?.results ?? []
    },
    enabled: search.trim().length >= 2 && !selected,
    staleTime: 1000 * 30,
  })

  const filtered = searchResults.filter((item) => !alreadyInGroup.has(item.product))

  const handleAdd = () => {
    if (!selected) { toast.error('Selecciona un producto'); return }
    onAdd(selected.id, parseFloat(extraPrice) || 0)
    setSearch('')
    setSelected(null)
    setExtraPrice('')
  }

  return (
    <div className='px-4 py-3 space-y-2'>
      <p className='text-xs font-medium text-muted-foreground'>Agregar producto al grupo</p>

      <Input
        placeholder='Buscar por nombre o código...'
        value={search}
        onChange={(e) => { setSearch(e.target.value); setSelected(null) }}
        className='h-8 text-sm'
      />

      {/* Search results dropdown */}
      {search.trim().length >= 2 && !selected && (
        <div className='rounded-lg border border-border bg-card shadow-sm divide-y divide-border max-h-40 overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='px-3 py-2.5 text-sm text-muted-foreground'>Sin resultados</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type='button'
                onClick={() => {
                  setSelected({
                    id: item.product,
                    name: item.product_detail?.name ?? '',
                    selling_price: item.product_detail?.selling_price ?? 0,
                  })
                  setSearch(item.product_detail?.name ?? '')
                }}
                className='w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent transition-colors'
              >
                <div className='min-w-0'>
                  <p className='text-sm font-medium truncate'>{item.product_detail?.name}</p>
                  <p className='text-xs text-muted-foreground'>{item.product_detail?.code}</p>
                </div>
                <span className='text-xs text-muted-foreground shrink-0 ml-2'>
                  {formatNumberToColombianPesos(item.product_detail?.selling_price ?? 0, true)}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected + extra price + confirm */}
      {selected && (
        <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border'>
          <p className='flex-1 text-sm font-medium truncate'>{selected.name}</p>
          <Input
            type='number'
            min={0}
            placeholder='+ precio'
            value={extraPrice}
            onChange={(e) => setExtraPrice(e.target.value)}
            className='w-24 h-7 text-sm'
          />
          <Button
            size='sm'
            className='h-7 gap-1 shrink-0'
            onClick={handleAdd}
            disabled={isAdding}
          >
            <IconPlus size={12} />
            {isAdding ? '...' : 'Agregar'}
          </Button>
        </div>
      )}
    </div>
  )
}

const ComboOptionsEditor: FC<ComboOptionsEditorProps> = ({ menuItemId, optionGroups }) => {
  const { createGroup, removeGroup, addOption, removeOption } = useComboOptionGroups(menuItemId)

  const [newGroupName, setNewGroupName]         = useState('')
  const [newGroupRequired, setNewGroupRequired] = useState(false)
  const [groupNameError, setGroupNameError]     = useState('')
  const [expandedGroups, setExpandedGroups]     = useState<Set<number>>(new Set())

  const toggleExpand = (groupId: number) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      next.has(groupId) ? next.delete(groupId) : next.add(groupId)
      return next
    })

  const handleCreateGroup = () => {
    const name = newGroupName.trim()
    if (!name) { setGroupNameError('El nombre del grupo es obligatorio.'); return }
    if (name.length < 2) { setGroupNameError('Mínimo 2 caracteres.'); return }
    setGroupNameError('')
    createGroup.mutate(
      { name, is_required: newGroupRequired },
      {
        onSuccess: () => {
          setNewGroupName('')
          setNewGroupRequired(false)
          toast.success('Grupo de opciones creado')
        },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al crear el grupo'),
      },
    )
  }

  const handleRemoveGroup = (groupId: number) => {
    removeGroup.mutate(groupId, {
      onError: () => toast.error('Error al eliminar el grupo'),
    })
  }

  const handleAddOption = (groupId: number, productId: number, extra: number) => {
    addOption.mutate(
      { groupId, product_id: productId, extra_price: extra },
      {
        onSuccess: () => toast.success('Opción agregada'),
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al agregar la opción'),
      },
    )
  }

  const handleRemoveOption = (groupId: number, optionId: number) => {
    removeOption.mutate({ groupId, optionId }, {
      onError: () => toast.error('Error al eliminar la opción'),
    })
  }

  return (
    <div className='space-y-4'>
      {optionGroups.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground border border-dashed border-border rounded-xl'>
          <IconList size={32} className='opacity-30' />
          <p className='text-sm'>Este combo no tiene grupos de opciones.</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {optionGroups.map((group) => {
            const expanded       = expandedGroups.has(group.id)
            // product_id here is the Inventory FK — same as item.product from the menu endpoint
            const alreadyInGroup = new Set(group.options.map((o) => o.product_id))

            return (
              <div key={group.id} className='rounded-xl border border-border overflow-hidden'>
                {/* Group header */}
                <div className='flex items-center gap-3 px-4 py-3 bg-muted/30'>
                  <button
                    type='button'
                    onClick={() => toggleExpand(group.id)}
                    className='flex-1 flex items-center gap-2 text-left'
                  >
                    {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
                    <span className='text-sm font-semibold'>{group.name}</span>
                    <Badge variant='secondary' className='text-[10px] h-4 px-1'>
                      {group.options.length} opción{group.options.length !== 1 ? 'es' : ''}
                    </Badge>
                    {group.is_required && (
                      <Badge variant='outline' className='text-[10px] h-4 px-1 text-orange-600 border-orange-300'>
                        Obligatorio
                      </Badge>
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={() => handleRemoveGroup(group.id)}
                    disabled={removeGroup.isPending}
                    className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
                  >
                    <IconTrash size={15} />
                  </button>
                </div>

                {expanded && (
                  <div className='divide-y divide-border'>
                    {group.options.length === 0 ? (
                      <p className='px-4 py-3 text-sm text-muted-foreground'>Sin opciones aún.</p>
                    ) : (
                      group.options.map((opt) => (
                        <div key={opt.id} className='flex items-center gap-3 px-4 py-2.5'>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>{opt.product_name}</p>
                            <p className='text-xs text-muted-foreground'>
                              {formatNumberToColombianPesos(opt.product_price, true)}
                              {opt.extra_price > 0 && (
                                <span className='ml-1 text-orange-600'>
                                  +{formatNumberToColombianPesos(opt.extra_price, true)}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => handleRemoveOption(group.id, opt.id)}
                            disabled={removeOption.isPending}
                            className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      ))
                    )}

                    <GroupOptionAdder
                      alreadyInGroup={alreadyInGroup}
                      onAdd={(productId, extra) => handleAddOption(group.id, productId, extra)}
                      isAdding={addOption.isPending}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create new group */}
      <div className='rounded-xl border border-dashed border-border p-4 space-y-3'>
        <p className='text-sm font-medium'>Nuevo grupo de opciones</p>
        <div className='space-y-1.5'>
          <Input
            placeholder='Ej: Elige tu bebida, Tamaño, Salsa...'
            value={newGroupName}
            onChange={(e) => { setNewGroupName(e.target.value); setGroupNameError('') }}
          />
          {groupNameError && <p className='text-destructive text-xs'>{groupNameError}</p>}
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Switch
              checked={newGroupRequired}
              onCheckedChange={setNewGroupRequired}
              id='group-required'
            />
            <label htmlFor='group-required' className='text-sm cursor-pointer'>
              Selección obligatoria
            </label>
          </div>
          <Button
            size='sm'
            className='gap-1.5'
            onClick={handleCreateGroup}
            disabled={createGroup.isPending}
          >
            <IconPlus size={13} />
            {createGroup.isPending ? 'Creando...' : 'Crear grupo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ComboOptionsEditor }
