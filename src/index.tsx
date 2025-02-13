import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import StoreProvider from './store'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#269962',
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <App></App>
        {import.meta.env.MODE == 'development' && (
          <ReactQueryDevtools buttonPosition='bottom-left' />
        )}
      </StoreProvider>
    </QueryClientProvider>
  </ConfigProvider>,
)
