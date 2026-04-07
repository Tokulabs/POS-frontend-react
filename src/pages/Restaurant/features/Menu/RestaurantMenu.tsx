import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCirclePlus, IconToolsKitchen2, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useRestaurantMenu } from '@/hooks/restaurant/useRestaurantMenu'
import { MenuCategory, MENU_CATEGORY_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'
import { MenuProductCard } from './components/MenuProductCard'
import { AddToMenuModal, AddToMenuFormValues } from './components/AddToMenuModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PAGE_SIZE = 10

const CATEGORY_TABS: Array<{ value: MenuCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'starter', label: MENU_CATEGORY_LABELS.starter },
  { value: 'main', label: MENU_CATEGORY_LABELS.main },
  { value: 'dessert', label: MENU_CATEGORY_LABELS.dessert },
  { value: 'drink', label: MENU_CATEGORY_LABELS.drink },
  { value: 'side', label: MENU_CATEGORY_LABELS.side },
  { value: 'combo', label: MENU_CATEGORY_LABELS.combo },
]

const RestaurantMenu: FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<MenuCategory | 'all'>('all')
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)

  const category = activeTab === 'all' ? '' : activeTab
  const { isLoading, menuItems, totalCount, addToMenu, createCombo, patchMenuItem, removeFromMenu } =
    useRestaurantMenu({ keyword, page, category })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [keyword, activeTab])

  const handleTabChange = (v: string) => {
    setActiveTab(v as MenuCategory | 'all')
  }

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setKeyword(searchInput.trim())
  }

  const handleAddToMenu = (values: AddToMenuFormValues) => {
    addToMenu.mutate(values, {
      onSuccess: () => {
        toast.success('Producto agregado al menú')
        setModalOpen(false)
      },
      onError: (error: any) => {
        const status = error?.response?.status
        if (status === 400) {
          toast.error('Este producto ya está en el menú')
        } else {
          toast.error('Error al agregar el producto')
        }
      },
    })
  }

  const handleCreateCombo = (values: { name: string; selling_price: number }) => {
    createCombo.mutate(values, {
      onSuccess: (response: any) => {
        const newId = response?.data?.id
        toast.success('Combo creado — agrega los productos ahora')
        setModalOpen(false)
        if (newId) navigate(`/restaurant/menu/${newId}`)
      },
      onError: () => toast.error('Error al crear el combo'),
    })
  }

  const handleToggleAvailability = (id: number, is_available: boolean) => {
    patchMenuItem.mutate(
      { id, is_available },
      { onError: () => toast.error('Error al actualizar la disponibilidad') },
    )
  }

  const handleDelete = (id: number) => {
    removeFromMenu.mutate(id, {
      onSuccess: () => toast.success('Producto quitado del menú'),
      onError: () => toast.error('Error al quitar el producto del menú'),
    })
  }

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Menú del Restaurante</h1>
        <div className='flex items-center gap-3'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <Input
              placeholder='Buscar producto...'
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === '') setKeyword('')
              }}
              className='w-48'
            />
            <Button type='submit' variant='outline' size='sm'>
              Buscar
            </Button>
          </form>
          <Button onClick={() => setModalOpen(true)} className='gap-2'>
            <IconCirclePlus size={16} />
            Agregar al menú
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className='flex-wrap h-auto gap-1'>
          {CATEGORY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className='text-xs'>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-52 rounded-lg' />
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconToolsKitchen2 size={36} className='opacity-40' />
            <p className='text-sm'>
              {keyword
                ? 'Sin resultados para tu búsqueda.'
                : activeTab === 'all'
                ? 'No tienes productos en el menú. Agrega uno con el botón de arriba.'
                : `No hay productos en la categoría "${MENU_CATEGORY_LABELS[activeTab as MenuCategory]}".`}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {menuItems.map((item) => (
              <MenuProductCard
                key={item.id}
                item={item}
                onToggleAvailability={handleToggleAvailability}
                onDelete={handleDelete}
                isPatchPending={patchMenuItem.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{totalCount} productos · Página {page} de {totalPages}</span>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft size={15} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <IconChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <AddToMenuModal
        open={modalOpen}
        existingMenuItems={menuItems}
        onSubmit={handleAddToMenu}
        onCreateCombo={handleCreateCombo}
        onCancel={() => setModalOpen(false)}
        isPending={addToMenu.isPending || createCombo.isPending}
      />
    </div>
  )
}

export { RestaurantMenu }
