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
import OnboardingCompanyInfo from '../pages/OnboardingCompanyInfo'
import OnboardingStep2 from '../pages/OnboardingStep2'
import OnboardingStep3 from '../pages/OnboardingStep3'
import OnboardingStep4 from '../pages/OnboardingStep4'
import ProductBuilder from '../pages/ProductBuilder'
import ProductBuilderStep2 from '../pages/ProductBuilderStep2'
import ProductBuilderStep3 from '../pages/ProductBuilderStep3'
import ProductBuilderStep4 from '../pages/ProductBuilderStep4'

function AppRouter() {
  const { isAuthenticated, homeRoute } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />

      <Route path="/auth" element={<AuthFlow />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />

      <Route path="/onboarding" element={<Navigate to="/onboarding/step-1" replace />} />
      <Route path="/onboarding/step-1" element={<OnboardingCompanyInfo />} />
      <Route path="/onboarding/step-2" element={<OnboardingStep2 />} />
      <Route path="/onboarding/step-3" element={<OnboardingStep3 />} />
      <Route path="/onboarding/step-4" element={<OnboardingStep4 />} />

      <Route path="/product-builder" element={<Navigate to="/product-builder/step-1" replace />} />
      <Route path="/product-builder/step-1" element={<ProductBuilder />} />
      <Route path="/product-builder/step-2" element={<ProductBuilderStep2 />} />
      <Route path="/product-builder/step-3" element={<ProductBuilderStep3 />} />
      <Route path="/product-builder/step-4" element={<ProductBuilderStep4 />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/employees" element={<Employees />} />
          <Route path="/products" element={<Products />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/clients" element={<Clients />} />

          <Route path="/orders" element={<OrdersHub />} />
          <Route path="/production-control" element={<ProductionControlTower />} />
          <Route path="/inventory" element={<SupplyChainLogisticsMap />} />
          <Route path="/supply-chain-map" element={<SupplyChainLogisticsMap />} />
          <Route path="/collaboration-quality" element={<CollaborationQualityHub />} />

          <Route path="/billing" element={<Billing />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/expenses" element={<Expenses />} />

          <Route path="/executive-analytics" element={<ExecutiveAnalyticsDashboard />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? homeRoute : '/auth'} replace />} />
    </Routes>
  )
}

export default AppRouter
