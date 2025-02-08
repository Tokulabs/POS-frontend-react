import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { IconCheck, IconSearch } from '@tabler/icons-react'
import { FC, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { getCustomers } from '../../helpers/services'
import { AxiosError } from 'axios'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { useQueryClient } from '@tanstack/react-query'
import { ICustomerProps } from '../types/CustomerTypes'
import { useKeyPress } from '@/hooks/useKeyPress'
import { toast } from 'sonner'

interface SearchProps {
  open: boolean
  setOpen: (value: boolean) => void
}

export const SearchCustomer: FC<SearchProps> = ({ open, setOpen }) => {
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [dataSearch, setDataSearch] = useState<ICustomerProps[]>([])

  const moveToInput = () => {
    const input = document.getElementById('search')
    input?.focus()
  }

  useKeyPress('F3', () => {
    moveToInput()
    setSearchValue('')
  })

  const { updateCustomerData } = useCustomerData()
  const queryClient = useQueryClient()

  const handleSearch = (newValue: string) => {
    debouncedSearch(newValue)
    setSearchValue(newValue)
  }

  const fetchCustomersByKeyword = async (keyword: string) => {
    try {
      setIsLoadingSearch(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['customerByKeyword'],
        queryFn: async () => getCustomers({ keyword, page: 1 }),
      })
      setDataSearch(data?.results || [])
    } catch (error) {
      const e = error as AxiosError
      console.error(e)
    } finally {
      setIsLoadingSearch(false)
    }
  }

  useEffect(() => {
    if (open && dataSearch.length === 0) {
      fetchCustomersByKeyword('2222222')
    }
  }, [open])

  const debouncedSearch = useRef(
    debounce(async (criteria) => {
      fetchCustomersByKeyword(criteria)
    }, 1000),
  ).current

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleChangeSearch = (newValue: string) => {
    const item = dataSearch.find((item) => item.document_id === newValue)
    updateCustomerData({
      id: item?.id as number,
      name: item?.name || '',
      idNumber: item?.document_id || '',
      documentType: item?.document_type || '',
      phone: item?.phone || '',
      address: item?.address || '',
      city: item?.city.name || '',
      email: item?.email || '',
    })
    toast.success(
      <span className='flex items-center gap-2 font-semibold'>
        <IconCheck className='text-green-1' /> Cliente:
        <span className='font-bold'>{item?.name}</span> Seleccionado
      </span>,
    )
    setDataSearch([])
    setOpen(false)
  }

  return (
    <section className='flex flex-col gap-3'>
      <div className='flex h-auto w-full items-center justify-center gap-2'>
        <Label htmlFor='search'>
          <IconSearch size={25} className='text-green-1' />
        </Label>
        <Input
          disabled={isLoadingSearch}
          type='text'
          id='search'
          value={searchValue}
          placeholder='Buscar por nombre o documento (F3 para buscar)'
          className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>
      <div className='w-full h-auto overflow-y-auto scrollbar-hide max-h-[300px] '>
        <Table>
          <TableCaption>Selecciona el cliente</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className='text-green-1'>Nombre</TableHead>
              <TableHead className='text-green-1'>Tipo Doc</TableHead>
              <TableHead className='text-green-1'>Número</TableHead>
              <TableHead className='text-right text-green-1'>Correo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSearch ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center'>
                  Cargando...
                </TableCell>
              </TableRow>
            ) : dataSearch.length > 0 ? (
              dataSearch.map((client) => (
                <TableRow
                  key={client.id}
                  className='cursor-pointer hover:bg-green-1 hover:bg-opacity-20'
                  onClick={() => handleChangeSearch(client.document_id)}
                >
                  <TableCell className='font-medium'>{client.name}</TableCell>
                  <TableCell>{client.document_type}</TableCell>
                  <TableCell>{client.document_id}</TableCell>
                  <TableCell className='text-right'>{client.email}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className='text-center'>
                <TableCell colSpan={4}>No se encontraron resultados</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
