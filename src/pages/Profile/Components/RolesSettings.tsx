import { FC, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconPlus, IconLock, IconPencil, IconTrash, IconShieldCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanyRoles, usePermissionsGrouped } from '@/hooks/useCompanyRoles'
import { postCompanyRole, putCompanyRole, deleteCompanyRole } from '../helpers/rolesServices'
import { ICompanyRole } from '../types/RoleTypes'

const MODULE_LABELS: Record<string, string> = {
    invoicing: 'Facturación',
    inventory: 'Inventario',
    purchases: 'Compras',
    customers: 'Clientes',
    reports: 'Reportes',
    settings: 'Configuración',
}

const RolesSettings: FC = () => {
    const queryClient = useQueryClient()
    const { isPending: loadingRoles, companyRoles } = useCompanyRoles()
    const { isPending: loadingPerms, permissionsGrouped } = usePermissionsGrouped()

    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<ICompanyRole | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ICompanyRole | null>(null)

    // Form state
    const [roleName, setRoleName] = useState('')
    const [roleDescription, setRoleDescription] = useState('')
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())

    const openCreate = () => {
        setEditingRole(null)
        setRoleName('')
        setRoleDescription('')
        setSelectedPerms(new Set())
        setDrawerOpen(true)
    }

    const openEdit = (role: ICompanyRole) => {
        setEditingRole(role)
        setRoleName(role.name)
        setRoleDescription(role.description ?? '')
        setSelectedPerms(new Set(role.permissions.map((p) => p.codename)))
        setDrawerOpen(true)
    }

    const togglePerm = (codename: string) => {
        setSelectedPerms((prev) => {
            const next = new Set(prev)
            if (next.has(codename)) next.delete(codename)
            else next.add(codename)
            return next
        })
    }

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['companyRoles'] })

    const { mutate: create, isPending: creating } = useMutation({
        mutationFn: postCompanyRole,
        onSuccess: () => {
            toast.success('Rol creado exitosamente')
            setDrawerOpen(false)
            invalidate()
        },
        onError: () => toast.error('Error al crear el rol'),
    })

    const { mutate: update, isPending: updating } = useMutation({
        mutationFn: putCompanyRole,
        onSuccess: () => {
            toast.success('Rol actualizado exitosamente')
            setDrawerOpen(false)
            invalidate()
        },
        onError: () => toast.error('Error al actualizar el rol'),
    })

    const { mutate: remove, isPending: deleting } = useMutation({
        mutationFn: deleteCompanyRole,
        onSuccess: () => {
            toast.success('Rol eliminado')
            setDeleteTarget(null)
            invalidate()
        },
        onError: (error: Error) => {
            toast.error(error.message ?? 'Error al eliminar el rol')
            setDeleteTarget(null)
        },
    })

    const handleSave = () => {
        if (!roleName.trim()) {
            toast.error('El nombre del rol es requerido')
            return
        }
        const payload = {
            name: roleName.trim(),
            description: roleDescription.trim() || undefined,
            permissions: Array.from(selectedPerms),
        }
        if (editingRole) {
            update({ id: editingRole.id, payload })
        } else {
            create(payload)
        }
    }

    const isBusy = creating || updating

    return (
        <div className='flex flex-col w-full h-full gap-5 p-4 md:px-8 overflow-y-auto'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-xl font-bold'>Roles y Permisos</h2>
                    <p className='text-sm text-muted-foreground'>
                        Crea roles personalizados y asigna permisos a cada uno
                    </p>
                </div>
                <Button onClick={openCreate} className='flex items-center gap-2'>
                    <IconPlus size={16} />
                    Nuevo Rol
                </Button>
            </div>

            {/* Roles list */}
            {loadingRoles ? (
                <div className='flex flex-col gap-3'>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className='h-24 w-full rounded-xl' />
                    ))}
                </div>
            ) : companyRoles.length === 0 ? (
                <div className='flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground'>
                    <IconShieldCheck size={48} strokeWidth={1} />
                    <p className='text-sm'>No hay roles creados aún</p>
                </div>
            ) : (
                <div className='flex flex-col gap-3'>
                    {companyRoles.map((role) => (
                        <div
                            key={role.id}
                            className='flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm'
                        >
                            <div className='flex flex-col gap-1 flex-1 min-w-0'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <span className='font-semibold text-sm'>{role.name}</span>
                                    {role.is_owner && (
                                        <Badge variant='secondary' className='flex items-center gap-1 text-xs'>
                                            <IconLock size={10} />
                                            Owner
                                        </Badge>
                                    )}
                                    <Badge variant='outline' className='text-xs'>
                                        {role.permissions.length} permiso{role.permissions.length !== 1 ? 's' : ''}
                                    </Badge>
                                    <Badge variant='outline' className='text-xs'>
                                        {role.user_count} usuario{role.user_count !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                {role.description && (
                                    <p className='text-xs text-muted-foreground truncate'>{role.description}</p>
                                )}
                            </div>

                            {!role.is_owner && (
                                <div className='flex items-center gap-2 shrink-0'>
                                    <button
                                        onClick={() => openEdit(role)}
                                        className='p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                                        title='Editar rol'
                                    >
                                        <IconPencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(role)}
                                        className='p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors'
                                        title='Eliminar rol'
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Sheet */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className='w-full sm:max-w-md flex flex-col overflow-y-auto scrollbar-hide border-l border-border shadow-2xl'>
                    <SheetHeader>
                        <SheetTitle>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</SheetTitle>
                        <SheetDescription>
                            {editingRole
                                ? 'Modifica el nombre, descripción y permisos del rol.'
                                : 'Define un nombre y asigna los permisos que tendrá este rol.'}
                        </SheetDescription>
                    </SheetHeader>

                    <div className='flex flex-col gap-5 flex-1 py-4 overflow-y-auto scrollbar-hide'>
                        {/* Name */}
                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='role-name'>
                                Nombre <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                                id='role-name'
                                placeholder='Ej: Vendedor, Caja, Bodega...'
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                disabled={isBusy}
                            />
                        </div>

                        {/* Description */}
                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='role-desc'>Descripción</Label>
                            <Input
                                id='role-desc'
                                placeholder='Descripción opcional'
                                value={roleDescription}
                                onChange={(e) => setRoleDescription(e.target.value)}
                                disabled={isBusy}
                            />
                        </div>

                        {/* Permissions grouped by module */}
                        <div className='flex flex-col gap-1.5'>
                            <Label>Permisos</Label>
                            {loadingPerms ? (
                                <div className='flex flex-col gap-2'>
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className='h-8 w-full rounded-md' />)}
                                </div>
                            ) : (
                                <div className='flex flex-col gap-5 mt-1'>
                                    {Object.entries(permissionsGrouped).map(([module, perms]) => {
                                        const allSelected = perms.every((p) => selectedPerms.has(p.codename))
                                        const toggleAll = () => {
                                            setSelectedPerms((prev) => {
                                                const next = new Set(prev)
                                                if (allSelected) {
                                                    perms.forEach((p) => next.delete(p.codename))
                                                } else {
                                                    perms.forEach((p) => next.add(p.codename))
                                                }
                                                return next
                                            })
                                        }
                                        return (
                                            <div key={module} className='flex flex-col gap-2'>
                                                {/* Module header — dot + expanding line */}
                                                <div className='flex items-center gap-2 my-1'>
                                                    <div className='w-2 h-2 rounded-full bg-primary shrink-0' />
                                                    <span className='text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap'>
                                                        {MODULE_LABELS[module] ?? module}
                                                    </span>
                                                    <div className='flex-1 h-px bg-border' />
                                                    <button
                                                        type='button'
                                                        onClick={toggleAll}
                                                        disabled={isBusy}
                                                        className='text-xs text-primary hover:text-primary/70 font-medium transition-colors disabled:opacity-50 whitespace-nowrap'
                                                    >
                                                        {allSelected ? 'Desmarcar todo' : 'Seleccionar todo'}
                                                    </button>
                                                </div>
                                                {/* Permissions under subtle left border */}
                                                <div className='flex flex-col gap-3 pl-3 border-l-2 border-muted ml-0.5'>
                                                    {perms.map((perm) => (
                                                        <div
                                                            key={perm.codename}
                                                            className='flex items-center justify-between gap-3'
                                                        >
                                                            <span className='text-sm leading-tight'>{perm.name}</span>
                                                            <Switch
                                                                checked={selectedPerms.has(perm.codename)}
                                                                onCheckedChange={() => togglePerm(perm.codename)}
                                                                disabled={isBusy}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <SheetFooter className='pt-4 border-t border-border'>
                        <Button variant='outline' onClick={() => setDrawerOpen(false)} disabled={isBusy}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isBusy}>
                            {isBusy ? 'Guardando...' : editingRole ? 'Guardar cambios' : 'Crear Rol'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar rol "{deleteTarget?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Si hay usuarios asignados a este rol, no podrá
                            eliminarse.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteTarget && remove(deleteTarget.id)}
                            disabled={deleting}
                            className='bg-red-500 hover:bg-red-600'
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export { RolesSettings }
