import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, tokenStorage, UNAUTHORIZED_EVENT } from '../api/client'
import type { AuthResponse, User } from '../api/types'
import { AuthContext } from './auth-context'
import type { AuthContextValue, RegisterData } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Если токен уже сохранён, сначала спрашиваем у сервера "кто я", и только потом решаем, что показывать
  const [loading, setLoading] = useState<boolean>(() => tokenStorage.get() !== null)

  useEffect(() => {
    if (!tokenStorage.get()) return
    let cancelled = false

    api
      .get<User>('/api/auth/me')
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        // 401 обработает клиент (токен будет удалён). Если API просто недоступен, токен оставляем
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Сервер сказал "токен недействителен": выходим
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback(async (phone: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { phone, password })
    tokenStorage.set(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<AuthResponse>('/api/auth/register', data)
    tokenStorage.set(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
