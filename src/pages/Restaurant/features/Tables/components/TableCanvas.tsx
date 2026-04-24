import { FC, useEffect, useRef, useState } from 'react'
import { IconUsers, IconZoomIn, IconZoomOut, IconFocus2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { IRestaurantTable, TableStatus, TABLE_STATUS_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'

const CARD_W = 130
const CARD_H = 108
const GRID_SIZE = 32
const MIN_ZOOM = 0.15
const MAX_ZOOM = 3

const NODE_STATUS: Record<TableStatus, { borderColor: string; bg: string; dot: string; text: string }> = {
  available: { borderColor: '#34d399', bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500', text: 'text-foreground' },
  occupied:  { borderColor: '#f87171', bg: 'bg-red-50 dark:bg-red-950/30',         dot: 'bg-red-500',     text: 'text-foreground' },
  reserved:  { borderColor: '#fbbf24', bg: 'bg-amber-50 dark:bg-amber-950/30',     dot: 'bg-amber-500',   text: 'text-foreground' },
  cleaning:  { borderColor: '#60a5fa', bg: 'bg-blue-50 dark:bg-blue-950/30',       dot: 'bg-blue-500',    text: 'text-foreground' },
  disabled:  { borderColor: '#d1d5db', bg: 'bg-zinc-100 dark:bg-zinc-900/30',      dot: 'bg-zinc-400',    text: 'text-muted-foreground' },
}

type Position = { x: number; y: number }   // world pixel coordinates, unbounded
type ViewState = { pan: { x: number; y: number }; zoom: number }

function computeAutoPositions(tables: IRestaurantTable[]): Record<number, Position> {
  const unpositioned = tables.filter((t) => t.pos_x == null)
  const n = unpositioned.length
  if (n === 0) return {}
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.6)))
  const result: Record<number, Position> = {}
  unpositioned.forEach((t, i) => {
    result[t.id] = {
      x: 150 + (i % cols) * 210,
      y: 150 + Math.floor(i / cols) * 190,
    }
  })
  return result
}

interface TableCanvasProps {
  tables: IRestaurantTable[]
  editMode: boolean
  onTableClick: (table: IRestaurantTable) => void
  onPositionChange: (id: number, x: number, y: number) => void
}

