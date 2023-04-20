import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import StoreProvider from './store'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <StoreProvider>
      <React.StrictMode>
        <App></App>
        {import.meta.env.MODE == 'development' && <ReactQueryDevtools />}
      </React.StrictMode>
    </StoreProvider>
  </QueryClientProvider>,
)
