import { useContext, useCallback } from 'react'
import { store } from '@/store/index'
import { ActionTypes } from '@/types/StoreTypes'
import { IQuotaUsageItem, ICurrentPlan } from '@/types/UserType'
import { authHandler } from '@/pages/Auth/helpers'

/**
 * Hook to access the current user's subscription data.
 *
 * Returns the active_products, feature_flags, quotas,
 * quota_usage, and current_plan from the MeView response.
 */
export const useSubscription = () => {
  const { state } = useContext(store)
  const user = state.user

  return {
    /** Product slugs with an active/trial subscription, e.g. ['pos_inventory'] */
    activeProducts: user?.active_products ?? [],

    /** Boolean flags from the plan, e.g. { can_void_invoice: true, ... } */
    featureFlags: user?.feature_flags ?? {},

    /** Numeric quotas from the plan, e.g. { max_users: -1, max_products: -1 } */
    quotas: user?.quotas ?? {},

    /** Quota usage with used/max/resets_at per quota key */
    quotaUsage: user?.quota_usage ?? {},

    /** Current plan info (only available for Owner role) */
    currentPlan: user?.current_plan ?? null,

    /** true once user data has loaded */
    isLoaded: user !== null,
  }
}

/**
 * Check if a specific feature is enabled in the current plan.
 *
 * Usage:
 *   const canVoid = useFeatureFlag('can_void_invoice')
 *   if (!canVoid) return <UpgradeBanner />
 */
export const useFeatureFlag = (flag: string): boolean => {
  const { featureFlags } = useSubscription()
  return featureFlags[flag] ?? false
}

/**
 * Check if the company has an active subscription for a product.
 *
 * Usage:
 *   const hasPos = useHasProduct('pos_inventory')
 */
export const useHasProduct = (productSlug: string): boolean => {
  const { activeProducts } = useSubscription()
  return activeProducts.includes(productSlug)
}

/**
 * Get quota usage info for a specific quota key.
 *
 * Returns { used, max, isUnlimited, resetsAt }.
 * -1 means unlimited.
 *
 * Usage:
 *   const { used, max, isUnlimited, resetsAt } = useQuota('products')
 *   // used = 32, max = 50, isUnlimited = false, resetsAt = null
 */
export const useQuota = (quotaKey: string): {
  used: number
  max: number
  isUnlimited: boolean
  resetsAt: string | null
} => {
  const { quotaUsage } = useSubscription()
  const item: IQuotaUsageItem | undefined = quotaUsage[quotaKey]
  if (!item) {
    return { used: 0, max: 0, isUnlimited: false, resetsAt: null }
  }
  return {
    used: item.used,
    max: item.max,
    isUnlimited: item.is_unlimited,
    resetsAt: item.resets_at,
  }
}

/**
 * Get the current plan info (Owner role only).
 *
 * Usage:
 *   const plan = useCurrentPlan()
 *   // plan = { slug: 'basico', name: 'Básico', product: 'POS + Inventario' }
 */
export const useCurrentPlan = (): ICurrentPlan | null => {
  const { currentPlan } = useSubscription()
  return currentPlan
}

/**
 * Returns a stable function that re-fetches /user/me and updates the store.
 * Call this after subscription changes (plan upgrade, new product activated, etc.)
 *
 * Usage:
 *   const refresh = useRefreshSubscription()
 *   await refresh()
 */
export const useRefreshSubscription = () => {
  const { dispatch } = useContext(store)
  return useCallback(async () => {
    const user = await authHandler()
    if (user) {
      dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: user })
    }
  }, [dispatch])
}
