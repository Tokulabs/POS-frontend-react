import { FC, useMemo } from 'react'
import { useDianResolutions } from '@/hooks/useDianResolution'
import { IconAlertTriangle, IconExternalLink } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'

/** Days threshold for "close to expire" warning */
const EXPIRY_WARNING_DAYS = 30
/** Invoice count threshold for "running low" warning */
const LOW_INVOICES_THRESHOLD = 100

interface WarningItem {
  type: 'expiring' | 'low_invoices' | 'no_active'
  prefix: string
  docNumber: string
  detail: string
  resType: string
}

const DianExpiryAlert: FC = () => {
  const navigate = useNavigate()
  const { hasPermission } = useRolePermissions({
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  })

  const { dianResolutionData: posData } = useDianResolutions('dashboardDianPOS', {
    type: 'POS',
  })
  const { dianResolutionData: feData } = useDianResolutions('dashboardDianFE', {
    type: 'ElectronicInvoice',
  })

  const warnings = useMemo<WarningItem[]>(() => {
    const items: WarningItem[] = []

    // Check if there's no active POS resolution
    const posResults = posData?.results ?? []
    if (posResults.length > 0 && !posResults.some((r) => r.active)) {
      items.push({
        type: 'no_active',
        prefix: '',
        docNumber: '',
        detail: 'No hay resolución POS activa. No podrás generar facturas POS.',
        resType: 'POS',
      })
    }

    const allResolutions = [
      ...posResults.map((r) => ({ ...r, resType: 'POS' })),
      ...(feData?.results ?? []).map((r) => ({ ...r, resType: 'F.E.' })),
    ]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const res of allResolutions) {
      if (!res.active) continue

      // Check expiration proximity
      try {
        const [year, month, day] = res.to_date.split('-').map(Number)
        const endDate = new Date(year, month - 1, day)
        const diffMs = endDate.getTime() - today.getTime()
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

        if (daysLeft <= 0) {
          items.push({
            type: 'expiring',
            prefix: res.prefix,
            docNumber: res.document_number,
            detail: `La resolución ha expirado`,
            resType: res.resType,
          })
        } else if (daysLeft <= EXPIRY_WARNING_DAYS) {
          items.push({
            type: 'expiring',
            prefix: res.prefix,
            docNumber: res.document_number,
            detail: `Expira en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`,
            resType: res.resType,
          })
        }
      } catch {
        // Skip invalid dates
      }

      // Check remaining invoices
      const remaining = res.to_number - res.current_number
      if (remaining <= LOW_INVOICES_THRESHOLD) {
        items.push({
          type: 'low_invoices',
          prefix: res.prefix,
          docNumber: res.document_number,
          detail:
            remaining <= 0
              ? 'Sin facturas disponibles'
              : `Solo ${remaining.toLocaleString()} ${remaining === 1 ? 'factura' : 'facturas'} disponible${remaining === 1 ? '' : 's'}`,
          resType: res.resType,
        })
      }
    }

    return items
  }, [posData, feData])

  if (!hasPermission || warnings.length === 0) return null

  return (
    <div className='rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <IconAlertTriangle size={18} className='text-yellow-500 shrink-0' />
        <h3 className='text-sm font-semibold text-foreground m-0'>
          Alertas de Resoluciones DIAN
        </h3>
      </div>

      <div className='space-y-2'>
        {warnings.map((w, idx) => (
          <div
            key={`${w.prefix}-${w.docNumber}-${w.type}-${idx}`}
            className='flex items-center gap-3 text-sm'
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                w.type === 'expiring' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className='text-muted-foreground'>
              {w.prefix && w.docNumber ? (
                <>
                  <span className='font-medium text-foreground'>
                    {w.prefix} - {w.docNumber}
                  </span>
                  {' '}({w.resType}) — {w.detail}
                </>
              ) : (
                <span className='font-medium text-foreground'>{w.detail}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dian-resolution')}
        className='flex items-center gap-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 
          hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors
          bg-transparent border-0 cursor-pointer p-0'
      >
        Ir a Resoluciones DIAN
        <IconExternalLink size={12} />
      </button>
    </div>
  )
}

export { DianExpiryAlert }
