import { FC, useContext } from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { navigationMenu } from '@/layouts/MainLayout/data/data'
import { store } from '@/store'
import { useSubscription } from '@/hooks/useSubscription'

interface NavigationMenuComponentProps {
  openGoalsModal: () => void
  openDownloadModal: () => void
}

const NavigationMenuComponent: FC<NavigationMenuComponentProps> = ({
  openGoalsModal,
  openDownloadModal,
}) => {
  const { state } = useContext(store)
  const userPermissions = state.user?.company_role?.permissions ?? []
  const { featureFlags } = useSubscription()

  const hasPermission = (codename?: string) => {
    if (!codename) return true
    return userPermissions.some((p) => p.codename === codename)
  }

  const hasAnyPermission = (codenames?: string[]) => {
    if (!codenames || codenames.length === 0) return true
    return codenames.some((c) => userPermissions.some((p) => p.codename === c))
  }

  const hasFeatureFlag = (flag?: string) => {
    if (!flag) return true
    return featureFlags[flag] ?? false
  }

  const isChildVisible = (child: (typeof navigationMenu)[0]['children'] extends (infer T)[] | undefined ? T : never) => {
    if (!hasPermission(child.requiredPermission)) return false
    if (!hasAnyPermission(child.requiredAnyPermission)) return false
    if (!hasFeatureFlag(child.requiredFeatureFlag)) return false
    return true
  }

  return (
    <NavigationMenu className='relative z-50'>
      <NavigationMenuList className='gap-2 m-0 p-0'>
        {navigationMenu.map((item, index) => {
          const filteredChildren =
            item.children?.filter((child) => isChildVisible(child)) ?? []

          if (filteredChildren.length === 0) return null

          return (
            <NavigationMenuItem key={index}>
              <NavigationMenuTrigger className='border-none bg-transparent font-semibold'>
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent className='bg-card p-3 max-h-[280px] overflow-y-auto'>
                <ul
                  className={`grid w-full list-none p-0 gap-2 ${filteredChildren.length > 1 ? 'grid-cols-2 min-w-[520px]' : 'grid-cols-1 min-w-[250px]'
                    }`}
                >
                  {filteredChildren.map((child, childIndex) => (
                    <li key={childIndex}>
                      {child.link ? (
                        <NavigationMenuLink
                          className={`${navigationMenuTriggerStyle()}hover:bg-secondary no-underline text-foreground text-lg w-full h-full block ${child.disabled
                            ? 'cursor-not-allowed opacity-50 pointer-events-none'
                            : 'cursor-pointer'
                            }`}
                          href={child.link}
                        >
                          <div className='grid grid-cols-1 gap-0 w-[228px]'>
                            <span className='text-base font-semibold'>{child.label}</span>
                            <span className='text-gray-500 wrap-break-word whitespace-normal text-xs'>
                              {child.description}
                            </span>
                          </div>
                        </NavigationMenuLink>
                      ) : (
                        <div
                          className={`${navigationMenuTriggerStyle()} hover:bg-secondary no-underline text-foreground text-lg h-full block ${child.disabled
                            ? 'cursor-not-allowed opacity-50 pointer-events-none'
                            : 'cursor-pointer'
                            }`}
                          onClick={() => {
                            if (child.disabled) return
                            if (child.action === 'openGoalsModal') openGoalsModal()
                            if (child.action === 'openDownloadModal') openDownloadModal()
                          }}
                        >
                          <div className='grid grid-cols-1 gap-0 w-full max-w-[228px]'>
                            <span className='text-base font-semibold'>{child.label}</span>
                            <span className='text-gray-500 wrap-break-word whitespace-normal text-xs'>
                              {child.description}
                            </span>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}

        <NavigationMenuItem>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()} font-semibold no-underline text-foreground text-lg w-full h-full block bg-transparent`}
            href='/pos'
          >
            POS
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavigationMenuComponent
