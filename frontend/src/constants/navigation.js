export const navigationGroups = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', allowedRoles: ['admin', 'manager', 'staff', 'finance'] },
      { label: 'Products', path: '/products', icon: 'Package2', allowedRoles: ['admin', 'manager'] },
      { label: 'Suppliers', path: '/suppliers', icon: 'Truck', allowedRoles: ['admin', 'manager'] },
      { label: 'Staff', path: '/employees', icon: 'Users', allowedRoles: ['admin', 'manager'] },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Production', path: '/production-control', icon: 'Factory', allowedRoles: ['admin', 'manager', 'staff'] },
      { label: 'Orders', path: '/orders', icon: 'ClipboardList', allowedRoles: ['admin', 'manager', 'client'] },
      { label: 'Inventory', path: '/inventory', icon: 'Warehouse', allowedRoles: ['admin', 'manager', 'staff'] },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Billing', path: '/billing', icon: 'CreditCard', allowedRoles: ['admin', 'finance'] },
      { label: 'Payroll', path: '/payroll', icon: 'Wallet', allowedRoles: ['admin', 'finance'] },
      { label: 'Expenses', path: '/expenses', icon: 'ClipboardList', allowedRoles: ['finance'] },
      { label: 'Clients', path: '/customers', icon: 'Users', allowedRoles: ['finance'] },
      { label: 'Reports', path: '/executive-analytics', icon: 'BarChart3', allowedRoles: ['admin', 'manager', 'finance'] },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Marketing', path: '/marketing', icon: 'Sparkles', allowedRoles: ['admin', 'manager'] },
      { label: 'Notifications', path: '/notifications', icon: 'Bell', allowedRoles: ['admin', 'manager', 'staff', 'finance'] },
      { label: 'Settings', path: '/settings', icon: 'Settings', allowedRoles: ['admin', 'manager'] },
    ],
  },
]

export function getNavigationForRole(role) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.allowedRoles.includes(role)),
    }))
    .filter((group) => group.items.length > 0)
}
