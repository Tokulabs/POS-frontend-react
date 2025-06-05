import React, { useState } from 'react'
import { PasswordField } from './PasswordField'
import UpdatePasswordContainer from '@/components/AuthForms/InputPassword'

interface IAuthForm {
  onSubmit: (values: { password: string }) => boolean | Promise<boolean>
  loading?: boolean
}

export const UserPassword: React.FC<IAuthForm> = ({ onSubmit, loading }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleSubmit = async (values: { password: string }) => {
    const result = await onSubmit(values)
    if (result) {
      setIsAuthenticated(true)
    }
  }

  return (
    <>
      {isAuthenticated ? (
        <UpdatePasswordContainer />
      ) : (
        <PasswordField onSubmit={handleSubmit} loading={loading} />
      )}
    </>
  )
}
