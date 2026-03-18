import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { canAccessRoute } from '../../constants/roles'

function ProtectedRoute() {
  const { isAuthenticated, user, homeRoute } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={homeRoute} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
