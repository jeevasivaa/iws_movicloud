export const ROLES = {
  ADMIN: 'admin',
  OPERATIONS: 'operations',
  FINANCE: 'finance',
  CLIENT: 'client',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Administrator',
  [ROLES.OPERATIONS]: 'Operations Manager',
  [ROLES.FINANCE]: 'Finance & Accounting',
  [ROLES.CLIENT]: 'Client Partner',
}

export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.OPERATIONS]: '/production-control',
  [ROLES.FINANCE]: '/billing',
  [ROLES.CLIENT]: '/orders',
}
