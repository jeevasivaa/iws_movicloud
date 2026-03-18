import { canAccessRoute } from './roles'

export const navigationGroups = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Employees', path: '/employees', icon: 'Users' },
      { label: 'Products', path: '/products', icon: 'Package2' },
      { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
      { label: 'Clients', path: '/clients', icon: 'Handshake' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Orders', path: '/orders', icon: 'ClipboardList' },
      { label: 'Production', path: '/production-control', icon: 'Factory' },
      { label: 'Inventory', path: '/inventory', icon: 'Warehouse' },
      { label: 'Collaboration', path: '/collaboration-quality', icon: 'Handshake' },
      { label: 'Supply Chain Map', path: '/supply-chain-map', icon: 'Truck' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Billing', path: '/billing', icon: 'CreditCard' },
      { label: 'Payroll', path: '/payroll', icon: 'Wallet' },
      { label: 'Invoices', path: '/invoices', icon: 'FileText' },
      { label: 'Contracts', path: '/contracts', icon: 'FileSignature' },
      { label: 'Expenses', path: '/expenses', icon: 'Receipt' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Analytics', path: '/executive-analytics', icon: 'BarChart3' },
      { label: 'AI Insights', path: '/ai-insights', icon: 'Sparkles' },
      { label: 'Settings', path: '/settings', icon: 'Settings' },
    ],
  },
]

export function getNavigationForRole(role) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessRoute(role, item.path)),
    }))
    .filter((group) => group.items.length > 0)
}
