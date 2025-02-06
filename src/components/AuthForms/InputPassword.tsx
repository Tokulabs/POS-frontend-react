import { Form, Input } from 'antd'
import { useState, FC, useEffect } from 'react'

const UpdatePasswordContainer: FC<{ handleAllValid: (value: boolean) => void }> = ({
  handleAllValid,
}) => {
  const [passwordOne, setPasswordOne] = useState('')
  const [passwordTwo, setPasswordTwo] = useState('')

  const [validationState, setValidationState] = useState({
    containsUL: false,
    containsLL: false,
    containsN: false,
    containsSC: false,
    contains8C: false,
    passwordMatch: false,
  })

  const validatePassword = () => {
    const containsUL = passwordOne.toLowerCase() !== passwordOne
    const containsLL = passwordOne.toUpperCase() !== passwordOne
    const containsN = /\d/.test(passwordOne)
    const containsSC = /\W|_/g.test(passwordOne)
    const contains8C = passwordOne.length >= 8
    const passwordMatch = passwordOne !== '' && passwordOne === passwordTwo

    const newValidationState = {
      containsUL,
      containsLL,
      containsN,
      containsSC,
      contains8C,
      passwordMatch,
    }

    setValidationState(newValidationState)

    const allValid =
      containsUL && containsLL && containsN && containsSC && contains8C && passwordMatch

    handleAllValid(allValid)
  }

  useEffect(() => {
    validatePassword()
  }, [passwordOne, passwordTwo])

  const mustContainData = [
    ['Al menos una letra mayúscula (A-Z)', validationState.containsUL],
    ['Al menos una letra minúscula (a-z)', validationState.containsLL],
    ['Al menos un número (0-9)', validationState.containsN],
    ['Al menos un caracter especial', validationState.containsSC],
    ['Al menos 8 caracteres', validationState.contains8C],
    ['Las contraseñas coinciden', validationState.passwordMatch],
  ]

  return (
    <>
      <Form.Item name='password' label='Contraseña'>
        <Input.Password value={passwordOne} onChange={(e) => setPasswordOne(e.target.value)} />
      </Form.Item>
      <Form.Item name='confirm' label='Confirmar Contraseña'>
        <Input.Password value={passwordTwo} onChange={(e) => setPasswordTwo(e.target.value)} />
      </Form.Item>
      <div className='must-container cfb'>
        {mustContainData.map((data, index) => (
          <p className='flex gap-3' key={index}>
            <span>{data[1] ? '✔' : '❌'}</span>
            <span>{data[0]}</span>
          </p>
        ))}
      </div>
    </>
  )
}

export default UpdatePasswordContainer