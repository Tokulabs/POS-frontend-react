import { FC, PropsWithChildren, ReactNode } from 'react'
import { Button, Table, Tooltip } from 'antd'
import { DataPropsForm } from '@/types/GlobalTypes'
import Search from 'antd/es/input/Search'
import { IconCirclePlus, IconRefresh } from '@tabler/icons-react'
import { useKeyPress } from '@/hooks/useKeyPress'

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
  onSearch?: (value: string) => void
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
  onSearch = () => null,
}) => {
  const moveToInput = () => {
    const input = document.getElementById('searchBarLayout')
    input?.focus()
  }
  useKeyPress('F3', () => {
    moveToInput()
  })
  return (
    <>
      <div className='bg-white h-full rounded p-4 flex flex-col justify-top gap-6'>
        <div className='flex justify-between items-center'>
          <h1 className='m-0 p-0 text-2xl text-green-1 font-semibold'>{pageTitle}</h1>
          <div className='flex items-end gap-3'>
            <div className='text-green-1 flex gap-4 items-center'>
              <Tooltip title='Refrescar datos'>
                <IconRefresh className='cursor-pointer' onClick={() => onSearch('')} />
              </Tooltip>
              <Search
                id='searchBarLayout'
                placeholder='Buscar (F3 para buscar)'
                onSearch={onSearch}
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
