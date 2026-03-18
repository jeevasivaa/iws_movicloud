export const navigationGroups = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', allowedRoles: ['admin'] },
      { label: 'Employees', path: '/employees', icon: 'Users', allowedRoles: ['admin'] },
      { label: 'Products', path: '/products', icon: 'Package2', allowedRoles: ['admin'] },
      { label: 'Suppliers', path: '/suppliers', icon: 'Truck', allowedRoles: ['admin'] },
      { label: 'Clients', path: '/clients', icon: 'Handshake', allowedRoles: ['admin'] },
      { label: 'Settings', path: '/settings', icon: 'Settings', allowedRoles: ['admin'] },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Control Tower', path: '/production-control', icon: 'Factory', allowedRoles: ['admin', 'operations'] },
      { label: 'Inventory', path: '/inventory', icon: 'Warehouse', allowedRoles: ['admin', 'operations'] },
    ],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Billing', path: '/billing', icon: 'CreditCard', allowedRoles: ['admin', 'finance'] },
      { label: 'Invoices', path: '/invoices', icon: 'FileText', allowedRoles: ['admin', 'finance'] },
    ],
  },
  {
    group: 'My Orders',
    items: [
      { label: 'Orders', path: '/orders', icon: 'ClipboardList', allowedRoles: ['client'] },
      { label: 'Product Builder', path: '/product-builder', icon: 'Sparkles', allowedRoles: ['client'] },
    ],
  },
]

export function getNavigationForRole(role) {
  console.log('getNavigationForRole called with role:', role);
  const result = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.allowedRoles) {
          console.error('Item missing allowedRoles:', item);
          return false;
        }
        return item.allowedRoles.includes(role);
      }),
    }))
    .filter((group) => group.items.length > 0);
  console.log('getNavigationForRole result:', result);
  return result;
}
