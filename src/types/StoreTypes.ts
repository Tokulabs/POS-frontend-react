import { IUser } from './UserType'

export interface IStoreProps {
  user: IUser | null
  updatePasswordUserId: number | null
}

export enum ActionTypes {
  UPDATE_USER_INFO = '[action] update user info',
  UPDATE_PASSWORD_USER_ID = '[action] update password user id',
}

export type ActionProps =
  | {
      type: ActionTypes.UPDATE_USER_INFO
      payload: IUser | null
    }
  | {
      type: ActionTypes.UPDATE_PASSWORD_USER_ID
      payload: number | null
    }

export interface IStoreProviderProps {
  state: IStoreProps
  dispatch: (arg: ActionProps) => void
}
