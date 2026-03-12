import { FC, useContext } from 'react'
import { useSubscription, useCurrentPlan, useQuota } from '@/hooks/useSubscription'
import { store } from '@/store'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/pages/Dian/helpers/utils'

const QUOTA_LABELS: Record<string, { label: string; icon: string }> = {
  products: { label: 'Productos', icon: '📦' },
  users: { label: 'Usuarios', icon: '👥' },
  roles: { label: 'Roles', icon: '🔑' },
  resolutions: { label: 'Resoluciones DIAN', icon: '📋' },
  invoices_month: { label: 'Facturas (este mes)', icon: '🧾' },
  electronic_invoices_month: { label: 'Facturas electrónicas (este mes)', icon: '⚡' },
  credit_notes_month: { label: 'Notas de crédito (este mes)', icon: '📝' },
}

const QuotaRow: FC<{ quotaKey: string }> = ({ quotaKey }) => {
  const { used, max, isUnlimited, resetsAt } = useQuota(quotaKey)
  const meta = QUOTA_LABELS[quotaKey]
  if (!meta) return null

  const percentage = isUnlimited ? 0 : max > 0 ? Math.min((used / max) * 100, 100) : 0
  const isNearLimit = !isUnlimited && max > 0 && used >= max * 0.8
  const isAtLimit = !isUnlimited && max > 0 && used >= max

  return (
    <div className='flex flex-col gap-2 p-4 rounded-lg border border-border bg-background'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium'>
          {meta.icon} {meta.label}
        </span>
        <span className={`text-sm font-semibold ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-yellow-500' : 'text-foreground'}`}>
          {isUnlimited ? '∞ Sin límite' : max === 0 ? 'No disponible' : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && max > 0 && (
        <Progress value={percentage} className='h-2' />
      )}
      {resetsAt && (
        <span className='text-xs text-muted-foreground'>
          Se reinicia el {formatDate(resetsAt)}
        </span>
      )}
    </div>
  )
}

const SubscriptionInfo: FC = () => {
  const currentPlan = useCurrentPlan()
  const { featureFlags, quotaUsage } = useSubscription()
  const { state } = useContext(store)
  const isOwner = state.user?.company_role?.is_owner ?? false

  const FEATURE_LABELS: Record<string, string> = {
    can_void_invoice: 'Anular facturas',
    can_edit_payment_methods: 'Métodos de pago / Datáfonos',
    can_send_electronic_invoice: 'Facturación electrónica',
    can_import_inventory: 'Importar inventario (CSV)',
    can_manage_storage: 'Gestión de bodega',
    can_view_inventory_movements: 'Movimientos de inventario',
    can_view_purchases: 'Ver compras',
    can_manage_providers: 'Gestión de proveedores',
    can_download_daily_report: 'Reporte diario',
    can_download_inventory_report: 'Reporte de inventario',
    can_download_product_sales_report: 'Reporte de ventas por producto',
    can_download_invoices_report: 'Reporte de facturas',
    can_download_electronic_invoice_report: 'Reporte de factura electrónica',
    can_manage_users: 'Gestión de usuarios',
    can_view_user_activities: 'Actividad de usuarios',
    can_manage_roles: 'Roles y permisos',
    can_manage_goals: 'Metas de venta',
    can_use_credit_notes: 'Notas de crédito',
    can_use_usd_pricing: 'Precios en USD',
  }

  return (
    <div className='flex flex-col gap-6 p-4 md:p-6 overflow-y-auto h-full scrollbar-hide' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Plan Info (Owner only) */}
      {isOwner && currentPlan && (
        <div className='flex flex-col gap-2'>
          <h4 className='text-lg font-semibold'>Plan actual</h4>
          <div className='flex items-center gap-3 p-4 rounded-lg border border-border bg-background'>
            <div className='flex flex-col gap-1'>
              <span className='text-xl font-bold'>{currentPlan.name}</span>
              <span className='text-sm text-muted-foreground'>{currentPlan.product}</span>
              {currentPlan.period_start && currentPlan.period_end && (
                <span className='text-xs text-muted-foreground'>
                  Período: {formatDate(currentPlan.period_start)} — {formatDate(currentPlan.period_end)}
                </span>
              )}
            </div>
            <Badge variant='secondary' className='ml-auto text-xs'>
              {currentPlan.slug.toUpperCase()}
            </Badge>
          </div>
        </div>
      )}

      {/* Quota Usage */}
      <div className='flex flex-col gap-2'>
        <h4 className='text-lg font-semibold'>Uso de recursos</h4>
        <div className='grid gap-3 md:grid-cols-2'>
          {Object.keys(QUOTA_LABELS).map((key) =>
            quotaUsage[key] ? <QuotaRow key={key} quotaKey={key} /> : null
          )}
        </div>
      </div>

      {/* Feature Flags */}
      <div className='flex flex-col gap-2'>
        <h4 className='text-lg font-semibold'>Funcionalidades del plan</h4>
        <div className='grid gap-2 md:grid-cols-2'>
          {Object.entries(FEATURE_LABELS).map(([flag, label]) => {
            const enabled = featureFlags[flag] ?? false
            return (
              <div
                key={flag}
                className='flex items-center gap-2 p-3 rounded-lg border border-border bg-background text-sm'
              >
                <span>{enabled ? '✅' : '❌'}</span>
                <span className={enabled ? '' : 'text-muted-foreground'}>{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { SubscriptionInfo }
