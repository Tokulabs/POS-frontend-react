import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { IconMenu2, IconCash, type IconProps, type Icon } from '@tabler/icons-react'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { navigationMenu } from '@/layouts/MainLayout/data/data'
import { useNavigate } from 'react-router-dom'
import {
  type ForwardRefExoticComponent,
  type RefAttributes,
  useState,
} from 'react'

const MobileNavigationMenu = ({
  openGoalsModal,
  openDownloadModal,
}: {
  openGoalsModal: () => void
  openDownloadModal: () => void
}) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className='flex cursor-pointer bg-none sm:hidden bg-transparent border-none'>
        <IconMenu2 className='h-6 w-6' />
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-[80vw] sm:w-[40vw] bg-gray-100 mr-3 rounded-lg shadow-lg px-3 py-2'>
        <Accordion type='single' collapsible className='w-full'>
          {navigationMenu.map((item, index) => {
            if (item.allowedRoles) {
              const { hasPermission } = useRolePermissions({
                allowedRoles: item.allowedRoles,
              })
              if (!hasPermission) return null
            }

            const filteredChildren =
              item.children?.filter((child) => {
                if (child.allowedRoles) {
                  const { hasPermission } = useRolePermissions({
                    allowedRoles: child.allowedRoles,
                  })
                  return hasPermission
                }
                return true
              }) ?? []

            if (filteredChildren.length === 0) return null

            return (
              <div key={index}>
                <Section
                  icon={item.icon}
                  label={item.label}
                  items={filteredChildren}
                  navigate={navigate}
                  setOpen={setOpen}
                  openGoalsModal={openGoalsModal}
                  openDownloadModal={openDownloadModal}
                />
              </div>
            )
          })}

          <div className='grid gap-1 mt-[-3.5%] justify-items-start px-3 pb-3'>
            <Button
              onClick={() => {
                navigate('/pos')
                setOpen(false)
              }}
              className='bg-transparent border-none shadow-none text-black hover:bg-transparent active:bg-transparent px-0 justify-start mt-3 scale-[120%]'
            >
              <IconCash size={18} className='mr-2' />
              POS
            </Button>
          </div>
        </Accordion>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Section = ({
  label,
  icon: Icon,
  items,
  navigate,
  setOpen,
  openGoalsModal,
  openDownloadModal,
}: {
  label: string
  icon?: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  items: {
    label: string
    link?: string
    action?: string
    description?: string
    allowedRoles?: string[]
  }[]
  navigate: ReturnType<typeof useNavigate>
  setOpen: (value: boolean) => void
  openGoalsModal: () => void
  openDownloadModal: () => void
}) => (
  <AccordionItem value={label.toLowerCase()}>
    <AccordionTrigger className='justify-between bg-transparent shadow-none text-black border-none text-base px-3'>
      <div className='flex items-center gap-2'>
        {Icon && <Icon className='h-4 w-4' />}
        {label}
      </div>
    </AccordionTrigger>
    <AccordionContent className='grid gap-1 mt-[-3.5%] justify-items-start text-blue-700 px-3 pb-3'>
      {items.map((item, i) => (
        <Button
          key={i}
          onClick={() => {
            if (item.link) {
              navigate(item.link)
              setOpen(false)
            }
            if (item.action === 'openGoalsModal') {
              openGoalsModal()
              setOpen(false)
            }
            if (item.action === 'openDownloadModal') {
              openDownloadModal()
              setOpen(false)
            }
          }}
          className='bg-transparent border-none shadow-none text-blue-700 hover:bg-transparent active:bg-transparent px-0 justify-start'
        >
          {item.label}
        </Button>
      ))}
    </AccordionContent>
  </AccordionItem>
)

export { MobileNavigationMenu }
