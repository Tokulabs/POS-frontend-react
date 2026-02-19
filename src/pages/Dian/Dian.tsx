import { FC, useEffect, useMemo, useState } from 'react'
import { useDianResolutions } from '@/hooks/useDianResolution'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { putDiaResolution, toggleDianResolution } from './helpers/services'
import { Reorder } from 'framer-motion'
import { UserRolesEnum } from '../Users/types/UserTypes'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { IDianResolutionProps } from './types/DianResolutionTypes'
import { toast } from 'sonner'
import { ToggleSwitch } from '@/components/ToggleSwitch/ToggleSwitch'
import { CreateResolutionForm } from './components/CreateResolutionForm'
import { ResolutionCard } from './components/ResolutionCard'
import { ResolutionSkeleton } from './components/ResolutionSkeleton'
import { EmptyResolutionState } from './components/EmptyResolutionState'
import { IconChevronDown, IconFileDescription, IconFileOff, IconFileCheck } from '@tabler/icons-react'

const Dian: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [currentNumber, setCurrentNumber] = useState<number>(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [inactiveExpanded, setInactiveExpanded] = useState(false)
  const allowedRolesOverride = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission } = useRolePermissions({ allowedRoles: allowedRolesOverride })
  const [resolutionType, setResolutionType] = useState(0)

  const options = [{ label: 'Resoluciones POS' }, { label: 'Resoluciones F.E.' }]

  const { dianResolutionData, isPending } = useDianResolutions('allDianResolutions', {
    type: !resolutionType ? 'POS' : 'ElectronicInvoice',
  })

  const sortedDianDataResolution = dianResolutionData?.results.sort((a, b) => {
    if (a.active && !b.active) return -1
    if (!a.active && b.active) return 1
    return 0
  })

  // Split active vs inactive
  const activeResolutions = useMemo(
    () => sortedDianDataResolution?.filter((r) => r.active) ?? [],
    [sortedDianDataResolution],
  )
  const inactiveResolutions = useMemo(
    () => sortedDianDataResolution?.filter((r) => !r.active) ?? [],
    [sortedDianDataResolution],
  )

  // Stats
  const totalCount = sortedDianDataResolution?.length ?? 0
  const activeCount = activeResolutions.length
  const inactiveCount = inactiveResolutions.length
  const activeRes = activeResolutions[0]
  const availableInvoices = activeRes ? activeRes.to_number - activeRes.current_number : 0

  const queryClient = useQueryClient()

  useEffect(() => {
    setCurrentNumber(
      dianResolutionData?.results.filter((item) => item.active)[0]?.current_number ?? 0,
    )
  }, [dianResolutionData])

  const [isSwapping, setIsSwapping] = useState(false)

  const { mutateAsync: toggleAsync, isPending: isPendingToggle } = useMutation({
    mutationFn: toggleDianResolution,
  })

  const { mutate: mutatePut, isPending: isPendingPut } = useMutation({
    mutationFn: putDiaResolution,
    onSuccess: () => {
      toast.success('Último número actualizado!')
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
      setEditingId(null)
    },
  })

  const toggleResolutionActive = (clickedId: number, isCurrentlyActive: boolean) => async () => {
    try {
      if (isCurrentlyActive) {
        // Deactivating: single call
        await toggleAsync(clickedId)
        toast.success('Resolución desactivada!')
      } else {
        // Activating: check if another resolution is already active
        const currentActive = activeResolutions[0]
        if (currentActive) {
          // Auto-swap: deactivate current, then activate new
          setIsSwapping(true)
          await toggleAsync(currentActive.id)
          await toggleAsync(clickedId)
          toast.success('Resolución cambiada exitosamente!')
        } else {
          // No active resolution, just activate
          await toggleAsync(clickedId)
          toast.success('Resolución activada!')
        }
      }
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardDianPOS'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardDianFE'] })
    } catch {
      toast.error('Error al cambiar la resolución. Intente de nuevo.')
    } finally {
      setIsSwapping(false)
    }
  }

  const updateCurrentNumber = (item: IDianResolutionProps) => {
    const infoDianToUpdate = {
      current_number: currentNumber,
      document_number: item.document_number,
      from_date: item.from_date,
      from_number: item.from_number,
      to_date: item.to_date,
      to_number: item.to_number,
    }
    mutatePut({ id: item.id, payload: infoDianToUpdate })
  }

  const handleEditStart = (item: IDianResolutionProps) => {
    setEditingId(item.id)
    setCurrentNumber(item.current_number)
  }

  const hasResults = sortedDianDataResolution && sortedDianDataResolution.length > 0

  const renderCard = (item: IDianResolutionProps, compact = false) => (
    <ResolutionCard
      item={item}
      hasPermission={hasPermission}
      isEditing={editingId === item.id}
      currentNumber={currentNumber}
      isPendingToggle={isPendingToggle || isSwapping}
      isPendingPut={isPendingPut}
      compact={compact}
      onToggle={toggleResolutionActive(item.id, item.active)}
      onEditStart={() => handleEditStart(item)}
      onEditCancel={() => setEditingId(null)}
      onEditSave={() => updateCurrentNumber(item)}
      onCurrentNumberChange={setCurrentNumber}
    />
  )

  return (
    <section className='h-full'>
      <div className='h-full bg-card rounded-xl p-5 md:p-6 flex flex-col gap-5'>
        {/* Header */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='flex flex-col gap-1'>
              <h1 className='font-bold text-green-1 text-2xl md:text-3xl m-0 tracking-tight'>
                Resoluciones DIAN
              </h1>
              <p className='text-sm text-muted-foreground m-0'>
                Gestiona las resoluciones de facturación. Solo puedes tener una resolución activa
                por tipo.
              </p>
            </div>
            <div className='shrink-0'>
              <CreateResolutionForm isVisible={modalState} onOpenChange={setModalState} />
            </div>
          </div>

          {/* Separator */}
          <div className='h-px bg-border' />

          {/* Type Toggle */}
          <ToggleSwitch
            options={options}
            selectedIndex={resolutionType}
            onSelect={setResolutionType}
          />
        </div>

        {/* Stats Bar */}
        {!isPending && hasResults && (
          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <IconFileDescription size={14} />
              <span>{totalCount} {totalCount === 1 ? 'resolución' : 'resoluciones'}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <IconFileCheck size={14} className='text-green-500' />
              <span>{activeCount} activa{activeCount !== 1 ? 's' : ''}</span>
            </div>
            {inactiveCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <IconFileOff size={14} />
                <span>{inactiveCount} inactiva{inactiveCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {activeRes && (
              <div className='flex items-center gap-1.5 ml-auto'>
                <span className='font-medium text-foreground'>
                  {availableInvoices.toLocaleString()} facturas disponibles
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className='flex-1 overflow-hidden overflow-y-auto scrollbar-hide'>
          {isPending ? (
            /* Skeleton Loading */
            <div className='flex flex-col gap-4'>
              {[1, 2, 3].map((i) => (
                <ResolutionSkeleton key={i} />
              ))}
            </div>
          ) : !hasResults ? (
            /* Empty State */
            <EmptyResolutionState onCreateClick={() => setModalState(true)} />
          ) : (
            <div className='flex flex-col gap-5'>
              {/* Active Resolutions Section */}
              {activeResolutions.length > 0 && (
                <div className='flex flex-col gap-3'>
                  <h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0 px-1'>
                    Resolución Activa
                  </h3>
                  <Reorder.Group
                    as='div'
                    axis='y'
                    values={activeResolutions}
                    onReorder={() => null}
                    className='flex flex-col gap-3 list-none'
                  >
                    {activeResolutions.map((item) => (
                      <Reorder.Item
                        key={item.document_number}
                        value={item}
                        as='div'
                        dragListener={false}
                      >
                        {renderCard(item)}
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              )}

              {/* Inactive Resolutions Section */}
              {inactiveResolutions.length > 0 && (
                <div className='flex flex-col gap-3'>
                  <button
                    onClick={() => setInactiveExpanded(!inactiveExpanded)}
                    className='flex items-center gap-2 px-1 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider
                      hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 text-left'
                  >
                    <IconChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        inactiveExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    Resoluciones Inactivas ({inactiveCount})
                  </button>

                  {inactiveExpanded && (
                    <div className='flex flex-col gap-2'>
                      {inactiveResolutions.map((item) => (
                        <div key={item.document_number}>{renderCard(item, true)}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Dian }
