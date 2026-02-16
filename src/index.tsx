import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import StoreProvider from './store'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { ThemeProvider } from '@/components/Theme/ThemeProvider'
import { useThemeStore } from '@/store/useThemeStore'

const queryClient = new QueryClient()

// Ant Design theme configuration component
const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useThemeStore()
  const isDark = resolvedTheme === 'dark'

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#269962',
          colorBgContainer: isDark ? '#1C2128' : '#ffffff',
          colorBgElevated: isDark ? '#1F2630' : '#ffffff',
          colorBgLayout: isDark ? '#14181F' : '#f5f5f5',
          colorBorder: isDark ? '#353E4A' : '#DADCE0',
          colorText: isDark ? '#EBEDEF' : '#272D35',
          colorTextSecondary: isDark ? '#8B939F' : '#6B7280',
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AntdConfigProvider>
          <App />
          {import.meta.env.MODE == 'development' && (
            <ReactQueryDevtools buttonPosition='bottom-left' />
          )}
        </AntdConfigProvider>
      </StoreProvider>
    </QueryClientProvider>
  </ThemeProvider>,
)

