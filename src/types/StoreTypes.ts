import { IUser } from './UserType'
import { ICompany } from '@/pages/Profile/types/CompanyTypes'

export interface IStoreProps {
  user: IUser | null
  updatePasswordUserId: number | null
}

export enum ActionTypes {
  UPDATE_USER_INFO = '[action] update user info',
  UPDATE_PASSWORD_USER_ID = '[action] update password user id',
  UPDATE_COMPANY_INFO = '[action] update company info',
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
  | {
      type: ActionTypes.UPDATE_COMPANY_INFO
      payload: ICompany
    }

export interface IStoreProviderProps {
  state: IStoreProps
  dispatch: (arg: ActionProps) => void
}
