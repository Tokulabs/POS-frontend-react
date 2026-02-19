import { debounce } from 'lodash'
import { RefObject, useLayoutEffect, useState } from 'react'

export const useTableHeight = (ref: RefObject<Element | null>) => {
  // Keep the Table the height of the parent.
  const [tableHeight, setTableHeight] = useState<number>()
  const resizeTable = debounce(
    () => {
      const node = ref.current
      if (!node) {
        return
      }
      const { height } = node.getBoundingClientRect()
      // height of the content minus the header and footer
      setTableHeight(height - 125)
    },
    100,
    {
      trailing: true,
      maxWait: 100,
    },
  )

  useLayoutEffect(() => {
    resizeTable()
    window.addEventListener('resize', resizeTable)

    return () => {
      window.removeEventListener('resize', resizeTable)
    }
  }, [resizeTable])

  return tableHeight
}
