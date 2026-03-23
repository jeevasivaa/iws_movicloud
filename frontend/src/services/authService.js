/**
 * Mock Authentication Service
 * Simulates async API calls for login and signup.
 */
import { ROLE_LABELS, ROLES } from '../constants/roles'

const MOCK_USERS = {
  [ROLES.ADMIN]: {
    id: 1,
    name: 'Priya Nair',
    email: 'admin@vsabeverages.com',
    role: ROLES.ADMIN,
  },
  [ROLES.MANAGER]: {
    id: 2,
    name: 'James Wilson',
    email: 'manager@vsabeverages.com',
    role: ROLES.MANAGER,
  },
  [ROLES.STAFF]: {
    id: 5,
    name: 'Zane Roy',
    email: 'staff@vsabeverages.com',
    role: ROLES.STAFF,
  },
  [ROLES.FINANCE]: {
    id: 3,
    name: 'Sarah Chen',
    email: 'finance@vsabeverages.com',
    role: ROLES.FINANCE,
  },
  [ROLES.CLIENT]: {
    id: 4,
    name: 'Bistro Group',
    email: 'contact@bistro.com',
    role: ROLES.CLIENT,
  },
}

export const ROLE_LOGIN_OPTIONS = [
  {
    role: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
    defaultEmail: MOCK_USERS[ROLES.ADMIN].email,
  },
  {
    role: ROLES.MANAGER,
    label: ROLE_LABELS[ROLES.MANAGER],
    defaultEmail: MOCK_USERS[ROLES.MANAGER].email,
  },
  {
    role: ROLES.STAFF,
    label: ROLE_LABELS[ROLES.STAFF],
    defaultEmail: MOCK_USERS[ROLES.STAFF].email,
  },
  {
    role: ROLES.FINANCE,
    label: ROLE_LABELS[ROLES.FINANCE],
    defaultEmail: MOCK_USERS[ROLES.FINANCE].email,
  },
  {
    role: ROLES.CLIENT,
    label: ROLE_LABELS[ROLES.CLIENT],
    defaultEmail: MOCK_USERS[ROLES.CLIENT].email,
  },
]

/**
 * Simulates a login request.
 * @param {string} email
 * @param {string} password
 * @param {string} role
 * @returns {Promise<object>} Resolves with user data on success
 */
export const login = (email, password, role) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userByRole = MOCK_USERS[role]
      if (email && password && userByRole) {
        resolve({
          success: true,
          user: { ...userByRole, email },
          token: `mock-token-${userByRole.id}`,
        })
      } else {
        reject({ success: false, message: 'Invalid credentials' })
      }
    }, 500)
  })
}

/**
 * Simulates a signup request.
 * @param {object} data - { email, password, companyName }
 * @returns {Promise<object>} Resolves with success status
 */
export const signup = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Account created successfully',
        user: { ...MOCK_USERS[ROLES.ADMIN], email: data.email },
      })
    }, 500)
  })
}

export const logout = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 200)
  })
}
