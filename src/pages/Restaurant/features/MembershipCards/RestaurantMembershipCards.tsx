import { FC, useState, useEffect } from 'react'
import { IconCirclePlus, IconCards, IconChevronLeft, IconChevronRight, IconChartBar } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useMembershipCards, IMembershipCard, CreateMembershipCardPayload } from '@/hooks/restaurant/useMembershipCards'
import { MembershipCardItem } from './components/MembershipCardItem'
import { CreateMembershipCardModal } from './components/CreateMembershipCardModal'
import { LinkCustomerModal } from './components/LinkCustomerModal'
import { MembershipCardsReportSheet } from './components/MembershipCardsReportSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const PAGE_SIZE = 10

const RestaurantMembershipCards: FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [linkModalCard, setLinkModalCard] = useState<IMembershipCard | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const canCreate = useHasPermission('can_create_membership_cards')
  const canReport = useHasPermission('can_view_membership_cards_report')

  useEffect(() => { setPage(1) }, [keyword])

  const { isLoading, cards, totalCount, createCard, patchCard, deleteCard } = useMembershipCards({ keyword, page })
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setKeyword(searchInput.trim())
  }

  const handleCreate = (values: CreateMembershipCardPayload) => {
    createCard.mutate(values, {
      onSuccess: () => {
        toast.success('Tarjeta creada')
        setCreateModalOpen(false)
      },
      onError: () => toast.error('Error al crear la tarjeta'),
    })
  }

  const handleAddStamp = (id: number) => {
    const card = cards.find((c) => c.id === id)
    if (!card || card.stamps >= card.max_stamps) return
    patchCard.mutate(
      { id, stamps: card.stamps + 1 },
      { onError: () => toast.error('Error al agregar el sello') },
    )
  }

  const handleReset = (id: number) => {
    patchCard.mutate(
      { id, stamps: 0 },
      {
        onSuccess: () => toast.info('Sellos reiniciados'),
        onError: () => toast.error('Error al reiniciar los sellos'),
      },
    )
  }

  const handleDelete = (id: number) => {
    deleteCard.mutate(id, {
      onSuccess: () => toast.success('Tarjeta eliminada'),
      onError: () => toast.error('Error al eliminar la tarjeta'),
    })
  }

  const handleLinkCustomer = (customerId: number) => {
    if (!linkModalCard) return
    patchCard.mutate(
      { id: linkModalCard.id, customer_id: customerId },
      {
        onSuccess: () => {
          toast.success('Cliente asociado')
          setLinkModalCard(null)
        },
        onError: () => toast.error('Error al asociar el cliente'),
      },
    )
  }

  const handleUnlinkCustomer = () => {
    if (!linkModalCard) return
    patchCard.mutate(
      { id: linkModalCard.id, customer_id: null },
      {
        onSuccess: () => {
          toast.success('Cliente desasociado')
          setLinkModalCard(null)
        },
        onError: () => toast.error('Error al desasociar el cliente'),
      },
    )
  }

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Tarjetas de Fidelización</h1>
        <div className='flex items-center gap-3'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <Input
              placeholder='Buscar por ID, cliente o celular...'
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === '') setKeyword('')
              }}
              className='w-52'
            />
            <Button type='submit' variant='outline' size='sm'>
              Buscar
            </Button>
          </form>
          {canReport && (
            <Button variant='outline' onClick={() => setReportOpen(true)} className='gap-2'>
              <IconChartBar size={16} />
              Reporte
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => setCreateModalOpen(true)} className='gap-2'>
              <IconCirclePlus size={16} />
              Nueva tarjeta
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-64 rounded-xl' />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconCards size={36} className='opacity-40' />
            <p className='text-sm'>
              {keyword
                ? 'Sin resultados para tu búsqueda.'
                : 'No hay tarjetas aún. Crea una con el botón de arriba.'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {cards.map((card) => (
              <MembershipCardItem
                key={card.id}
                card={card}
                canEdit={canCreate}
                onAddStamp={handleAddStamp}
                onReset={handleReset}
                onDelete={handleDelete}
                onLinkCustomer={setLinkModalCard}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3'>
          <span>{totalCount} tarjeta{totalCount !== 1 ? 's' : ''} · Página {page} de {totalPages}</span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <IconChevronLeft size={15} />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <IconChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <CreateMembershipCardModal
        open={createModalOpen}
        isPending={createCard.isPending}
        onSubmit={handleCreate}
        onCancel={() => setCreateModalOpen(false)}
      />

      <MembershipCardsReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />

      <LinkCustomerModal
        open={linkModalCard !== null}
        card={linkModalCard}
        isPending={patchCard.isPending}
        onLink={handleLinkCustomer}
        onUnlink={handleUnlinkCustomer}
        onCancel={() => setLinkModalCard(null)}
      />
    </div>
  )
}

export { RestaurantMembershipCards }
