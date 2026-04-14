import { FC, useContext, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconCrown, IconCrownOff, IconSearch, IconUserShield } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { store } from '@/store'
import { useCompanyRoles } from '@/hooks/useCompanyRoles'
import { getUsersNew } from '@/pages/Users/helpers/services'
import { assignOwnerUser, removeOwnerUser } from '@/pages/Users/helpers/services'
import { usersURL } from '@/utils/network'
import { axiosRequest } from '@/api/api'
import { IUserProps } from '@/pages/Users/types/UserTypes'

const getOwners = async (): Promise<IUserProps[]> => {
    const response = await axiosRequest<IUserProps[]>({
        url: `${usersURL}/owners/`,
        hasAuth: true,
        showError: false,
    })
    return response?.data ?? []
}

const OwnersSettings: FC = () => {
    const queryClient = useQueryClient()
    const { state } = useContext(store)
    const currentUserId = state.user?.id

    const [search, setSearch] = useState('')
    const [removeTarget, setRemoveTarget] = useState<IUserProps | null>(null)
    const [selectedRoleId, setSelectedRoleId] = useState<string>('')

    const { companyRoles } = useCompanyRoles()
    const nonOwnerRoles = companyRoles.filter((r) => !r.is_owner)

    // Current owners list
    const { data: owners = [], isLoading: loadingOwners } = useQuery({
        queryKey: ['owners'],
        queryFn: getOwners,
        refetchOnWindowFocus: false,
    })

    // User search results (non-owners only)
    const { data: searchResults, isLoading: loadingSearch } = useQuery({
        queryKey: ['userSearch', search],
        queryFn: () => getUsersNew({ keyword: search }),
        enabled: search.trim().length > 1,
        refetchOnWindowFocus: false,
    })

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['owners'] })
        queryClient.invalidateQueries({ queryKey: ['userSearch', search] })
    }

    const { mutate: mutateAssign, isPending: assigning } = useMutation({
        mutationFn: assignOwnerUser,
        onSuccess: () => {
            toast.success('Usuario asignado como propietario')
            invalidate()
        },
        onError: () => toast.error('No se pudo asignar como propietario'),
    })

    const { mutate: mutateRemove, isPending: removing } = useMutation({
        mutationFn: removeOwnerUser,
        onSuccess: () => {
            toast.success('Rol de propietario removido')
            setRemoveTarget(null)
            setSelectedRoleId('')
            invalidate()
        },
        onError: () => toast.error('No se pudo remover el rol de propietario'),
    })

    const ownerIds = new Set(owners.map((o) => String(o.id)))

    return (
        <div className='flex flex-col w-full h-full gap-6 p-4 md:px-8 overflow-y-auto'>
            {/* Header */}
            <div>
                <h2 className='text-xl font-bold'>Propietarios</h2>
                <p className='text-sm text-muted-foreground'>
                    Gestiona los usuarios con rol de propietario de la empresa
                </p>
            </div>

            {/* Current owners */}
            <div className='flex flex-col gap-3'>
                <Label className='text-sm font-semibold'>Propietarios actuales</Label>
                {loadingOwners ? (
                    <div className='flex flex-col gap-2'>
                        {[1, 2].map((i) => <Skeleton key={i} className='h-16 w-full rounded-xl' />)}
                    </div>
                ) : owners.length === 0 ? (
                    <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
                        <IconUserShield size={40} strokeWidth={1} />
                        <p className='text-sm'>No hay propietarios registrados</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-2'>
                        {owners.map((owner) => {
                            const isSelf = String(owner.id) === String(currentUserId)
                            return (
                                <div
                                    key={owner.id}
                                    className='flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm'
                                >
                                    <div className='flex flex-col gap-0.5'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-semibold text-sm'>{owner.fullname}</span>
                                            {isSelf && (
                                                <Badge variant='secondary' className='text-xs'>Tú</Badge>
                                            )}
                                            <Badge variant='outline' className='flex items-center gap-1 text-xs text-yellow-600 border-yellow-400'>
                                                <IconCrown size={10} />
                                                Propietario
                                            </Badge>
                                        </div>
                                        <span className='text-xs text-muted-foreground'>{owner.email}</span>
                                    </div>

                                    {!isSelf && (
                                        <button
                                            onClick={() => setRemoveTarget(owner)}
                                            disabled={removing}
                                            className='p-1.5 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-50'
                                            title='Remover propietario'
                                        >
                                            <IconCrownOff size={16} />
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className='h-px bg-border' />

            {/* Search & assign */}
            <div className='flex flex-col gap-3'>
                <Label className='text-sm font-semibold'>Asignar nuevo propietario</Label>
                <div className='relative'>
                    <IconSearch size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
                    <Input
                        className='pl-9'
                        placeholder='Buscar usuario por nombre o email...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {search.trim().length > 1 && (
                    <div className='flex flex-col gap-2'>
                        {loadingSearch ? (
                            <div className='flex flex-col gap-2'>
                                {[1, 2].map((i) => <Skeleton key={i} className='h-14 w-full rounded-xl' />)}
                            </div>
                        ) : (searchResults?.results ?? []).length === 0 ? (
                            <p className='text-sm text-muted-foreground text-center py-4'>No se encontraron usuarios</p>
                        ) : (
                            (searchResults?.results ?? []).map((user) => {
                                const alreadyOwner = ownerIds.has(String(user.id))
                                return (
                                    <div
                                        key={user.id}
                                        className='flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-card'
                                    >
                                        <div className='flex flex-col gap-0.5'>
                                            <span className='font-medium text-sm'>{user.fullname}</span>
                                            <span className='text-xs text-muted-foreground'>{user.email}</span>
                                        </div>
                                        {alreadyOwner ? (
                                            <Badge variant='outline' className='flex items-center gap-1 text-xs text-yellow-600 border-yellow-400 shrink-0'>
                                                <IconCrown size={10} />
                                                Propietario
                                            </Badge>
                                        ) : (
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                disabled={assigning}
                                                onClick={() => mutateAssign(user.id)}
                                                className='shrink-0 flex items-center gap-1'
                                            >
                                                <IconCrown size={14} />
                                                Asignar
                                            </Button>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Remove owner dialog */}
            <AlertDialog open={!!removeTarget} onOpenChange={(open) => { if (!open) { setRemoveTarget(null); setSelectedRoleId('') } }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover propietario — {removeTarget?.fullname}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Selecciona el rol que se le asignará al usuario al removerle el rol de propietario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                        <SelectTrigger>
                            <SelectValue placeholder='Seleccionar rol' />
                        </SelectTrigger>
                        <SelectContent>
                            {nonOwnerRoles.map((r) => (
                                <SelectItem key={r.id} value={String(r.id)}>
                                    {r.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={!selectedRoleId || removing}
                            onClick={() => {
                                if (!removeTarget || !selectedRoleId) return
                                mutateRemove({ id: removeTarget.id, role_id: Number(selectedRoleId) })
                            }}
                            className='bg-orange-500 hover:bg-orange-600'
                        >
                            {removing ? 'Removiendo...' : 'Confirmar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export { OwnersSettings }
