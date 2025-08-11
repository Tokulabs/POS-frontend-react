import { useRef, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'

interface UsePrintInfoOptions {
  getContent?: () => HTMLElement | null
  documentTitle?: string
  onAfterPrint?: () => void
  autoPrint?: boolean
}

const usePrintInfo = (
  options?: UsePrintInfoOptions,
  externalRef?: React.RefObject<HTMLDivElement>
) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const refToUse = externalRef || internalRef

  const content = options?.getContent
    ? options.getContent
    : () => refToUse.current

  const triggerPrint = useReactToPrint({
    content,
    documentTitle: options?.documentTitle || 'Reporte',
    onAfterPrint: options?.onAfterPrint,
    removeAfterPrint: false,
  })

  useEffect(() => {
    if (options?.autoPrint) {
      triggerPrint()
    }
  }, [])

  return {
    printContentRef: refToUse,
    triggerPrint,
  }
}

export default usePrintInfo