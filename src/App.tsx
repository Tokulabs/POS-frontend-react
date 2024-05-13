import { FC } from 'react'
import { Router } from './router'
import { Toaster } from 'sonner'

const App: FC = () => {
  return (
    <>
      <Toaster position='top-right' />
      <Router />
    </>
  )
}

export default App
