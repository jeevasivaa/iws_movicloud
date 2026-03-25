import { useMemo, useState, useCallback } from 'react'
import { AuthContextObject } from './authContextObject'
import { ROLES } from '../constants/roles'

const STORAGE_KEY = 'iws_auth_session'
const VALID_ROLES = new Set(Object.values(ROLES))
const JWT_SEGMENT_PATTERN = /^[A-Za-z0-9_-]+$/

function isLikelyJwt(token) {
  if (typeof token !== 'string') return false
  const normalizedToken = token.trim()
  if (!normalizedToken) return false

  const segments = normalizedToken.split('.')
  return segments.length === 3 && segments.every((segment) => JWT_SEGMENT_PATTERN.test(segment))
}

function normalizeRole(role) {
  if (typeof role !== 'string') return null
  const normalized = role.trim().toLowerCase()
  return VALID_ROLES.has(normalized) ? normalized : null
}

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null

  const user = session.user
  if (!user || typeof user !== 'object') return null

  const token = typeof session.token === 'string' ? session.token.trim() : ''
  if (!isLikelyJwt(token)) return null

  const role = normalizeRole(user.role)
  if (!role) return null

  return {
    user: { ...user, role },
    token,
  }
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsedSession = normalizeSession(JSON.parse(raw))
    if (!parsedSession) {
      localStorage.removeItem(STORAGE_KEY)
    }
    return parsedSession
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function writeSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const user = session?.user ?? null
  const token = session?.token ?? null

  const login = useCallback((userData, userToken) => {
    const normalizedToken = typeof userToken === 'string' ? userToken.trim() : ''
    if (!isLikelyJwt(normalizedToken)) {
      writeSession(null)
      setSession(null)
      return
    }

    const role = normalizeRole(userData?.role)
    if (!role) {
      writeSession(null)
      setSession(null)
      return
    }

    const newSession = {
      user: { ...userData, role },
      token: normalizedToken,
    }
    writeSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    writeSession(null)
    setSession(null)
  }, [])

  const loginAsMockUser = useCallback((role) => {
    const mockUsers = {
      [ROLES.ADMIN]: { name: 'Admin User', email: 'admin@vsa.com', role: ROLES.ADMIN },
      [ROLES.MANAGER]: { name: 'James Wilson', email: 'james@vsa.com', role: ROLES.MANAGER },
      [ROLES.STAFF]: { name: 'Zane Roy', email: 'zane@vsa.com', role: ROLES.STAFF },
      [ROLES.FINANCE]: { name: 'Sarah Chen', email: 'sarah@vsa.com', role: ROLES.FINANCE },
      [ROLES.CLIENT]: { name: 'Bistro Group', email: 'contact@bistro.com', role: ROLES.CLIENT },
    }

    const userData = mockUsers[role] || mockUsers[ROLES.CLIENT]
    login(userData, 'mock-jwt-token')
  }, [login])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      loginAsMockUser,
    }),
    [user, token, login, logout, loginAsMockUser],
  )

  return <AuthContextObject.Provider value={value}>{children}</AuthContextObject.Provider>
}
