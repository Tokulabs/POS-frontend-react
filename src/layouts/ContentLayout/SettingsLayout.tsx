import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FC, ReactNode, useState } from 'react'
import { useRolePermissions } from '@/hooks/useRolespermissions'

interface TabsProps {
  title: string
  value: string
  content: ReactNode
  allowedRoles?: string[]
}

interface SettingsLayoutProps {
  tabs: TabsProps[]
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || '')

  const activeContent = tabs.find((tab) => tab.value === activeTab)?.content

  return (
    <section className='flex flex-col w-full h-full gap-5 p-5 bg-card rounded-md md:gap-0'>
      <header className='border-b-border border-b-[1px] flex-col flex gap-1 pb-5 flex-shrink-0'>
        <h3 className='font-sans text-2xl font-bold'>Configuración de la cuenta</h3>
        <span className='text-sm font-normal text-muted-foreground'>
          Gestione la información de su cuenta y empresa
        </span>
      </header>
      <Tabs
        defaultValue='profile'
        className='flex flex-col items-start justify-center flex-1 overflow-hidden md:flex-row'
      >
        {/* Sidebar Menu */}
        <TabsList className='flex w-full justify-center items-center h-auto md:h-full gap-2 md:w-56 md:flex-col md:border-r-[1px] md:border-r-border md:bg-card md:rounded-none md:justify-start md:py-4 md:pr-4 md:pl-0'>
          {tabs.map((tab) => {
            const { hasPermission } = useRolePermissions({
              allowedRoles: tab.allowedRoles,
            })

            if (!hasPermission) return null

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className='w-full'
              >
                {tab.title}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content Area */}
        <div className='flex-1 w-full h-full overflow-hidden '>{activeContent}</div>
      </Tabs>
    </section>
  )
}

export { SettingsLayout }
