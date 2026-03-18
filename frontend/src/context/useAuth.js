import { useContext } from 'react'
import { AuthContextObject } from './authContextObject'

export function useAuth() {
  const context = useContext(AuthContextObject)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
