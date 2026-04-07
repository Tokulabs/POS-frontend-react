import { FC, useState } from 'react'
import { IconEdit, IconTrash, IconCheck, IconX, IconPlus } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { IRestaurantArea } from '@/pages/Restaurant/types/RestaurantTypes'
import { toast } from 'sonner'

interface ManageAreasModalProps {
  open: boolean
  onClose: () => void
  areas: IRestaurantArea[]
  onCreate: (name: string) => Promise<void>
  onUpdate: (id: number, name: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const ManageAreasModal: FC<ManageAreasModalProps> = ({
  open,
  onClose,
  areas,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    setIsSaving(true)
    try {
      await onCreate(newName.trim())
      setNewName('')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return
    setIsSaving(true)
    try {
      await onUpdate(id, editingName.trim())
      setEditingId(null)
    } catch {
      toast.error('Error al actualizar el área')
    } finally {
      setIsSaving(false)
    }
  }

  const startEdit = (area: IRestaurantArea) => {
    setEditingId(area.id)
    setEditingName(area.name)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Gestionar áreas</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          {/* Existing areas */}
          {areas.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-4'>
              No hay áreas creadas todavía.
            </p>
          ) : (
            <div className='space-y-1'>
              {areas.map((area) => (
                <div key={area.id} className='flex items-center gap-2'>
                  {editingId === area.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className='h-8 flex-1 text-sm'
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate(area.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                      />
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-8 w-8 text-emerald-600 hover:text-emerald-700'
                        onClick={() => handleUpdate(area.id)}
                        disabled={isSaving}
                      >
                        <IconCheck size={14} />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-8 w-8 text-muted-foreground'
                        onClick={() => setEditingId(null)}
                      >
                        <IconX size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className='flex-1 text-sm'>{area.name}</span>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        onClick={() => startEdit(area)}
                      >
                        <IconEdit size={13} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8 text-muted-foreground hover:text-destructive'
                          >
                            <IconTrash size={13} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar área</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Eliminar el área "{area.name}"? Las mesas de esta área quedarán sin área asignada.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(area.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New area input */}
          <div className='flex gap-2 pt-1 border-t border-border'>
            <Input
              placeholder='Nombre del área (ej: Terraza)'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className='h-8 text-sm'
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <Button
              size='sm'
              onClick={handleCreate}
              disabled={!newName.trim() || isSaving}
              className='gap-1 shrink-0'
            >
              <IconPlus size={13} />
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ManageAreasModal }
