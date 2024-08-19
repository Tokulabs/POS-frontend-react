import { ActionProps, ActionTypes, IStoreProps, IStoreProviderProps } from '@/types/StoreTypes'
import { createContext, FC, PropsWithChildren, useReducer } from 'react'

const initialState: IStoreProps = {
  user: null,
  updatePasswordUserId: null,
}

const appReducer = (state: IStoreProps, action: ActionProps): IStoreProps => {
  if (action.type === ActionTypes.UPDATE_USER_INFO) {
    return {
      ...state,
      user: action.payload,
    }
  }

  if (action.type === ActionTypes.UPDATE_PASSWORD_USER_ID) {
    return {
      ...state,
      updatePasswordUserId: action.payload,
    }
  }
  return state
}

export const store = createContext<IStoreProviderProps>({
  state: initialState,
  dispatch: () => null,
})

export const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const { Provider } = store

  return <Provider value={{ state, dispatch }}>{children}</Provider>
}

export default StoreProvider
