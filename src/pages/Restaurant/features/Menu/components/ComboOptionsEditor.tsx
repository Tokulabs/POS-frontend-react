import { FC, useState } from 'react'
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp, IconList } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useComboOptionGroups } from '@/hooks/restaurant/useComboOptionGroups'
import { IComboOptionGroup, IMenuProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface ComboOptionsEditorProps {
  menuItemId: number
  optionGroups: IComboOptionGroup[]
  /** All menu items available to pick as options */
  products: IMenuProductDetail[]
}

const ComboOptionsEditor: FC<ComboOptionsEditorProps> = ({ menuItemId, optionGroups, products }) => {
  const { createGroup, removeGroup, addOption, removeOption } = useComboOptionGroups(menuItemId)

  // New group form state
  const [newGroupName, setNewGroupName]         = useState('')
  const [newGroupRequired, setNewGroupRequired] = useState(false)
  const [groupNameError, setGroupNameError]     = useState('')

  // Per-group expanded + product search state
  const [expandedGroups, setExpandedGroups]   = useState<Set<number>>(new Set())
  const [searchText, setSearchText]           = useState<Record<number, string>>({})
  const [selectedId, setSelectedId]           = useState<Record<number, number | null>>({})
  const [extraPrice, setExtraPrice]           = useState<Record<number, string>>({})

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
        onError: (e: any) =>
          toast.error(e?.response?.data?.error ?? 'Error al crear el grupo'),
      },
    )
  }

  const handleRemoveGroup = (groupId: number) => {
    removeGroup.mutate(groupId, {
      onError: () => toast.error('Error al eliminar el grupo'),
    })
  }

  const handleAddOption = (groupId: number) => {
    const productId = selectedId[groupId]
    if (!productId) { toast.error('Selecciona un producto'); return }
    const extra = parseFloat(extraPrice[groupId] ?? '0') || 0

    addOption.mutate(
      { groupId, product_id: productId, extra_price: extra },
      {
        onSuccess: () => {
          setSearchText((p) => ({ ...p, [groupId]: '' }))
          setSelectedId((p) => ({ ...p, [groupId]: null }))
          setExtraPrice((p) => ({ ...p, [groupId]: '' }))
          toast.success('Opción agregada')
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.error ?? 'Error al agregar la opción'),
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
      {/* Existing groups */}
      {optionGroups.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground border border-dashed border-border rounded-xl'>
          <IconList size={32} className='opacity-30' />
          <p className='text-sm'>Este combo no tiene grupos de opciones.</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {optionGroups.map((group) => {
            const expanded  = expandedGroups.has(group.id)
            const search    = searchText[group.id] ?? ''
            const pickedId  = selectedId[group.id] ?? null
            const pickedProduct = products.find((p) => p.id === pickedId)
            const alreadyInGroup = new Set(group.options.map((o) => o.product_id))

            const filtered = products.filter(
              (p) =>
                !alreadyInGroup.has(p.id) &&
                search.trim().length >= 2 &&
                (p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.code.toLowerCase().includes(search.toLowerCase())),
            )

            return (
              <div key={group.id} className='rounded-xl border border-border overflow-hidden'>
                {/* Group header row */}
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

                {/* Options list + add search — visible when expanded */}
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

                    {/* Add option — product search */}
                    <div className='px-4 py-3 space-y-2'>
                      <p className='text-xs font-medium text-muted-foreground'>Agregar producto al grupo</p>

                      <Input
                        placeholder='Buscar por nombre o código...'
                        value={search}
                        onChange={(e) => {
                          setSearchText((p) => ({ ...p, [group.id]: e.target.value }))
                          setSelectedId((p) => ({ ...p, [group.id]: null }))
                        }}
                        className='h-8 text-sm'
                      />

                      {/* Search results */}
                      {search.trim().length >= 2 && !pickedId && (
                        <div className='rounded-lg border border-border bg-card shadow-sm divide-y divide-border max-h-40 overflow-y-auto'>
                          {filtered.length === 0 ? (
                            <p className='px-3 py-2.5 text-sm text-muted-foreground'>Sin resultados</p>
                          ) : (
                            filtered.map((p) => (
                              <button
                                key={p.id}
                                type='button'
                                onClick={() => {
                                  setSelectedId((prev) => ({ ...prev, [group.id]: p.id }))
                                  setSearchText((prev) => ({ ...prev, [group.id]: p.name }))
                                }}
                                className='w-full flex items-center justify-between px-3 py-2 text-left hover:bg-accent transition-colors'
                              >
                                <div className='min-w-0'>
                                  <p className='text-sm font-medium truncate'>{p.name}</p>
                                  <p className='text-xs text-muted-foreground'>{p.code}</p>
                                </div>
                                <span className='text-xs text-muted-foreground shrink-0 ml-2'>
                                  {formatNumberToColombianPesos(p.selling_price, true)}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* Selected product + extra price + add button */}
                      {pickedId && pickedProduct && (
                        <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border'>
                          <p className='flex-1 text-sm font-medium truncate'>{pickedProduct.name}</p>
                          <Input
                            type='number'
                            min={0}
                            placeholder='+ precio'
                            value={extraPrice[group.id] ?? ''}
                            onChange={(e) =>
                              setExtraPrice((p) => ({ ...p, [group.id]: e.target.value }))
                            }
                            className='w-24 h-7 text-sm'
                          />
                          <Button
                            size='sm'
                            className='h-7 gap-1 shrink-0'
                            onClick={() => handleAddOption(group.id)}
                            disabled={addOption.isPending}
                          >
                            <IconPlus size={12} />
                            {addOption.isPending ? '...' : 'Agregar'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create new group form */}
      <div className='rounded-xl border border-dashed border-border p-4 space-y-3'>
        <p className='text-sm font-medium'>Nuevo grupo de opciones</p>
        <div className='space-y-1.5'>
          <Input
            placeholder='Ej: Elige tu bebida, Tamaño, Salsa...'
            value={newGroupName}
            onChange={(e) => { setNewGroupName(e.target.value); setGroupNameError('') }}
          />
          {groupNameError && (
            <p className='text-destructive text-xs'>{groupNameError}</p>
          )}
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
