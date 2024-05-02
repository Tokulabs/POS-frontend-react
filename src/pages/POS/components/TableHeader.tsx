import { FC } from 'react'
import { ITableHeaderProps } from './types/TableTypes'

export const TableHeader: FC<ITableHeaderProps> = ({ tableColumnsData }) => {
  return (
    <section
      className={
        'w-full grid grid-cols-12 gap-3 border-t-0 border-x-0 border-solid border-b-[1px] py-3 font-semibold border-green-2 text-center text-sm place-items-center mt-5 text-white bg-green-1 rounded-md px-1'
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
