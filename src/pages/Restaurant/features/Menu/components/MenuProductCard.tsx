import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconClock, IconEdit, IconTrash, IconToolsKitchen2 } from '@tabler/icons-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { IRestaurantProductDetail, MENU_CATEGORY_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface MenuProductCardProps {
  item: IRestaurantProductDetail
  onToggleAvailability: (id: number, is_available: boolean) => void
  onDelete: (id: number) => void
  isPatchPending: boolean
}

const MenuProductCard: FC<MenuProductCardProps> = ({
  item,
  onToggleAvailability,
  onDelete,
  isPatchPending,
}) => {
  const navigate = useNavigate()

  return (
    <Card
      className={`overflow-hidden transition-opacity ${!item.is_available ? 'opacity-60' : ''}`}
    >
      {/* Product photo */}
      <div
        className='relative h-36 bg-muted cursor-pointer flex items-center justify-center overflow-hidden'
        onClick={() => navigate(`/restaurant/menu/${item.id}`)}
      >
        {item.product_detail?.photo ? (
          <img
            src={item.product_detail.photo}
            alt={item.product_detail.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <IconToolsKitchen2 size={40} className='text-muted-foreground' />
        )}
        <Badge
          variant='secondary'
          className='absolute top-2 left-2 text-xs'
        >
          {MENU_CATEGORY_LABELS[item.menu_category]}
        </Badge>
      </div>

      <CardContent className='p-3 space-y-2'>
        {/* Name */}
        <p
          className='font-semibold text-sm leading-tight cursor-pointer hover:underline line-clamp-1'
          onClick={() => navigate(`/restaurant/menu/${item.id}`)}
        >
          {item.product_detail?.name}
        </p>

        {/* Price + prep time */}
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span className='font-medium text-foreground'>
            {formatNumberToColombianPesos(item.product_detail?.selling_price ?? 0, true)}
          </span>
          {item.prep_time_minutes > 0 && (
            <span className='flex items-center gap-1'>
              <IconClock size={12} />
              {item.prep_time_minutes} min
            </span>
          )}
        </div>

        {/* Actions row */}
        <div className='flex items-center justify-between pt-1 border-t border-border'>
          <div className='flex items-center gap-1.5'>
            <Switch
              checked={item.is_available}
              onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
              disabled={isPatchPending}
              className='scale-75 origin-left'
            />
            <span className='text-xs text-muted-foreground'>
              {item.is_available ? 'Disponible' : 'No disp.'}
            </span>
          </div>

          <div className='flex items-center gap-0.5'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              onClick={() => navigate(`/restaurant/menu/${item.id}`)}
            >
              <IconEdit size={14} />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-muted-foreground hover:text-destructive'
                >
                  <IconTrash size={14} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Quitar del menú</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que quieres quitar "{item.product_detail?.name}" del menú?
                    La receta también será eliminada. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  >
                    Sí, quitar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { MenuProductCard }
