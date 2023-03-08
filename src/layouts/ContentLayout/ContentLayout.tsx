import { FC, PropsWithChildren, ReactNode } from 'react'
import { Table } from 'antd'
import { DataPropsForm } from '../../types/AuthTypes'

interface IContentLayoutProps {
  pageTitle: string
  setModalState?: (value: boolean) => void
  buttonTitle?: string
  dataSource: DataPropsForm[] | undefined
  columns: DataPropsForm[]
  fetching: boolean
  extraButton?: ReactNode
  disabledAddButton?: boolean
}

const ContentLayout: FC<PropsWithChildren<IContentLayoutProps>> = ({
  pageTitle,
  setModalState,
  buttonTitle,
  dataSource,
  columns,
  fetching,
  children,
  extraButton,
  disabledAddButton = false,
}) => {
  return (
    <>
      <div className='bg-white rounded p-4 flex flex-col gap-8'>
        <div className='flex justify-between items-center'>
          <h1 className='m-0 p-0 text-base font-semibold'>{pageTitle}</h1>
          <div className='flex items-center'>
            <div>
              <input type='text' />
            </div>
            {!disabledAddButton && (
              <button onClick={() => setModalState && setModalState(true)} className='ml-3'>
                {buttonTitle}
              </button>
            )}
            {extraButton}
          </div>
        </div>
        <Table dataSource={dataSource} columns={columns} loading={fetching} size='middle' />
      </div>
      {children}
    </>
  )
}

export default ContentLayout
