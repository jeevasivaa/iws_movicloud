export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  FINANCE: 'finance',
  CLIENT: 'client',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Administrator',
  [ROLES.MANAGER]: 'Operations Manager',
  [ROLES.STAFF]: 'Floor Staff',
  [ROLES.FINANCE]: 'Finance & Accounting',
  [ROLES.CLIENT]: 'Client Partner',
}

export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/dashboard',
  [ROLES.MANAGER]: '/production-control',
  [ROLES.STAFF]: '/dashboard',
  [ROLES.FINANCE]: '/billing',
  [ROLES.CLIENT]: '/orders',
}
