export const navigationGroups = [
  {
    group: 'Menu',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', allowedRoles: ['admin', 'manager', 'staff', 'finance'] },
      { label: 'Products', path: '/products', icon: 'Package2', allowedRoles: ['admin', 'manager', 'staff'] },
      { label: 'Suppliers', path: '/suppliers', icon: 'Truck', allowedRoles: ['admin', 'manager', 'staff'] },
      { label: 'Orders', path: '/orders', icon: 'ClipboardList', allowedRoles: ['admin', 'manager', 'staff', 'client'] },
      { label: 'Reports', path: '/executive-analytics', icon: 'BarChart3', allowedRoles: ['admin', 'manager', 'finance', 'staff'] },
      { label: 'Notifications', path: '/notifications', icon: 'Bell', allowedRoles: ['admin', 'manager', 'staff', 'finance'] },
      { label: 'Inventory', path: '/inventory', icon: 'Warehouse', allowedRoles: ['admin', 'manager', 'staff'] },
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
