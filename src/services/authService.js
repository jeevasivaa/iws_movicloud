export const STAFF_ROLES = [
  'Staff',
  'Production Manager',
  'Inventory Manager',
  'Finance Manager',
]

const DEFAULT_USER = {
  id: 1,
  name: 'Amit Patel',
  email: 'staff@vsafoods.com',
  role: 'Staff',
}

const ROLE_RULES = [
  { matcher: /(production|factory|plant)/i, role: 'Production Manager' },
  { matcher: /(inventory|warehouse|stock)/i, role: 'Inventory Manager' },
  { matcher: /(finance|account|billing)/i, role: 'Finance Manager' },
  { matcher: /(staff|operator|associate)/i, role: 'Staff' },
]

const getRoleFromEmail = (email = '') => {
  const matchedRule = ROLE_RULES.find((rule) => rule.matcher.test(email))
  return matchedRule?.role || DEFAULT_USER.role
}

const isSupportedRole = (role = '') => STAFF_ROLES.includes(role)

const resolveRole = (email = '', explicitRole = '') => {
  if (isSupportedRole(explicitRole)) {
    return explicitRole
  }

  return getRoleFromEmail(email)
}

const toTitleCase = (value) => {
  return value
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

const getNameFromEmail = (email = '') => {
  const localPart = email.split('@')[0]
  return localPart ? toTitleCase(localPart) : DEFAULT_USER.name
}

const buildMockUser = (email = '', explicitRole = '') => {
  const resolvedEmail = email || DEFAULT_USER.email
  return {
    ...DEFAULT_USER,
    email: resolvedEmail,
    role: resolveRole(resolvedEmail, explicitRole),
    name: getNameFromEmail(resolvedEmail),
  }
}

const STORAGE_KEY = 'iws_current_user'

const hasStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage)

const readStoredUser = () => {
  if (!hasStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const saveUser = (user) => {
  if (!hasStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

const clearStoredUser = () => {
  if (!hasStorage()) {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

export const login = (email, password, role) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        const user = buildMockUser(email, role)
        saveUser(user)
        resolve({ success: true, user })
      } else {
        reject({ success: false, message: 'Invalid credentials' })
      }
    }, 500)
  })
}

export const signup = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = buildMockUser(data?.email, data?.role)
      saveUser(user)
      resolve({
        success: true,
        message: 'Account created successfully',
        user,
      })
    }, 500)
  })
}

export const getCurrentUser = () => {
  return readStoredUser() || DEFAULT_USER
}

export const logout = () => {
  clearStoredUser()
}
