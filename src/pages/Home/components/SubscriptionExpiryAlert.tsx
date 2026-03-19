import { FC, useContext } from 'react'
import { IconAlertTriangle, IconAlertCircle } from '@tabler/icons-react'
import { store } from '@/store'

const SubscriptionExpiryAlert: FC = () => {
  const { state } = useContext(store)
  const isOwner = state.user?.company_role?.is_owner ?? false
  const currentPlan = state.user?.current_plan

  // Only owners receive current_plan; lifetime subscriptions never expire
  if (!isOwner || !currentPlan || currentPlan.billing_period === 'lifetime') return null

  const { days_until_expiry, status, period_end } = currentPlan

  const formattedDate = period_end
    ? new Date(`${period_end}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    : null
  const isExpired = status === 'past_due' || (days_until_expiry !== null && days_until_expiry <= 0)
  const isExpiringSoon = !isExpired && days_until_expiry !== null && days_until_expiry <= 7

  if (!isExpired && !isExpiringSoon) return null

  if (isExpired) {
    return (
      <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3'>
        <IconAlertCircle size={18} className='text-destructive shrink-0 mt-0.5' />
        <div className='flex flex-col gap-0.5'>
          <span className='text-sm font-semibold text-foreground'>Suscripción vencida</span>
          <span className='text-sm text-muted-foreground'>
            Tu plan <span className='font-medium text-foreground'>{currentPlan.name}</span> ha vencido.
            Contacta a soporte para renovarlo.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3'>
      <IconAlertTriangle size={18} className='text-yellow-500 shrink-0 mt-0.5' />
      <div className='flex flex-col gap-0.5'>
        <span className='text-sm font-semibold text-foreground'>Plan próximo a vencer</span>
        <span className='text-sm text-muted-foreground'>
          Tu plan <span className='font-medium text-foreground'>{currentPlan.name}</span> vence
          el <span className='font-medium text-foreground'>{formattedDate}</span> ({days_until_expiry} {days_until_expiry === 1 ? 'día' : 'días'}).
          Contacta a soporte para renovarlo.
        </span>
      </div>
    </div>
  )
}

export { SubscriptionExpiryAlert }
