import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { debounce } from 'lodash'
import {
  IconSearch,
  IconX,
  IconFileInvoice,
  IconAlertCircle,
} from '@tabler/icons-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getInvoicesNew, getInvoiceByCode } from '@/pages/Invoices/helpers/services'
import { postCreditNote } from '../helpers/services'
import { getCompanyInfo } from '@/pages/Profile/helpers/services'
import { store } from '@/store'
import { ActionTypes } from '@/types/StoreTypes'
import {
  CREDIT_NOTE_REASON_CODES,
  CREDIT_NOTE_REASON_LABELS,
  ICreditNoteItemProps,
} from '../types/CreditNoteTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { IInvoiceMinimalProps } from '@/pages/Invoices/types/InvoicesTypes'

interface IProps {
  open: boolean
  prefilledInvoiceNumber?: string
  onSuccess: () => void
  onCancel: () => void
}

interface IDraftItem extends ICreditNoteItemProps {
  rowKey: string
  itemId: number
}

const CreateCreditNoteForm: FC<IProps> = ({
  open,
  prefilledInvoiceNumber,
  onSuccess,
  onCancel,
}) => {
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceResults, setInvoiceResults] = useState<IInvoiceMinimalProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)

  const [discrepancyCode, setDiscrepancyCode] = useState<number>(
    CREDIT_NOTE_REASON_CODES.CANCELLATION,
  )
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<IDraftItem[]>([])

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { state, dispatch } = useContext(store)

  const debouncedSearch = useRef(
    debounce(async (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) {
        setInvoiceResults([])
        setShowResults(false)
        return
      }
      setIsSearching(true)
      try {
        const data = await getInvoicesNew({
          keyword: trimmed,
          page: 1,
          is_electronic_invoiced: 'True',
        })
        setInvoiceResults(data?.results ?? [])
        setShowResults(true)
      } finally {
        setIsSearching(false)
      }
    }, 350),
  ).current

  useEffect(() => {
    if (open) {
      setInvoiceSearch('')
      setInvoiceResults([])
      setShowResults(false)
      setSelectedInvoiceNumber(prefilledInvoiceNumber ?? null)
      setDiscrepancyCode(CREDIT_NOTE_REASON_CODES.CANCELLATION)
      setDescription('')
      setItems([])
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [open, prefilledInvoiceNumber])

  const { data: selectedInvoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', selectedInvoiceNumber],
    queryFn: async () => getInvoiceByCode(selectedInvoiceNumber as string),
    enabled: !!selectedInvoiceNumber && open,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!selectedInvoice) {
      setItems([])
      return
    }
    setItems(
      (selectedInvoice.invoice_items ?? []).map((it, idx) => ({
        rowKey: `${it.id}-${idx}`,
        itemId: it.item.id,
        item_id: it.item.id,
        item_name: it.item_name,
        item_code: it.item_code,
        quantity: it.quantity,
        original_amount: it.original_amount,
        amount: it.amount,
        discount: 0,
        is_gift: false,
      })),
    )
  }, [selectedInvoice])

  const { mutate: mutateCreate, isPending: creating } = useMutation({
    mutationFn: postCreditNote,
    onSuccess: (response) => {
      toast.success('Nota crédito creada')
      queryClient.invalidateQueries({ queryKey: ['paginatedCreditNotes'] })
      getCompanyInfo().then((res) => {
        if (res?.data) dispatch({ type: ActionTypes.UPDATE_COMPANY_INFO, payload: res.data })
      })
      onSuccess()
      const newId = response?.data?.data?.id
      if (newId) navigate(`/credit-notes/${newId}`)
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Error al crear nota crédito')
    },
  })

  const handleInvoiceSearchChange = (value: string) => {
    setInvoiceSearch(value)
    if (selectedInvoiceNumber) {
      setSelectedInvoiceNumber(null)
    }
    debouncedSearch(value)
  }

  const handleSelectInvoice = (inv: IInvoiceMinimalProps) => {
    setSelectedInvoiceNumber(String(inv.invoice_number))
    setInvoiceSearch(String(inv.invoice_number))
    setShowResults(false)
  }

  const handleClearInvoice = () => {
    setSelectedInvoiceNumber(null)
    setInvoiceSearch('')
    setInvoiceResults([])
    setShowResults(false)
  }

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + ((it.original_amount ?? 0) - (it.discount ?? 0)),
        0,
      ),
    [items],
  )

  const onSubmit = () => {
    if (!selectedInvoice) {
      toast.error('Selecciona una factura electrónica')
      return
    }
    if (!description.trim()) {
      toast.error('Ingresa una descripción / motivo')
      return
    }
    const credit_note_items = discrepancyCode === CREDIT_NOTE_REASON_CODES.CANCELLATION
      ? []
      : items.map((it) => ({
          item_id: String(it.itemId),
          quantity: it.quantity,
          amount: it.original_amount ?? 0,
          discount: it.discount || 0,
          is_gift: false,
        }))

    mutateCreate({
      invoice_id: String(selectedInvoice.id),
      prefix: state.user?.company?.credit_note_prefix ?? 'NC',
      number: '0',
      description,
      discrepancy_code: discrepancyCode,
      credit_note_items,
    })
  }

  const invoicePrefix = selectedInvoice?.dian_resolution?.prefix ?? ''
  const invoiceFullNumber = selectedInvoice
    ? `${invoicePrefix}${selectedInvoice.e_invoice_number ?? ''}`
    : ''

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Crear Nota Crédito</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-5'>
          {/* Invoice search */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium'>Factura electrónica</label>
            <div className='relative'>
              <IconSearch
                size={15}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
              />
              <Input
                placeholder='Buscar por número de factura...'
                value={invoiceSearch}
                onChange={(e) => handleInvoiceSearchChange(e.target.value)}
                className='pl-9 pr-9'
                disabled={!!selectedInvoiceNumber}
              />
              {(selectedInvoiceNumber || invoiceSearch) && (
                <button
                  type='button'
                  onClick={handleClearInvoice}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <IconX size={15} />
                </button>
              )}
            </div>

            {showResults && !selectedInvoiceNumber && (
              <div className='flex flex-col gap-1 border border-border rounded-lg overflow-hidden bg-popover shadow-md max-h-56 overflow-y-auto mt-1'>
                {isSearching ? (
                  <p className='text-xs text-muted-foreground text-center py-3'>Buscando...</p>
                ) : invoiceResults.length === 0 ? (
                  <p className='text-xs text-muted-foreground text-center py-3'>Sin resultados</p>
                ) : (
                  invoiceResults.map((inv) => {
                    const eNumber = inv.e_invoice_number
                      ? `${inv.dian_resolution_prefix ?? ''}${inv.e_invoice_number}`
                      : null
                    return (
                      <button
                        key={inv.id}
                        type='button'
                        className='flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-accent text-sm transition-colors'
                        onClick={() => handleSelectInvoice(inv)}
                      >
                        <div className='flex items-center gap-2 min-w-0'>
                          <IconFileInvoice size={15} className='text-muted-foreground shrink-0' />
                          <div className='flex flex-col min-w-0'>
                            <span className='font-medium truncate'>
                              Factura #{inv.invoice_number}
                              {eNumber && (
                                <span className='ml-2 text-xs text-muted-foreground font-normal'>
                                  · DIAN {eNumber}
                                </span>
                              )}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {inv.created_at?.slice(0, 10)} ·{' '}
                              {inv.sale_by?.fullname ?? 'Sin vendedor'}
                            </span>
                          </div>
                        </div>
                        <span className='text-xs font-mono shrink-0'>
                          {formatNumberToColombianPesos(inv.total_sum ?? 0)}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Reference panel */}
          {loadingInvoice && <Skeleton className='h-20 rounded-lg' />}

          {selectedInvoice && !loadingInvoice && (
            <div className='rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-2 text-sm'>
              <div className='flex items-center justify-between'>
                <Badge variant='secondary' className='gap-1'>
                  <IconFileInvoice size={12} /> Factura referenciada
                </Badge>
                <span className='font-mono text-xs text-muted-foreground'>
                  {selectedInvoice.created_at?.slice(0, 10) ?? '—'}
                </span>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div>
                  <span className='text-xs text-muted-foreground'>Nº Electrónico</span>
                  <p className='font-medium'>{invoiceFullNumber || '—'}</p>
                </div>
                <div>
                  <span className='text-xs text-muted-foreground'>Cliente</span>
                  <p className='font-medium'>{selectedInvoice.customer?.name ?? '—'}</p>
                </div>
                <div className='col-span-1 sm:col-span-2'>
                  <span className='text-xs text-muted-foreground'>CUFE</span>
                  <p className='font-mono text-xs break-all'>{selectedInvoice.cufe ?? '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason + description */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium'>Motivo</label>
              <Select
                value={String(discrepancyCode)}
                onValueChange={(v) => setDiscrepancyCode(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CREDIT_NOTE_REASON_LABELS).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium'>Descripción</label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe el motivo de la nota crédito'
              />
            </div>
          </div>

          {/* Items table — hidden for anulación (backend auto-copies all items) */}
          {discrepancyCode !== CREDIT_NOTE_REASON_CODES.CANCELLATION && items.length > 0 && (
            <div className='rounded-md border border-border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className='w-24'>Cantidad</TableHead>
                    <TableHead className='text-right'>Valor original</TableHead>
                    <TableHead className='w-32'>Descuento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={row.rowKey}>
                      <TableCell className='font-mono text-xs'>{row.item_code}</TableCell>
                      <TableCell>{row.item_name}</TableCell>
                      <TableCell>
                        <Input
                          type='number'
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((p) =>
                                p.rowKey === row.rowKey
                                  ? { ...p, quantity: Number(e.target.value) || 1 }
                                  : p,
                              ),
                            )
                          }
                          className='h-8 w-20'
                        />
                      </TableCell>
                      <TableCell className='text-right font-mono text-xs'>
                        {formatNumberToColombianPesos(row.original_amount ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type='number'
                          min={0}
                          value={row.discount}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((p) =>
                                p.rowKey === row.rowKey
                                  ? { ...p, discount: Number(e.target.value) || 0 }
                                  : p,
                              ),
                            )
                          }
                          className='h-8 w-28'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className='flex justify-end px-3 py-2 border-t border-border bg-muted/40 text-sm font-medium'>
                Total: {formatNumberToColombianPesos(totalAmount)}
              </div>
            </div>
          )}

          {!selectedInvoice && !loadingInvoice && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <IconAlertCircle size={14} />
              Selecciona una factura electrónica para cargar los items.
            </div>
          )}

          {selectedInvoice && discrepancyCode === CREDIT_NOTE_REASON_CODES.CANCELLATION && (
            <div className='flex items-center gap-2 text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2'>
              <IconAlertCircle size={14} />
              Anulación total: se incluirán automáticamente todos los items de la factura original.
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 pt-3'>
          <Button variant='outline' onClick={onCancel} disabled={creating}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedInvoice || !description.trim() || creating}
          >
            {creating ? 'Creando...' : 'Crear nota crédito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CreateCreditNoteForm }
