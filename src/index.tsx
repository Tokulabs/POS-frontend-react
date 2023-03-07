import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import StoreProvider from './store'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StoreProvider>
    <React.StrictMode>
      <App></App>
    </React.StrictMode>
  </StoreProvider>,
)
