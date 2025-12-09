import { FC, PropsWithChildren, ReactNode, useRef } from 'react'
import { Button, Dropdown, Table, TableColumnsType, Tooltip } from 'antd'
import { DataPropsForm } from '@/types/GlobalTypes'
import Search from 'antd/es/input/Search'
import { IconAdjustmentsHorizontal, IconCirclePlus, IconRefresh } from '@tabler/icons-react'
import { useKeyPress } from '@/hooks/useKeyPress'
import { useTableHeight } from '@/hooks/useTableHeader'

interface IContentLayoutProps {
  pageTitle: string
  setModalState?: (value: boolean) => void
  buttonTitle?: string
  dataSource: DataPropsForm[] | undefined
  columns: TableColumnsType
  fetching: boolean
  totalItems: number
  currentPage: number
  extraButton?: ReactNode
  leftButton?: ReactNode
  filterOptions?: { label: ReactNode; key: number }[]
  onChangePage?: (page: number) => void
  onSearch?: (value: string) => void
  onRowClick?: (record: DataPropsForm, index: number) => void
}

const ContentLayout: FC<PropsWithChildren<IContentLayoutProps>> = ({
  pageTitle,
  setModalState,
  buttonTitle,
  dataSource,
  columns,
  fetching,
  children,
  leftButton,
  extraButton,
  filterOptions,
  totalItems,
  currentPage,
  onChangePage = () => null,
  onSearch = () => null,
  onRowClick = () => null,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const tableHeight = useTableHeight(contentRef)

  const moveToInput = () => {
    const input = document.getElementById('searchBarLayout')
    input?.focus()
  }
  useKeyPress('F3', () => {
    moveToInput()
  })
  return (
    <>
      <div className='bg-card h-full rounded p-4 flex flex-col justify-top gap-6'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <h1 className='m-0 p-0 text-2xl text-green-1 font-semibold'>{pageTitle}</h1>
            {leftButton && (
              <div className='border-solid border-0 border-l-[1px] border-green-1 pl-3'>
                {leftButton}
              </div>
            )}
          </div>
          <div className='flex items-end gap-3'>
            <div className='text-green-1 flex gap-4 items-center justify-center'>
              {filterOptions && (
                <Tooltip title='Filtrar datos'>
                  <>
                    <Dropdown
                      menu={{ items: filterOptions }}
                      placement='bottomRight'
                      className='cursor-pointer flex items-center justify-center'
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <IconAdjustmentsHorizontal />
                      </a>
                    </Dropdown>
                  </>
                </Tooltip>
              )}
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
        <div className='h-full overflow-hidden overflow-y-auto scrollbar-hide' ref={contentRef}>
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
            scroll={{ y: tableHeight }}
            onRow={(record, rowIndex) => ({
              onClick: () => onRowClick(record, rowIndex ?? 0),
            })}
            rowClassName={() => 'cursor-pointer'}
          />
        </div>
      </div>
      {children}
    </>
  )
}

export default ContentLayout
