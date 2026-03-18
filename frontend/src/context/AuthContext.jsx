import { useMemo, useState } from 'react'
import { HOME_BY_ROLE } from '../constants/roles'
import * as authService from '../services/authService'
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

  const login = async ({ email, password, role }) => {
    const result = await authService.login(email, password, role)
    writeSession(result)
    setSession(result)
    return result
  }

  const logout = async () => {
    await authService.logout()
    writeSession(null)
    setSession(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      homeRoute: user ? HOME_BY_ROLE[user.role] ?? '/dashboard' : '/auth',
      login,
      logout,
    }),
    [user],
  )

  return <AuthContextObject.Provider value={value}>{children}</AuthContextObject.Provider>
}
