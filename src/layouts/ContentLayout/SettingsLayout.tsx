import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FC, ReactNode, useState, useContext } from 'react'
import { store } from '@/store'

interface TabsProps {
  title: string
  value: string
  content: ReactNode
  requiredPermission?: string
}

interface SettingsLayoutProps {
  tabs: TabsProps[]
}

const SettingsLayout: FC<SettingsLayoutProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || '')
  const { state } = useContext(store)
  const userPermissions = state.user?.company_role?.permissions ?? []

  const hasPermission = (codename?: string) => {
    if (!codename) return true
    return userPermissions.some((p) => p.codename === codename)
  }

  const visibleTabs = tabs.filter((tab) => hasPermission(tab.requiredPermission))
  const activeContent = visibleTabs.find((tab) => tab.value === activeTab)?.content

  return (
    <section className='flex flex-col w-full h-full gap-5 p-5 bg-card rounded-md md:gap-0'>
      <header className='border-b-border border-b flex-col flex gap-1 pb-5 shrink-0'>
        <h3 className='font-sans text-2xl font-bold'>Configuración de la cuenta</h3>
        <span className='text-sm font-normal text-muted-foreground'>
          Gestione la información de su cuenta y empresa
        </span>
      </header>
      <Tabs
        defaultValue='profile'
        className='flex flex-col items-start justify-center flex-1 overflow-hidden md:flex-row'
      >
        <TabsList className='flex w-full justify-center items-center h-auto md:h-full gap-2 md:w-56 md:flex-col md:border-r md:border-r-border md:bg-card md:rounded-none md:justify-start md:py-4 md:pr-4 md:pl-0'>
          {visibleTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className='w-full'
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className='flex-1 w-full h-full overflow-hidden '>{activeContent}</div>
      </Tabs>
    </section>
  )
}

export { SettingsLayout }
