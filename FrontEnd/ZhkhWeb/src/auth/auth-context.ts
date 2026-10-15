import { createContext } from 'react'
import type { User } from '../api/types'

export interface RegisterData {
  phone: string
  password: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string | null
}

export interface AuthContextValue {
  user: User | null
  loading: boolean // true, пока мы проверяем сохранённый токен при запуске сайта
  login: (phone: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
