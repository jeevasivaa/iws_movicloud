import { ROLE_LABELS, ROLES } from '../constants/roles'
import { apiPost } from './apiClient'

export const ROLE_LOGIN_OPTIONS = [
  {
    role: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
    defaultEmail: 'admin@vsafoods.com',
  },
  {
    role: ROLES.MANAGER,
    label: ROLE_LABELS[ROLES.MANAGER],
    defaultEmail: 'vikram@vsafoods.com',
  },
  {
    role: ROLES.STAFF,
    label: ROLE_LABELS[ROLES.STAFF],
    defaultEmail: 'anita@vsafoods.com',
  },
  {
    role: ROLES.FINANCE,
    label: ROLE_LABELS[ROLES.FINANCE],
    defaultEmail: 'ravi.finance@vsafoods.com',
  },
  {
    role: ROLES.CLIENT,
    label: ROLE_LABELS[ROLES.CLIENT],
    defaultEmail: 'nita@organichub.in',
  },
]

export async function login(email, password, expectedRole) {
  const response = await apiPost('/api/auth/login', {
    email,
    password,
  })

  const user = response?.user || null
  const token = response?.access_token || null

  if (!user || !token) {
    throw new Error('Invalid login response from server')
  }

  const normalizedRole = (user.role || '').toLowerCase()
  if (expectedRole && normalizedRole !== expectedRole) {
    throw new Error(`This account is not mapped to ${ROLE_LABELS[expectedRole]}`)
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      company_id: user.company_id || null,
    },
    token,
  }
}

export async function signup(data) {
  const response = await apiPost('/api/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || ROLES.CLIENT,
    company_id: data.companyId || null,
  })

  return {
    success: true,
    message: response?.msg || 'Account created successfully',
  }
}

export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}
