import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import AdminLayout from '../components/layout/AdminLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { useAuth } from '../context/useAuth'
import { HOME_BY_ROLE, ROLES } from '../constants/roles'

const AuthFlow = lazy(() => import('../pages/AuthFlow'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Employees = lazy(() => import('../pages/Employees'))
const Products = lazy(() => import('../pages/Products'))
const Suppliers = lazy(() => import('../pages/Suppliers'))
const Clients = lazy(() => import('../pages/Clients'))
const OrdersHub = lazy(() => import('../pages/OrdersHub'))
const ProductionControlTower = lazy(() => import('../pages/ProductionControlTower'))
const Inventory = lazy(() => import('../pages/Inventory'))
const ExecutiveAnalyticsDashboard = lazy(() => import('../pages/ExecutiveAnalyticsDashboard'))
const AIInsights = lazy(() => import('../pages/AIInsights'))
const Billing = lazy(() => import('../pages/Billing'))
const Payroll = lazy(() => import('../pages/Payroll'))
const Invoices = lazy(() => import('../pages/Invoices'))
const Expenses = lazy(() => import('../pages/Expenses'))
const Settings = lazy(() => import('../pages/Settings'))
const Marketing = lazy(() => import('../pages/Marketing'))
const Notifications = lazy(() => import('../pages/Notifications'))
const Unauthorized = lazy(() => import('../pages/Unauthorized'))
const StaffDashboard = lazy(() => import('../pages/StaffDashboard'))
const StaffProduction = lazy(() => import('../pages/StaffProduction'))
const StaffInventory = lazy(() => import('../pages/StaffInventory'))
const StaffOrders = lazy(() => import('../pages/StaffOrders'))

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1e3a8a]" />
    </div>
  )
}

function AppRouter() {
  const { isAuthenticated, user } = useAuth()
  const homeRoute = user ? HOME_BY_ROLE[user.role] || '/dashboard' : '/auth'
  const ActiveLayout = user?.role === ROLES.ADMIN ? AdminLayout : AppLayout

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />

        <Route path="/auth" element={<AuthFlow />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ActiveLayout />}>
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/ai-insights" element={<AIInsights />} />
          </Route>

          {/* Admin & Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/clients" element={<Clients />} />
          </Route>

          {/* General Dashboard + Alerts Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.FINANCE]} />}>
            <Route path="/dashboard" element={user?.role === ROLES.STAFF ? <StaffDashboard /> : <Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Operations Routes (Admin, Manager, Staff) */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]} />}>
            <Route
              path="/production-control"
              element={user?.role === ROLES.STAFF ? <StaffProduction /> : <ProductionControlTower />}
            />
            <Route path="/inventory" element={user?.role === ROLES.STAFF ? <StaffInventory /> : <Inventory />} />
          </Route>

          {/* Finance Routes (Admin, Manager, Finance) */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCE]} />}>
            <Route path="/billing" element={<Billing />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/executive-analytics" element={<ExecutiveAnalyticsDashboard />} />
          </Route>

          {/* Orders Routes */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.CLIENT]} />}>
            <Route path="/orders" element={user?.role === ROLES.STAFF ? <StaffOrders /> : <OrdersHub />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
