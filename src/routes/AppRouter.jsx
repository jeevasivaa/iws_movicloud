import { Routes, Route, Navigate } from 'react-router-dom'
import LoginSignup from '../pages/LoginSignup'
import DashboardOverview from '../pages/DashboardOverview'
import SmartDashboard from '../pages/SmartDashboard'
import OnboardingCompanyInfo from '../pages/OnboardingCompanyInfo'
import OrdersManagementHub from '../pages/OrdersManagementHub'
import ProductBuilderStep1 from '../pages/ProductBuilderStep1'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginSignup />} />
      <Route path="/dashboard" element={<DashboardOverview />} />
      <Route path="/smart-dashboard" element={<SmartDashboard />} />
      <Route path="/onboarding" element={<OnboardingCompanyInfo />} />
      <Route path="/orders" element={<OrdersManagementHub />} />
      <Route path="/product-builder" element={<ProductBuilderStep1 />} />
    </Routes>
  )
}

export default AppRouter
