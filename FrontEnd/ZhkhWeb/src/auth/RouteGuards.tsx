import { Center, Loader } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role } from '../api/types'
import { homePath } from '../lib/nav'
import { useAuth } from './useAuth'

function PageLoader() {
  return (
    <Center py={80}>
      <Loader />
    </Center>
  )
}

// Страницы только для вошедших (и, если указано, только для определённых ролей)
export function RequireRole({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

// Страницы входа и регистрации: вошедшему человеку они не нужны
export function GuestOnly() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? homePath(user.role)} replace />
  }
  return <Outlet />
}
