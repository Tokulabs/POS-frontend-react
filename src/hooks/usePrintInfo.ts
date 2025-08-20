import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

interface UsePrintInfoOptions {
  documentTitle?: string
  onAfterPrint?: () => void
}

const usePrintInfo = (options?: UsePrintInfoOptions) => {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    onAfterPrint: () => {
      options?.onAfterPrint?.()
    },
    documentTitle: options?.documentTitle || 'Reporte',
  })

  return {
    printContentRef: componentRef,
    triggerPrint: handlePrint,
  }
}

export default usePrintInfo
