import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROLE_LOGIN_OPTIONS } from '../services/authService'
import { HOME_BY_ROLE } from '../constants/roles'
import heroImage from '../assets/hero.png'

function AuthFlow() {
  const navigate = useNavigate()
  const { isAuthenticated, user, login } = useAuth()

  const [role, setRole] = useState(ROLE_LOGIN_OPTIONS[0].role)
  const [email, setEmail] = useState(ROLE_LOGIN_OPTIONS[0].defaultEmail)
  const [password, setPassword] = useState('Password@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)

  const selectedRole = useMemo(
    () => ROLE_LOGIN_OPTIONS.find((option) => option.role === role),
    [role],
  )

  const homeRoute = user ? HOME_BY_ROLE[user.role] || '/dashboard' : '/auth'

  if (isAuthenticated) {
    return <Navigate to={homeRoute} replace />
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    const roleOption = ROLE_LOGIN_OPTIONS.find((option) => option.role === nextRole)
    if (roleOption) {
      setEmail(roleOption.defaultEmail)
    }
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ name: selectedRole.label, email, role }, 'mock-token')
      navigate(HOME_BY_ROLE[role] || '/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError('Google sign-in is not configured in this demo.')
  }

  const handleEmailChange = (nextEmail) => {
    setEmail(nextEmail)
    const matchedRole = ROLE_LOGIN_OPTIONS.find(
      (option) => option.defaultEmail.toLowerCase() === nextEmail.trim().toLowerCase(),
    )
    if (matchedRole && matchedRole.role !== role) {
      handleRoleChange(matchedRole.role)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        <div
          className="relative flex h-full flex-col justify-between bg-[#2B4B9A] bg-cover bg-center bg-blend-overlay p-12 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(43,75,154,0.84), rgba(29,58,134,0.9)), url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_50%)]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/90">
              <div className="h-3 w-3 rounded-sm border border-white/90" />
            </div>
            <span className="text-lg font-semibold">VSA Beverages</span>
          </div>

          <div className="relative z-10 py-10 md:py-0">
            <h1 className="max-w-sm text-4xl font-bold leading-tight">Intelligent Warehouse Solutions (IWS)</h1>
            <p className="mt-5 max-w-md text-base text-blue-100">
              Streamlining beverage production and distribution through enterprise-grade data management and real-time logistics tracking.
            </p>
          </div>

          <p className="relative z-10 text-sm text-blue-200">© 2023 VSA Beverages Inc. • Privacy Policy</p>
        </div>

        <div className="bg-white p-12">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mb-8 mt-2 text-sm text-gray-500">Enter your credentials to access the IWS dashboard.</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.6H12z" />
              <path fill="#4285F4" d="M21.2 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.4-1.3 2.7-2.7 3.5l3.4 2.6c2-1.8 3-4.6 3-8.4z" />
              <path fill="#FBBC05" d="M5.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L2.4 8C1.8 9.2 1.5 10.6 1.5 12s.3 2.8.9 4l3.4-1.7z" />
              <path fill="#34A853" d="M12 21.5c2.6 0 4.8-.9 6.4-2.4L15 16.5c-.9.7-2 1.2-3 1.2-3.3 0-6-2.7-6-6 0-.6.1-1.2.3-1.8L2.9 7.2C1.9 8.9 1.5 10.4 1.5 12c0 5.2 4.3 9.5 10.5 9.5z" />
            </svg>
            Sign in with Google
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-wider text-gray-400 before:flex-1 before:border-t before:border-gray-200 after:flex-1 after:border-t after:border-gray-200">
            OR CONTINUE WITH
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder={selectedRole?.defaultEmail || 'name@company.com'}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-[#2B4B9A] focus:ring-2 focus:ring-[#2B4B9A]/20"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setError('Password recovery is not configured in this demo.')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-[#2B4B9A] focus:ring-2 focus:ring-[#2B4B9A]/20"
                autoComplete="current-password"
                required
              />
            </div>

            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#2B4B9A] focus:ring-[#2B4B9A]"
              />
              <span className="ml-2">Keep me signed in</span>
            </label>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[#2B4B9A] p-3 font-medium text-white shadow-md transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setError('Enterprise signup flow is not configured in this demo.')}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create enterprise account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthFlow
