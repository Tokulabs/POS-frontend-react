import { FC } from 'react'
import { ITableHeaderProps } from './types/TableTypes'

export const TableHeader: FC<ITableHeaderProps> = ({ tableColumnsData }) => {
  return (
    <section
      className={
        'w-full grid grid-cols-11 gap-3 border-t-0 border-x-0 border-solid border-b-[1px] py-2 font-semibold text-gray-2 border-gray-2 my-3 text-center text-sm'
      }
    >
      {tableColumnsData.map((item, index) => (
        <span key={index} className={item.tableStyles}>
          {item.tableTitle}
        </span>
      ))}
    </section>
  )
}
