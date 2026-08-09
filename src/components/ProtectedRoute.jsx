import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useIsAuthenticated } from '../store/authStore'

export default function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
