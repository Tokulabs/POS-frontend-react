import { FC, useState, useRef, useEffect } from 'react'
import { debounce } from 'lodash'
import { IconSearch, IconUserCheck, IconUserX } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomers } from '@/pages/POS/helpers/services'
import { ICustomerProps } from '@/pages/POS/components/types/CustomerTypes'
import { IMembershipCard } from '@/hooks/restaurant/useMembershipCards'

interface LinkCustomerModalProps {
  open: boolean
  card: IMembershipCard | null
  isPending: boolean
  onLink: (customerId: number) => void
  onUnlink: () => void
  onCancel: () => void
}

const LinkCustomerModal: FC<LinkCustomerModalProps> = ({ open, card, isPending, onLink, onUnlink, onCancel }) => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ICustomerProps[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const debouncedFetch = useRef(
    debounce(async (keyword: string) => {
      if (!keyword.trim()) { setResults([]); return }
      setIsSearching(true)
      try {
        const data = await getCustomers({ keyword, page: 1 })
        setResults(data?.results ?? [])
      } finally {
        setIsSearching(false)
      }
    }, 500),
  ).current

  useEffect(() => {
    if (open) { setSearch(''); setResults([]) }
    return () => { debouncedFetch.cancel() }
  }, [open])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedFetch(value)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Asociar cliente a la tarjeta</DialogTitle>
        </DialogHeader>

        {/* Current association */}
        {card?.customer && (
          <div className='flex items-center justify-between rounded-lg border border-border bg-muted px-3 py-2 text-sm'>
            <div className='flex items-center gap-2'>
              <IconUserCheck size={16} className='text-primary shrink-0' />
              <span className='font-medium'>{card.customer_name}</span>
              {card.customer_phone && (
                <span className='text-muted-foreground'>{card.customer_phone}</span>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs'
              onClick={onUnlink}
              disabled={isPending}
            >
              <IconUserX size={13} />
              Desasociar
            </Button>
          </div>
        )}

        {/* Search */}
        <div className='relative'>
          <IconSearch size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre o documento...'
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-9'
            autoFocus
          />
        </div>

        {/* Results */}
        <div className='flex flex-col gap-1 max-h-64 overflow-y-auto'>
          {isSearching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-12 rounded-lg' />
            ))
          ) : results.length === 0 && search.trim() ? (
            <p className='text-sm text-muted-foreground text-center py-6'>No se encontraron clientes.</p>
          ) : results.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-6'>Escribe para buscar clientes.</p>
          ) : (
            results.map((customer) => (
              <button
                key={customer.id}
                type='button'
                className='flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-left hover:bg-accent transition-colors'
                onClick={() => onLink(customer.id!)}
                disabled={isPending}
              >
                <div className='flex flex-col gap-0.5'>
                  <span className='text-sm font-medium'>{customer.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {customer.document_type} {customer.document_id}
                    {customer.phone ? ` · ${customer.phone}` : ''}
                  </span>
                </div>
                {card?.customer === customer.id && (
                  <IconUserCheck size={15} className='text-primary shrink-0' />
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { LinkCustomerModal }
