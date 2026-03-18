export const ROLES = {
  ADMIN: 'SYSTEM_ADMIN',
  OPERATIONS: 'OPERATIONS_MANAGER',
  FINANCE: 'FINANCE_ACCOUNTING',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Admin (Superuser)',
  [ROLES.OPERATIONS]: 'Internal Operations / Factory Manager',
  [ROLES.FINANCE]: 'Finance & Accounting',
}

export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.OPERATIONS]: '/orders',
  [ROLES.FINANCE]: '/billing',
}

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    routes: ['*'],
  },
  [ROLES.OPERATIONS]: {
    routes: [
      '/dashboard',
      '/employees',
      '/products',
      '/suppliers',
      '/clients',
      '/orders',
      '/production-control',
      '/inventory',
      '/supply-chain-map',
      '/collaboration-quality',
      '/executive-analytics',
      '/ai-insights',
      '/settings',
    ],
  },
  [ROLES.FINANCE]: {
    routes: [
      '/dashboard',
      '/clients',
      '/billing',
      '/payroll',
      '/invoices',
      '/contracts',
      '/expenses',
      '/executive-analytics',
      '/settings',
    ],
  },
}

export function canAccessRoute(role, path) {
  if (!role || !path) return false
  const permission = PERMISSIONS[role]
  if (!permission) return false
  if (permission.routes.includes('*')) return true
  return permission.routes.includes(path)
}
