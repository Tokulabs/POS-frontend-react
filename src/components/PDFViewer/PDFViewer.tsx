import { usePDFSlick } from '@pdfslick/react'
import { pdf, DocumentProps } from '@react-pdf/renderer'
import { useEffect, useState, useRef, useCallback } from 'react'
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react'

import '@pdfslick/react/dist/pdf_viewer.css'

type PDFViewerAppProps = {
  pdfFilePath?: string
  pdfDocument?: React.ReactElement<DocumentProps>
}

const SimplePDFViewer = ({ pdfFilePath, pdfDocument }: PDFViewerAppProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>(pdfFilePath || '')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pdfDocument) {
      const generatePDF = async () => {
        const blob = await pdf(pdfDocument).toBlob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      }
      generatePDF()

      return () => {
        if (pdfUrl && pdfUrl.startsWith('blob:')) {
          URL.revokeObjectURL(pdfUrl)
        }
      }
    } else if (pdfFilePath) {
      setPdfUrl(pdfFilePath)
    }
  }, [pdfDocument, pdfFilePath])

  const { viewerRef, usePDFSlickStore, PDFSlickViewer } = usePDFSlick(pdfUrl, {
    singlePageViewer: true,
    scaleValue: 'page-fit',
  })

  // Get pdfSlick instance and scale from store
  const pdfSlick = usePDFSlickStore((state) => state.pdfSlick)
  const scale = usePDFSlickStore((state) => state.scale)

  // Use PDFSlick's native zoom methods for high-quality rendering
  const handleZoomIn = useCallback(() => {
    pdfSlick?.viewer?.increaseScale()
  }, [pdfSlick])

  const handleZoomOut = useCallback(() => {
    pdfSlick?.viewer?.decreaseScale()
  }, [pdfSlick])

  const handleZoomReset = useCallback(() => {
    if (pdfSlick?.viewer) {
      pdfSlick.viewer.currentScale = 1
    }
  }, [pdfSlick])

  // Handle scroll wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      if (e.deltaY > 0) {
        pdfSlick?.viewer?.decreaseScale()
      } else {
        pdfSlick?.viewer?.increaseScale()
      }
    }
  }, [pdfSlick])

  // Get the scrollable viewer element from PDFSlick
  const getScrollableElement = useCallback((): HTMLElement | null => {
    if (!viewerContainerRef.current) return null
    // Find the scrollable container inside PDFSlickViewer
    const viewerEl = viewerContainerRef.current.querySelector('.pdfViewer')
    return viewerEl?.parentElement as HTMLElement | null
  }, [])

  // Handle drag to pan when zoomed
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale > 1) {
      const scrollContainer = getScrollableElement()
      if (scrollContainer) {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setScrollStart({ 
          x: scrollContainer.scrollLeft, 
          y: scrollContainer.scrollTop 
        })
        e.preventDefault()
      }
    }
  }, [scale, getScrollableElement])

  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (isDragging) {
      const scrollContainer = getScrollableElement()
      if (scrollContainer) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        scrollContainer.scrollLeft = scrollStart.x - dx
        scrollContainer.scrollTop = scrollStart.y - dy
      }
    }
  }, [isDragging, dragStart, scrollStart, getScrollableElement])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse events for dragging (in case mouse leaves the container)
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
      const handleGlobalMouseUp = () => setIsDragging(false)
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, handleMouseMove])

  const handleDoubleClick = useCallback(() => {
    if (pdfSlick?.viewer) {
      pdfSlick.viewer.currentScale = 1
    }
  }, [pdfSlick])

  return (
    <div 
      ref={containerRef}
      className='relative w-full h-full bg-slate-200/70 pdfSlick'
    >
      {/* Zoom Controls */}
      <div className='absolute top-2 right-2 z-10 flex gap-1 p-2 rounded-lg shadow-md bg-card/90'>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className='p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50'
          title='Alejar'
          disabled={!pdfSlick || scale <= 0.25}
        >
          <IconZoomOut size={20} className='text-slate-600' />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomReset(); }}
          className='p-1.5 rounded hover:bg-slate-200 transition-colors text-sm font-medium text-slate-600 min-w-[50px]'
          title='Restablecer zoom (100%)'
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className='p-1.5 rounded hover:bg-slate-200 transition-colors disabled:opacity-50'
          title='Acercar'
          disabled={!pdfSlick || scale >= 5}
        >
          <IconZoomIn size={20} className='text-slate-600' />
        </button>
      </div>
      
      {/* PDF Viewer Container */}
      <div 
        ref={viewerContainerRef}
        className='w-full h-full'
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} />
      </div>

      {/* Drag overlay - only visible when zoomed, captures mouse events for panning */}
      {scale > 1 && (
        <div
          className='absolute inset-0 z-5'
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => handleMouseMove(e)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        />
      )}
    </div>
  )
}

export default SimplePDFViewer
