import { useMemo, useState } from 'react'
import { Factory, Eye, EyeOff, LogIn } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ROLE_LOGIN_OPTIONS } from '../services/authService'

function AuthFlow() {
  const navigate = useNavigate()
  const { isAuthenticated, homeRoute, login } = useAuth()

  const [role, setRole] = useState(ROLE_LOGIN_OPTIONS[0].role)
  const [email, setEmail] = useState(ROLE_LOGIN_OPTIONS[0].defaultEmail)
  const [password, setPassword] = useState('Password@123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedRole = useMemo(
    () => ROLE_LOGIN_OPTIONS.find((option) => option.role === role),
    [role],
  )

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
      const result = await login({ email, password, role })
      const nextPath = result?.user?.role === role ? homeRoute : '/dashboard'
      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-900">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a8a] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white p-2 rounded-lg">
              <Factory className="text-[#1e3a8a] h-8 w-8" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight">VSA BEVERAGES</span>
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Intelligent Warehouse
            <br />
            <span className="text-blue-300 font-black">Solutions Control Center</span>
          </h1>
          <p className="text-blue-100 text-xl max-w-lg leading-relaxed font-medium">
            Role-based operations cockpit for management, plant floor execution, and finance oversight.
          </p>
        </div>

        <div className="relative z-10 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-2">Available Demo Logins</p>
          <div className="space-y-2 text-sm text-blue-100 font-semibold">
            {ROLE_LOGIN_OPTIONS.map((option) => (
              <p key={option.role}>{option.label}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-black text-slate-900 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-10 font-medium">Choose one of the 3 login roles and continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Login Role</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_LOGIN_OPTIONS.map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => handleRoleChange(option.role)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${
                      role === option.role
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole?.defaultEmail}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password@123"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-[#1e3a8a] focus:outline-none transition-all bg-slate-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:bg-[#1e40af] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="h-5 w-5" />
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>

        <div className="mt-auto pt-12 text-center lg:text-left">
          <p className="text-slate-400 text-sm font-medium">© 2026 VSA Beverages IWS. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default AuthFlow
