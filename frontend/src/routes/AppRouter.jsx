import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { useAuth } from '../context/useAuth'
import AuthFlow from '../pages/AuthFlow'
import Dashboard from '../pages/Dashboard'
import Employees from '../pages/Employees'
import Products from '../pages/Products'
import Suppliers from '../pages/Suppliers'
import Clients from '../pages/Clients'
import OrdersHub from '../pages/OrdersHub'
import ProductionControlTower from '../pages/ProductionControlTower'
import SupplyChainLogisticsMap from '../pages/SupplyChainLogisticsMap'
import CollaborationQualityHub from '../pages/CollaborationQualityHub'
import ExecutiveAnalyticsDashboard from '../pages/ExecutiveAnalyticsDashboard'
import AIInsights from '../pages/AIInsights'
import Billing from '../pages/Billing'
import Payroll from '../pages/Payroll'
import Invoices from '../pages/Invoices'
import Contracts from '../pages/Contracts'
import Expenses from '../pages/Expenses'
import Settings from '../pages/Settings'
import Unauthorized from '../pages/Unauthorized'
import { HOME_BY_ROLE } from '../constants/roles'

function AppRouter() {
  const { isAuthenticated, user } = useAuth()
  const homeRoute = user ? HOME_BY_ROLE[user.role] || '/dashboard' : '/auth'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />

      <Route path="/auth" element={<AuthFlow />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<AppLayout />}>
        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/products" element={<Products />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/executive-analytics" element={<ExecutiveAnalyticsDashboard />} />
          <Route path="/ai-insights" element={<AIInsights />} />
        </Route>

        {/* Operations Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'operations']} />}>
          <Route path="/production-control" element={<ProductionControlTower />} />
          <Route path="/inventory" element={<SupplyChainLogisticsMap />} />
        </Route>

        {/* Finance Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'finance']} />}>
          <Route path="/billing" element={<Billing />} />
          <Route path="/invoices" element={<Invoices />} />
        </Route>

        {/* Client Routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route path="/orders" element={<OrdersHub />} />
          <Route path="/product-builder" element={<div>Product Builder Component</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />
    </Routes>
  )
}

export default AppRouter
