import { useMemo, useState, useCallback } from 'react'
import { AuthContextObject } from './authContextObject'

const STORAGE_KEY = 'iws_auth_session'

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
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
    const newSession = { user: userData, token: userToken }
    writeSession(newSession)
    setSession(newSession)
  }, [])

  const logout = useCallback(() => {
    writeSession(null)
    setSession(null)
  }, [])

  const loginAsMockUser = useCallback((role) => {
    const mockUsers = {
      admin: { name: 'Admin User', email: 'admin@vsa.com', role: 'admin' },
      operations: { name: 'James Wilson', email: 'james@vsa.com', role: 'operations' },
      finance: { name: 'Sarah Chen', email: 'sarah@vsa.com', role: 'finance' },
      client: { name: 'Bistro Group', email: 'contact@bistro.com', role: 'client' },
    }

    const userData = mockUsers[role] || mockUsers.client
    login(userData, 'mock-jwt-token')
  }, [login])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      login,
      logout,
      loginAsMockUser,
    }),
    [user, token, login, logout, loginAsMockUser],
  )

  return <AuthContextObject.Provider value={value}>{children}</AuthContextObject.Provider>
}
