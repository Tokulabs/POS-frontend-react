import { FC, PropsWithChildren, ReactNode } from 'react'
import { Table } from 'antd'
import { DataPropsForm } from '../../types/GlobalTypes'
import Search from 'antd/es/input/Search'

interface IContentLayoutProps {
  pageTitle: string
  setModalState?: (value: boolean) => void
  buttonTitle?: string
  dataSource: DataPropsForm[] | undefined
  columns: DataPropsForm[]
  fetching: boolean
  totalItems: number
  disabledAddButton?: boolean
  currentPage: number
  extraButton?: ReactNode
  onChangePage?: (page: number) => void
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
  totalItems,
  currentPage,
  onChangePage = () => null,
}) => {
  return (
    <>
      <div className='bg-white rounded p-4 flex flex-col gap-8'>
        <div className='flex justify-between items-center'>
          <h1 className='m-0 p-0 text-base font-semibold'>{pageTitle}</h1>
          <div className='flex items-center'>
            <div>
              <Search
                placeholder='input search text'
                onSearch={() => console.log('buscar')}
                enterButton
              />
            </div>
            {!disabledAddButton && (
              <button onClick={() => setModalState && setModalState(true)} className='ml-3'>
                {buttonTitle}
              </button>
            )}
            {extraButton}
          </div>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={fetching}
          size='small'
          pagination={{
            current: currentPage,
            total: totalItems,
            size: 'small',
            onChange: (page) => onChangePage(page),
            showSizeChanger: false,
          }}
        />
      </div>
      {children}
    </>
  )
}

export default ContentLayout
