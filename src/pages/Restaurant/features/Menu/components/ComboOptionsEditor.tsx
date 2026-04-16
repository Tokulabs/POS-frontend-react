import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IconPlus, IconTrash, IconChevronDown, IconChevronUp,
  IconList, IconPencil, IconCheck, IconX, IconGripVertical, IconDeviceFloppy,
} from '@tabler/icons-react'
import { Reorder, useDragControls } from 'framer-motion'
import { toast } from 'sonner'
import { useComboOptionGroups } from '@/hooks/restaurant/useComboOptionGroups'
import { IComboOption, IComboOptionGroup, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { axiosRequest } from '@/api/api'
import { restaurantMenuURL } from '@/utils/network'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
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

// ── Sortable option row ────────────────────────────────────────────────────────
const SortableOption: FC<{
  opt: IComboOption
  onRemove: () => void
  isRemoving: boolean
}> = ({ opt, onRemove, isRemoving }) => {
  const controls = useDragControls()

  return (
    <Reorder.Item
      as='div'
      value={opt}
      dragListener={false}
      dragControls={controls}
      className='flex items-center gap-3 px-4 py-2.5 bg-background'
    >
      <button
        type='button'
        onPointerDown={(e) => controls.start(e)}
        className='shrink-0 text-muted-foreground cursor-grab active:cursor-grabbing touch-none'
      >
        <IconGripVertical size={14} />
      </button>
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
        onClick={onRemove}
        disabled={isRemoving}
        className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
      >
        <IconTrash size={13} />
      </button>
    </Reorder.Item>
  )
}

// ── Search + add for a single option group ────────────────────────────────────
const GroupOptionAdder: FC<{
  alreadyInGroup: Set<number>
  onAdd: (productId: number, extraPrice: number) => void
  isAdding: boolean
}> = ({ alreadyInGroup, onAdd, isAdding }) => {
  const [search, setSearch]                   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected]               = useState<SelectedOption | null>(null)
  const [extraPrice, setExtraPrice]           = useState('')

  const updateDebounced = useDebouncedCallback((val: string) => setDebouncedSearch(val), 300)

  const { data: searchResults = [] } = useQuery({
    queryKey: ['menu-search-option', debouncedSearch],
    queryFn: async () => {
      const url = new URL(restaurantMenuURL)
      url.searchParams.set('keyword', debouncedSearch)
      const response = await axiosRequest<{ results: IRestaurantProductDetail[] }>({ url, hasAuth: true })
      return response?.data?.results ?? []
    },
    enabled: debouncedSearch.trim().length >= 2 && !selected,
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
        onChange={(e) => { setSearch(e.target.value); setSelected(null); updateDebounced(e.target.value) }}
        className='h-8 text-sm'
      />

      {debouncedSearch.trim().length >= 2 && !selected && (
        <div className='rounded-lg border border-border bg-card shadow-sm divide-y divide-border max-h-40 overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='px-3 py-2.5 text-sm text-muted-foreground'>Sin resultados</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type='button'
                onClick={() => {
                  setSelected({ id: item.product, name: item.product_detail?.name ?? '', selling_price: item.product_detail?.selling_price ?? 0 })
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
          <Button size='sm' className='h-7 gap-1 shrink-0' onClick={handleAdd} disabled={isAdding}>
            <IconPlus size={12} />
            {isAdding ? '...' : 'Agregar'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Main editor ───────────────────────────────────────────────────────────────
const ComboOptionsEditor: FC<ComboOptionsEditorProps> = ({ menuItemId, optionGroups }) => {
  const { createGroup, updateGroup, removeGroup, addOption, removeOption, reorderOptions } = useComboOptionGroups(menuItemId)

  const [newGroupName, setNewGroupName]         = useState('')
  const [newGroupRequired, setNewGroupRequired] = useState(false)
  const [groupNameError, setGroupNameError]     = useState('')
  const [expandedGroups, setExpandedGroups]     = useState<Set<number>>(new Set())
  const [editingGroupId, setEditingGroupId]     = useState<number | null>(null)
  const [editingName, setEditingName]           = useState('')
  // Local order per group — only set when user has moved items
  const [localOptionsMap, setLocalOptionsMap]   = useState<Record<number, IComboOption[]>>({})
  // Which groups have unsaved order changes
  const [dirtyGroups, setDirtyGroups]           = useState<Set<number>>(new Set())

  const getOptions = (group: IComboOptionGroup) => localOptionsMap[group.id] ?? group.options

  const handleReorder = (groupId: number, newOrder: IComboOption[]) => {
    setLocalOptionsMap((prev) => ({ ...prev, [groupId]: newOrder }))
    setDirtyGroups((prev) => new Set(prev).add(groupId))
  }

  const handleSaveOrder = (groupId: number) => {
    const options = localOptionsMap[groupId]
    if (!options) return
    reorderOptions.mutate(
      { groupId, order: options.map((o) => o.id) },
      {
        onSuccess: () => {
          setDirtyGroups((prev) => { const next = new Set(prev); next.delete(groupId); return next })
          toast.success('Orden guardado')
        },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al guardar el orden'),
      },
    )
  }

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
        onSuccess: () => { setNewGroupName(''); setNewGroupRequired(false); toast.success('Grupo de opciones creado') },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al crear el grupo'),
      },
    )
  }

  const handleSaveGroupName = (groupId: number) => {
    const name = editingName.trim()
    if (!name || name.length < 2) { toast.error('Mínimo 2 caracteres'); return }
    updateGroup.mutate(
      { groupId, name },
      {
        onSuccess: () => { setEditingGroupId(null); toast.success('Nombre actualizado') },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al actualizar'),
      },
    )
  }

  const handleAddOption = (groupId: number, productId: number, extra: number) => {
    addOption.mutate(
      { groupId, product_id: productId, extra_price: extra },
      {
        onSuccess: () => {
          setLocalOptionsMap((prev) => { const next = { ...prev }; delete next[groupId]; return next })
          setDirtyGroups((prev) => { const next = new Set(prev); next.delete(groupId); return next })
          toast.success('Opción agregada')
        },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al agregar la opción'),
      },
    )
  }

  const handleRemoveOption = (groupId: number, optionId: number) => {
    removeOption.mutate({ groupId, optionId }, {
      onSuccess: () => {
        setLocalOptionsMap((prev) => { const next = { ...prev }; delete next[groupId]; return next })
        setDirtyGroups((prev) => { const next = new Set(prev); next.delete(groupId); return next })
        toast.success('Opción eliminada')
      },
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
            const options        = getOptions(group)
            const alreadyInGroup = new Set(options.map((o) => o.product_id))
            const isDirty        = dirtyGroups.has(group.id)

            return (
              <div key={group.id} className='rounded-xl border border-border overflow-hidden'>
                {/* Group header */}
                <div className='flex items-center gap-3 px-4 py-3 bg-muted/30'>
                  <button type='button' onClick={() => toggleExpand(group.id)} className='shrink-0 text-muted-foreground'>
                    {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
                  </button>

                  {editingGroupId === group.id ? (
                    <div className='flex-1 flex items-center gap-2'>
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveGroupName(group.id)
                          if (e.key === 'Escape') { setEditingGroupId(null); setEditingName('') }
                        }}
                        className='h-7 text-sm font-semibold'
                      />
                      <button type='button' onClick={() => handleSaveGroupName(group.id)} disabled={updateGroup.isPending} className='shrink-0 text-green-600 hover:text-green-700 transition-colors disabled:opacity-40'>
                        <IconCheck size={15} />
                      </button>
                      <button type='button' onClick={() => { setEditingGroupId(null); setEditingName('') }} className='shrink-0 text-muted-foreground hover:text-foreground transition-colors'>
                        <IconX size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className='flex-1 flex items-center gap-2 min-w-0'>
                      <span className='text-sm font-semibold truncate'>{group.name}</span>
                      <button type='button' onClick={() => { setEditingGroupId(group.id); setEditingName(group.name) }} className='shrink-0 text-muted-foreground hover:text-foreground transition-colors'>
                        <IconPencil size={13} />
                      </button>
                      <Badge variant='secondary' className='text-[10px] h-4 px-1 shrink-0'>
                        {options.length} opción{options.length !== 1 ? 'es' : ''}
                      </Badge>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        <Switch
                          checked={group.is_required}
                          disabled={updateGroup.isPending}
                          onCheckedChange={(checked) =>
                            updateGroup.mutate(
                              { groupId: group.id, name: group.name, is_required: checked },
                              { onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al actualizar') },
                            )
                          }
                          className='scale-75 origin-left'
                        />
                        <span className={`text-[11px] font-medium ${group.is_required ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          {group.is_required ? 'Obligatorio' : 'Opcional'}
                        </span>
                      </div>
                    </div>
                  )}

                  {editingGroupId !== group.id && (
                    <button
                      type='button'
                      onClick={() => removeGroup.mutate(group.id, { onSuccess: () => toast.success('Grupo eliminado'), onError: () => toast.error('Error al eliminar el grupo') })}
                      disabled={removeGroup.isPending}
                      className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
                    >
                      <IconTrash size={15} />
                    </button>
                  )}
                </div>

                {expanded && (
                  <div className='divide-y divide-border'>
                    {options.length === 0 ? (
                      <p className='px-4 py-3 text-sm text-muted-foreground'>Sin opciones aún.</p>
                    ) : (
                      <>
                        <Reorder.Group
                          as='div'
                          axis='y'
                          values={options}
                          onReorder={(newOrder) => handleReorder(group.id, newOrder)}
                          className='divide-y divide-border'
                        >
                          {options.map((opt) => (
                            <SortableOption
                              key={opt.id}
                              opt={opt}
                              onRemove={() => handleRemoveOption(group.id, opt.id)}
                              isRemoving={removeOption.isPending}
                            />
                          ))}
                        </Reorder.Group>

                        {/* Save order button — only visible when there are unsaved changes */}
                        {isDirty && (
                          <div className='px-4 py-2 flex justify-end bg-muted/20'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-7 gap-1.5 text-xs'
                              onClick={() => handleSaveOrder(group.id)}
                              disabled={reorderOptions.isPending}
                            >
                              <IconDeviceFloppy size={13} />
                              {reorderOptions.isPending ? 'Guardando...' : 'Guardar orden'}
                            </Button>
                          </div>
                        )}
                      </>
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
            <Switch checked={newGroupRequired} onCheckedChange={setNewGroupRequired} id='group-required' />
            <label htmlFor='group-required' className='text-sm cursor-pointer'>Selección obligatoria</label>
          </div>
          <Button size='sm' className='gap-1.5' onClick={handleCreateGroup} disabled={createGroup.isPending}>
            <IconPlus size={13} />
            {createGroup.isPending ? 'Creando...' : 'Crear grupo'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ComboOptionsEditor }
