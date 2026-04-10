import { FC, useMemo, useState } from 'react'
import ContentLayout from '@/layouts/ContentLayout/ContentLayout'
import { columns } from './data/columsData'
import SupplierDetailSheet from './Components/SupplierDetailSheet'
import { useSuppliers } from '@/hooks/useSuppliers'
import { ISupplier } from './types/SupplierTypes'
import { IconCircleCheck, IconCircleX, IconPower, IconDownload, IconChevronLeft, IconChevronRight, IconArrowUp, IconArrowDown, IconArrowsSort, IconX, IconPackage, IconReceipt, IconCash, IconTruckDelivery } from '@tabler/icons-react'
import { Button as AntButton, Popconfirm, Switch } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleActiveSupplier } from './helpers/services'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useSupplierReport } from '@/hooks/useSupplierReport'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { downloadReport } from '@/components/DownloadReports/DownloadReports'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// ── Suppliers CRUD tab ───────────────────────────────────────────────────────

interface ISuppliersTabProps {
  onSelectSupplier: (id: number) => void
  onCreateSupplier: () => void
}

const SuppliersTab: FC<ISuppliersTabProps> = ({ onSelectSupplier, onCreateSupplier }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [showActive, setShowActive] = useState(true)
  const [search, setSearch] = useState('')

  const { isLoading, suppliersData } = useSuppliers('paginatedProviders', {
    keyword: search,
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })

  const queryClient = useQueryClient()

  const { mutate: toggle, isPending: isToggling } = useMutation({
    mutationFn: toggleActiveSupplier,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      toast.success(`Proveedor ${item?.data.active ? 'Activado' : 'Desactivado'}`)
    },
  })

  const formatRows = (suppliers: ISupplier[]) =>
    suppliers.map((item) => ({
      ...item,
      active: item.active ? (
        <IconCircleCheck className='text-green-1' />
      ) : (
        <IconCircleX className='text-red-1' />
      ),
      action: (
        <Popconfirm
          title={`${item.active ? 'Desactivar' : 'Activar'} Proveedor`}
          description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este proveedor?`}
          onConfirm={(e) => { e?.stopPropagation(); toggle(item.id) }}
          onCancel={(e) => e?.stopPropagation()}
          okText={`Si ${item.active ? 'Desactivar' : 'Activar'}`}
          cancelText='Cancelar'
        >
          <AntButton
            type='link'
            className='p-0'
            loading={isToggling}
            onClick={(e) => e.stopPropagation()}
          >
            <IconPower
              className={item.active ? 'text-red-1 hover:text-red-400' : 'text-green-1 hover:text-green-300'}
            />
          </AntButton>
        </Popconfirm>
      ),
    }))

  return (
    <>
      <ContentLayout
        pageTitle='Proveedores'
        buttonTitle='Crear proveedor'
        extraButton={
          <div className='flex flex-col items-center gap-2'>
            <span className='font-bold text-green-1'>Activos</span>
            <Switch value={showActive} loading={isLoading} onChange={() => setShowActive(!showActive)} />
          </div>
        }
        setModalState={onCreateSupplier}
        dataSource={formatRows(suppliersData?.results || [])}
        columns={columns}
        totalItems={suppliersData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
        onSearch={(value) => { setSearch(value); setCurrentPage(1) }}
        onRowClick={(record) => onSelectSupplier((record as unknown as ISupplier).id)}
      />

    </>
  )
}

// ── Supplier report tab ──────────────────────────────────────────────────────

const PAGE_SIZE = 10
type SortKey = 'supplier_name' | 'total_orders' | 'total_units' | 'total_amount' | 'last_purchase'
type SortDir = 'asc' | 'desc'

interface IReportTabProps {
  onSelectSupplier: (id: number) => void
}

const ReportTab: FC<IReportTabProps> = ({ onSelectSupplier }) => {
  const [startDate, setStartDate] = useState<string | undefined>(undefined)
  const [endDate, setEndDate] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('last_purchase')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { isLoading, supplierReportData } = useSupplierReport(startDate, endDate, sortKey, sortDir)

  const filtered = useMemo(() => {
    const raw = supplierReportData ?? []
    if (!search.trim()) return raw
    const q = search.toLowerCase()
    return raw.filter(
      (r) => r.supplier_name.toLowerCase().includes(q) || (r.nit && r.nit.toLowerCase().includes(q)),
    )
  }, [supplierReportData, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginatedData = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  )

  const totals = filtered.reduce(
    (acc, row) => ({ orders: acc.orders + row.total_orders, units: acc.units + row.total_units, amount: acc.amount + row.total_amount }),
    { orders: 0, units: 0, amount: 0 },
  )

  const handleDateChange = (start: string, end: string) => { setStartDate(start); setEndDate(end); setCurrentPage(1) }
  const clearDateFilter = () => { setStartDate(undefined); setEndDate(undefined); setCurrentPage(1) }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setCurrentPage(1)
  }

  const SortIcon: FC<{ column: SortKey }> = ({ column }) => {
    if (sortKey !== column) return <IconArrowsSort size={14} className='opacity-30' />
    return sortDir === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />
  }

  const { mutate: handleDownload, isPending: isDownloading } = useMutation({
    mutationFn: downloadReport,
    onSuccess: () => toast.success('Reporte descargado!'),
  })

  const onDownload = () => {
    const payload: Record<string, string> = {}
    if (startDate && endDate) { payload.start_date = startDate; payload.end_date = endDate }
    handleDownload({ payload: Object.keys(payload).length > 0 ? payload : undefined, url: 'supplier_report_export/' })
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex flex-wrap justify-end items-center gap-2'>
        <Input
          placeholder='Buscar proveedor o NIT...'
          className='h-7 w-52 text-xs'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
        />
        <Button
          variant='outline'
          size='sm'
          className='gap-1.5 text-xs h-7'
          onClick={onDownload}
          disabled={isDownloading || filtered.length === 0}
        >
          <IconDownload size={13} />
          {isDownloading ? 'Descargando...' : 'Descargar Excel'}
        </Button>
        {startDate && endDate ? (
          <div className='flex items-center gap-1'>
            <DateRangePicker startDate={startDate} endDate={endDate} onChange={handleDateChange} />
            <Button variant='ghost' size='icon' className='h-7 w-7' onClick={clearDateFilter} title='Quitar filtro de fechas'>
              <IconX size={14} />
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            size='sm'
            className='text-xs h-7'
            onClick={() => {
              const now = new Date()
              const thirtyAgo = new Date(now)
              thirtyAgo.setDate(thirtyAgo.getDate() - 30)
              const fmt = (d: Date) => d.toISOString().slice(0, 10)
              handleDateChange(fmt(thirtyAgo), fmt(now))
            }}
          >
            Filtrar por fecha
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        <KpiCard title='Proveedores' value={filtered.length.toString()} icon={<IconTruckDelivery size={20} className='text-green-1' />} loading={isLoading} />
        <KpiCard title='Total Compras' value={totals.orders.toString()} icon={<IconReceipt size={20} className='text-green-1' />} loading={isLoading} />
        <KpiCard title='Unidades Compradas' value={totals.units.toLocaleString('es-CO')} icon={<IconPackage size={20} className='text-green-1' />} loading={isLoading} />
        <KpiCard title='Total Invertido' value={formatNumberToColombianPesos(totals.amount)} icon={<IconCash size={20} className='text-green-1' />} loading={isLoading} />
      </div>

      {/* Table */}
      <div className='overflow-auto'>
        {isLoading ? (
          <div className='space-y-2'>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className='h-10 w-full' />)}</div>
        ) : filtered.length === 0 ? (
          <div className='flex items-center justify-center h-40 text-muted-foreground'>
            {search ? 'Sin resultados para la busqueda' : 'No hay datos disponibles'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead column='supplier_name' label='Proveedor' onSort={handleSort} sortIcon={<SortIcon column='supplier_name' />} />
                <TableHead>NIT</TableHead>
                <SortableHead column='total_orders' label='Compras' onSort={handleSort} sortIcon={<SortIcon column='total_orders' />} className='text-center' />
                <TableHead className='text-center'>Aprobadas</TableHead>
                <TableHead className='text-center'>Pendientes</TableHead>
                <TableHead className='text-center'>Rechazadas</TableHead>
                <SortableHead column='total_units' label='Unidades' onSort={handleSort} sortIcon={<SortIcon column='total_units' />} className='text-right' />
                <SortableHead column='total_amount' label='Monto Total' onSort={handleSort} sortIcon={<SortIcon column='total_amount' />} className='text-right' />
                <SortableHead column='last_purchase' label='Ultima Compra' onSort={handleSort} sortIcon={<SortIcon column='last_purchase' />} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.supplier_id} className='cursor-pointer' onClick={() => onSelectSupplier(row.supplier_id)}>
                  <TableCell className='font-medium'>{row.supplier_name}</TableCell>
                  <TableCell>{row.nit ?? '-'}</TableCell>
                  <TableCell className='text-center'>{row.total_orders}</TableCell>
                  <TableCell className='text-center'>
                    <Badge variant='secondary' className='bg-green-100 text-green-800'>{row.approved_orders}</Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    {row.pending_orders > 0 ? <Badge variant='outline' className='text-yellow-700 border-yellow-300'>{row.pending_orders}</Badge> : '0'}
                  </TableCell>
                  <TableCell className='text-center'>
                    {row.rejected_orders > 0 ? <Badge variant='destructive'>{row.rejected_orders}</Badge> : '0'}
                  </TableCell>
                  <TableCell className='text-right'>{row.total_units.toLocaleString('es-CO')}</TableCell>
                  <TableCell className='text-right font-medium'>{formatNumberToColombianPesos(row.total_amount)}</TableCell>
                  <TableCell>{formatDateTime(row.last_purchase)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className='flex items-center justify-between border-t pt-3 text-sm text-muted-foreground'>
          <span>Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}</span>
          <div className='flex items-center gap-1'>
            <Button variant='outline' size='icon' className='h-7 w-7' disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <IconChevronLeft size={14} />
            </Button>
            <span className='px-2'>{currentPage} / {totalPages}</span>
            <Button variant='outline' size='icon' className='h-7 w-7' disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              <IconChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

const KpiCard: FC<{ title: string; value: string; icon: React.ReactNode; loading: boolean }> = ({ title, value, icon, loading }) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between pb-2 p-4'>
      <CardTitle className='text-xs font-medium text-muted-foreground'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className='p-4 pt-0'>
      {loading ? <Skeleton className='h-7 w-24' /> : <p className='text-xl font-bold'>{value}</p>}
    </CardContent>
  </Card>
)

const SortableHead: FC<{ column: SortKey; label: string; onSort: (k: SortKey) => void; sortIcon: React.ReactNode; className?: string }> = ({ column, label, onSort, sortIcon, className }) => (
  <TableHead className={`cursor-pointer select-none ${className ?? ''}`} onClick={() => onSort(column)}>
    <span className='inline-flex items-center gap-1'>{label}{sortIcon}</span>
  </TableHead>
)

// ── Page shell ───────────────────────────────────────────────────────────────

const Providers: FC = () => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const canViewReport = useHasPermission('can_view_supplier_report')

  const handleClose = () => {
    setSelectedSupplierId(null)
    setCreateOpen(false)
  }

  return (
    <div className='bg-card h-full rounded p-4 flex flex-col gap-4 overflow-hidden'>
      <h1 className='text-2xl text-green-1 font-semibold'>Proveedores</h1>
      <Tabs defaultValue='gestion' className='flex flex-col flex-1 overflow-hidden'>
        <TabsList className='w-fit'>
          <TabsTrigger value='gestion'>Gestión</TabsTrigger>
          {canViewReport && <TabsTrigger value='reporte'>Reporte</TabsTrigger>}
        </TabsList>
        <TabsContent value='gestion' className='flex-1 overflow-hidden'>
          <SuppliersTab
            onSelectSupplier={(id) => { setCreateOpen(false); setSelectedSupplierId(id) }}
            onCreateSupplier={() => { setSelectedSupplierId(null); setCreateOpen(true) }}
          />
        </TabsContent>
        {canViewReport && (
          <TabsContent value='reporte' className='flex-1 overflow-auto'>
            <ReportTab onSelectSupplier={(id) => { setCreateOpen(false); setSelectedSupplierId(id) }} />
          </TabsContent>
        )}
      </Tabs>
      <SupplierDetailSheet
        supplierId={selectedSupplierId}
        open={createOpen || !!selectedSupplierId}
        onClose={handleClose}
      />
    </div>
  )
}

export { Providers }
