import { FC, useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  IconCirclePlus,
  IconFileMinus,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useCreditNotes } from '@/hooks/useCreditNotes'
import { useHasPermission } from '@/hooks/useHasPermission'
import { store } from '@/store'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { CREDIT_NOTE_REASON_LABELS } from './types/CreditNoteTypes'
import { CreateCreditNoteForm } from './Components/CreateCreditNoteForm'
import { CreditNoteResolutionPanel } from './Components/CreditNoteResolutionPanel'

const PAGE_SIZE = 10

const CreditNotes: FC = () => {
  const [createOpen, setCreateOpen] = useState(false)
  const [prefilledInvoice, setPrefilledInvoice] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const canCreateCreditNote = useHasPermission('can_create_credit_note')
  const { state } = useContext(store)
  const company = state.user?.company
  const isResolutionConfigured =
    !!company?.credit_note_prefix &&
    company?.credit_note_from_number != null &&
    company?.credit_note_to_number != null

  const keyword = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(keyword)

  useEffect(() => {
    const inv = searchParams.get('invoice')
    if (inv) {
      setPrefilledInvoice(inv)
      setCreateOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('invoice')
      setSearchParams(next, { replace: true })
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [keyword])

  const { isLoading, creditNotesData } = useCreditNotes('paginatedCreditNotes', {
    keyword,
    page,
  })

  const totalCount = creditNotesData?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const rows = creditNotesData?.results ?? []

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    const trimmed = searchInput.trim()
    if (trimmed) next.set('search', trimmed)
    else next.delete('search')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-semibold text-foreground'>Notas Crédito</h1>
          {!isLoading && totalCount > 0 && (
            <Badge variant='secondary' className='text-sm'>
              {totalCount} {totalCount === 1 ? 'nota' : 'notas'}
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <Input
              placeholder='Buscar...'
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === '') {
                  const next = new URLSearchParams(searchParams)
                  next.delete('search')
                  setSearchParams(next, { replace: true })
                }
              }}
              className='w-52'
            />
            <Button type='submit' variant='outline' size='sm'>
              Buscar
            </Button>
          </form>
          {canCreateCreditNote && isResolutionConfigured && (
            <Button onClick={() => setCreateOpen(true)} className='gap-2'>
              <IconCirclePlus size={16} />
              Crear Nota Crédito
            </Button>
          )}
        </div>
      </div>

      <CreditNoteResolutionPanel />

      <div className='flex-1 overflow-y-auto rounded-md border border-border'>
        {isLoading ? (
          <div className='flex flex-col gap-2 p-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className='h-12 rounded-md' />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconFileMinus size={36} className='opacity-40' />
            <p className='text-sm'>
              {keyword
                ? 'Sin resultados para tu búsqueda.'
                : 'No hay notas crédito todavía. Crea una con el botón de arriba.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Nota</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className='text-center'>DIAN</TableHead>
                <TableHead>CUDE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const noteNumber = `${item.prefix || ''}${item.number || '—'}`
                const invoiceNumber = item.invoice?.invoice_number ?? '—'
                const reason = CREDIT_NOTE_REASON_LABELS[item.discrepancy_code] ?? '—'
                const cudeShort = item.cude ? `${item.cude.slice(0, 12)}…` : '—'
                return (
                  <TableRow
                    key={item.id}
                    className='cursor-pointer'
                    onClick={() => navigate(`/credit-notes/${item.id}`)}
                  >
                    <TableCell className='font-medium'>{noteNumber}</TableCell>
                    <TableCell>{invoiceNumber}</TableCell>
                    <TableCell>{formatDateTime(item.created_at)}</TableCell>
                    <TableCell>{reason}</TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {item.description ?? ''}
                    </TableCell>
                    <TableCell className='text-center'>
                      {item.sent_to_dian ? (
                        <Badge variant='default' className='gap-1 bg-green-600 hover:bg-green-600'>
                          <IconCheck size={12} /> Enviada
                        </Badge>
                      ) : (
                        <Badge variant='secondary' className='gap-1'>
                          <IconX size={12} /> Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{cudeShort}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {totalCount > 0 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3'>
          <span>
            {totalCount} nota{totalCount !== 1 ? 's' : ''} · Página {page} de {totalPages}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft size={15} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <IconChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <CreateCreditNoteForm
        open={createOpen}
        prefilledInvoiceNumber={prefilledInvoice}
        onSuccess={() => {
          setCreateOpen(false)
          setPrefilledInvoice(undefined)
          setPage(1)
        }}
        onCancel={() => {
          setCreateOpen(false)
          setPrefilledInvoice(undefined)
        }}
      />
    </div>
  )
}

export { CreditNotes }