const TableCanvas: FC<TableCanvasProps> = ({ tables, editMode, onTableClick, onPositionChange }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const [viewState, setViewState] = useState<ViewState>({ pan: { x: 80, y: 60 }, zoom: 0.9 })
  const viewRef = useRef(viewState)
  viewRef.current = viewState

  const [positions, setPositions] = useState<Record<number, Position>>(() => {
    const auto = computeAutoPositions(tables)
    const result: Record<number, Position> = { ...auto }
    tables.forEach((t) => {
      if (t.pos_x != null && t.pos_y != null) result[t.id] = { x: t.pos_x, y: t.pos_y }
    })
    return result
  })
  const positionsRef = useRef(positions)
  positionsRef.current = positions

  const panDragging = useRef<{ startX: number; startY: number; origPan: { x: number; y: number } } | null>(null)
  const tableDragging = useRef<{ id: number; startX: number; startY: number; origX: number; origY: number } | null>(null)

  useEffect(() => {
    setPositions((prev) => {
      const auto = computeAutoPositions(tables)
      const next = { ...prev }
      tables.forEach((t) => {
        const isDragging = tableDragging.current?.id === t.id
        if (!(t.id in next)) {
          next[t.id] = auto[t.id] ?? { x: 150, y: 150 }
        } else if (t.pos_x != null && t.pos_y != null && !isDragging) {
          next[t.id] = { x: t.pos_x, y: t.pos_y }
        }
      })
      return next
    })
  }, [tables])

  useEffect(() => {
    fitContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Non-passive wheel listener so we can preventDefault
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const { pan, zoom } = viewRef.current
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor))
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      setViewState({
        zoom: newZoom,
        pan: {
          x: cx - (cx - pan.x) * (newZoom / zoom),
          y: cy - (cy - pan.y) * (newZoom / zoom),
        },
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Pointer handlers ──────────────────────────────────────────────────────

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    containerRef.current?.setPointerCapture(e.pointerId)
    containerRef.current!.style.cursor = 'grabbing'
    panDragging.current = { startX: e.clientX, startY: e.clientY, origPan: { ...viewRef.current.pan } }
  }

  const handleTablePointerDown = (e: React.PointerEvent, table: IRestaurantTable) => {
    e.stopPropagation()
    if (!editMode) return
    containerRef.current?.setPointerCapture(e.pointerId)
    containerRef.current!.style.cursor = 'grabbing'
    const pos = positionsRef.current[table.id] ?? { x: 150, y: 150 }
    tableDragging.current = { id: table.id, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y }
  }

  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (tableDragging.current) {
      const { id, startX, startY, origX, origY } = tableDragging.current
      const zoom = viewRef.current.zoom
      setPositions((prev) => ({
        ...prev,
        [id]: { x: origX + (e.clientX - startX) / zoom, y: origY + (e.clientY - startY) / zoom },
      }))
    } else if (panDragging.current) {
      const { startX, startY, origPan } = panDragging.current
      setViewState((prev) => ({
        ...prev,
        pan: { x: origPan.x + (e.clientX - startX), y: origPan.y + (e.clientY - startY) },
      }))
    }
  }

  const handleContainerPointerUp = () => {
    if (tableDragging.current) {
      const { id } = tableDragging.current
      tableDragging.current = null
      const pos = positionsRef.current[id]
      if (pos) onPositionChange(id, pos.x, pos.y)
    }
    panDragging.current = null
    containerRef.current!.style.cursor = editMode ? 'default' : 'grab'
  }

  // ── Zoom controls ─────────────────────────────────────────────────────────

  const applyZoom = (factor: number) => {
    const { pan, zoom } = viewRef.current
    const el = containerRef.current
    if (!el) return
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * factor))
    const rect = el.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    setViewState({
      zoom: newZoom,
      pan: { x: cx - (cx - pan.x) * (newZoom / zoom), y: cy - (cy - pan.y) * (newZoom / zoom) },
    })
  }

  const fitContent = () => {
    const el = containerRef.current
    if (!el || tables.length === 0) return
    const rect = el.getBoundingClientRect()
    const pts = tables.map((t) => positionsRef.current[t.id] ?? { x: 150, y: 150 })
    const minX = Math.min(...pts.map((p) => p.x)) - CARD_W
    const maxX = Math.max(...pts.map((p) => p.x)) + CARD_W
    const minY = Math.min(...pts.map((p) => p.y)) - CARD_H
    const maxY = Math.max(...pts.map((p) => p.y)) + CARD_H
    const padding = 60
    const newZoom = Math.min(
      (rect.width  - padding * 2) / (maxX - minX),
      (rect.height - padding * 2) / (maxY - minY),
      MAX_ZOOM,
    )
    setViewState({
      zoom: newZoom,
      pan: {
        x: rect.width  / 2 - ((minX + maxX) / 2) * newZoom,
        y: rect.height / 2 - ((minY + maxY) / 2) * newZoom,
      },
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const { pan, zoom } = viewState

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full overflow-hidden rounded-lg border border-border'
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(156,163,175,0.28) 1px, transparent 1px)',
        backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
        backgroundPosition: `${pan.x % (GRID_SIZE * zoom)}px ${pan.y % (GRID_SIZE * zoom)}px`,
        cursor: 'grab',
      }}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
    >
      {/* Tables rendered in screen space — no transform scale, always crisp */}
      {tables.map((table) => {
        const pos = positions[table.id]
        if (!pos) return null

        const s = NODE_STATUS[table.status] ?? NODE_STATUS.available
        const isClickable = !editMode && (!!table.active_order_id || table.status === 'available')

        // Screen-space position (pixel-snapped to avoid subpixel blur)
        const w  = Math.round(CARD_W * zoom)
        const h  = Math.round(CARD_H * zoom)
        const sx = Math.round(pos.x * zoom + pan.x)
        const sy = Math.round(pos.y * zoom + pan.y)

        return (
          <div
            key={table.id}
            className={[
              s.bg,
              table.status === 'disabled' ? 'opacity-50' : '',
              isClickable ? 'cursor-pointer hover:shadow-md' : '',
              editMode ? 'cursor-grab hover:shadow-lg' : '',
            ].join(' ')}
            style={{
              position: 'absolute',
              left: sx - w / 2,
              top:  sy - h / 2,
              width: w,
              height: h,
              borderRadius: Math.round(12 * zoom),
              borderWidth: Math.max(1, Math.round(2 * zoom)),
              borderStyle: 'solid',
              borderColor: s.borderColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Math.round(2 * zoom),
              userSelect: 'none',
              overflow: 'hidden',
            }}
            onPointerDown={(e) => handleTablePointerDown(e, table)}
            onClick={!editMode ? () => onTableClick(table) : undefined}
          >
            {/* Status dot */}
            <span
              className={`absolute rounded-full ${s.dot}`}
              style={{
                top:    Math.round(6 * zoom),
                right:  Math.round(6 * zoom),
                width:  Math.round(8 * zoom),
                height: Math.round(8 * zoom),
              }}
            />

            {/* Table number */}
            <span
              className={`font-bold truncate text-center ${s.text}`}
              style={{ fontSize: Math.round(20 * zoom), lineHeight: 1, maxWidth: '90%' }}
            >
              {table.number}
            </span>

            {/* Capacity */}
            <span
              className='text-muted-foreground flex items-center'
              style={{ fontSize: Math.round(10 * zoom), gap: Math.round(2 * zoom) }}
            >
              <IconUsers size={Math.max(1, Math.round(9 * zoom))} />
              {table.capacity}
            </span>

            {/* Status label */}
            <span
              className='text-muted-foreground'
              style={{ fontSize: Math.round(9 * zoom), lineHeight: 1 }}
            >
              {TABLE_STATUS_LABELS[table.status]}
            </span>
          </div>
        )
      })}

      {/* Empty state */}
      {tables.length === 0 && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <p className='text-sm text-muted-foreground'>No hay mesas en esta área.</p>
        </div>
      )}

      {/* Zoom controls */}
      <div
        className='absolute bottom-3 right-3 flex items-center gap-0.5 bg-card border border-border rounded-lg p-1 shadow-sm'
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => applyZoom(1 / 1.2)}>
          <IconZoomOut size={14} />
        </Button>
        <span className='text-xs text-muted-foreground w-10 text-center tabular-nums'>
          {Math.round(zoom * 100)}%
        </span>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => applyZoom(1.2)}>
          <IconZoomIn size={14} />
        </Button>
        <div className='w-px h-4 bg-border mx-0.5' />
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={fitContent} title='Centrar en mesas'>
          <IconFocus2 size={14} />
        </Button>
      </div>
    </div>
  )
}

export { TableCanvas }
