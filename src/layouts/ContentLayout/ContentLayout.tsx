import { FC, PropsWithChildren, ReactNode } from 'react'
import { Button, Table } from 'antd'
import { DataPropsForm } from '../../types/GlobalTypes'
import Search from 'antd/es/input/Search'
import { IconCirclePlus } from '@tabler/icons-react'

interface IContentLayoutProps {
  pageTitle: string
  setModalState?: (value: boolean) => void
  buttonTitle?: string
  dataSource: DataPropsForm[] | undefined
  columns: DataPropsForm[]
  fetching: boolean
  totalItems: number
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
  totalItems,
  currentPage,
  onChangePage = () => null,
}) => {
  return (
    <>
      <div className='bg-white h-full rounded p-4 flex flex-col justify-top gap-6'>
        <div className='flex justify-between items-center'>
          <h1 className='m-0 p-0 text-2xl text-green-1 font-semibold'>{pageTitle}</h1>
          <div className='flex items-center'>
            <div>
              <Search
                placeholder='input search text'
                onSearch={() => console.log('buscar')}
                enterButton
              />
            </div>
            {buttonTitle && (
              <Button
                type='primary'
                onClick={() => setModalState && setModalState(true)}
                className='ml-3 flex justify-center items-center gap-2'
              >
                <IconCirclePlus />
                {buttonTitle}
              </Button>
            )}
            {extraButton}
          </div>
        </div>
        <div className='h-full overflow-hidden overflow-y-auto scrollbar-hide'>
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={fetching}
            size='middle'
            pagination={{
              current: currentPage,
              total: totalItems,
              size: 'small',
              onChange: (page) => onChangePage(page),
              showSizeChanger: false,
            }}
          />
        </div>
      </div>
      {children}
    </>
  )
}

export default ContentLayout
