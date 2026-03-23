import { useMemo, useState } from 'react'
import { Eye, EyeOff, MessageSquare } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
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

  return (
    <div className="min-h-screen bg-[#eceff4] px-4 py-4 sm:px-6 sm:py-7 md:px-8 md:py-10">
      <div className="mx-auto page-enter flex min-h-[calc(100vh-2.2rem)] w-full max-w-[1080px] overflow-hidden rounded-[22px] border border-[#d7dbe3] bg-white shadow-[0_26px_50px_rgba(35,44,63,0.16)] lg:min-h-[560px]">
        <div
          className="relative flex w-full flex-col justify-between overflow-hidden bg-[#1e3f9c] px-6 py-7 text-white lg:hidden"
          style={{ backgroundImage: `linear-gradient(rgba(30,63,156,0.88), rgba(29,66,169,0.9)), url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_42%)]" />
          <div className="relative z-10 mb-8 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-white text-[#1e3f9c]">
              <MessageSquare size={14} strokeWidth={2.4} />
            </div>
            <span className="text-[22px] font-semibold tracking-[-0.02em]">VSA Beverages</span>
          </div>
          <div className="relative z-10">
            <h1 className="max-w-[290px] text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]">Intelligent Warehouse Solutions (IWS)</h1>
            <p className="mt-3 max-w-[310px] text-[14px] leading-relaxed text-blue-100/95">
              Streamlining beverage production and distribution through enterprise-grade data management.
            </p>
          </div>
        </div>

        <div
          className="relative hidden w-[50%] flex-col justify-between bg-[#1e3f9c] p-10 text-white lg:flex"
          style={{ backgroundImage: `linear-gradient(rgba(30,63,156,0.88), rgba(29,66,169,0.9)), url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_38%)]" />
          <div>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#1e3f9c]">
                <MessageSquare size={15} strokeWidth={2.4} />
              </div>
              <span className="text-[31px] font-semibold tracking-[-0.03em]">VSA Beverages</span>
            </div>

            <h1 className="max-w-[370px] text-[54px] font-semibold leading-[1.08] tracking-[-0.03em]">
              Intelligent Warehouse
              <br />
              Solutions (IWS)
            </h1>

            <p className="mt-7 max-w-[370px] text-[31px] font-normal leading-[1.36] text-blue-100/95">
              Streamlining beverage production and distribution through enterprise-grade data management and real-time logistics tracking.
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-blue-100">
            <span>© 2023 VSA Beverages Inc.</span>
            <button type="button" className="font-medium text-blue-100 hover:text-white">Privacy Policy</button>
          </div>
        </div>

        <div className="flex w-full items-center justify-center bg-[#f8f8f9] px-6 py-8 sm:px-10 lg:w-[50%] lg:px-12 lg:py-10">
          <div className="w-full max-w-[460px]">
            <div className="mb-7 sm:mb-9">
              <h2 className="text-[34px] font-semibold tracking-[-0.02em] text-[#0f172a] sm:text-[42px]">Welcome Back</h2>
              <p className="mt-2 text-[16px] leading-relaxed text-[#6b7280] sm:text-[21px]">Enter your credentials to access the IWS dashboard.</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="mb-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-[11px] border border-[#d4d8e2] bg-white text-[16px] font-medium text-[#111827] transition hover:bg-[#f5f7fb] sm:mb-7 sm:h-[58px] sm:text-[20px]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.6H12z"/>
                <path fill="#4285F4" d="M21.2 12.2c0-.6-.1-1.1-.2-1.6H12v3.9h5.5c-.3 1.4-1.3 2.7-2.7 3.5l3.4 2.6c2-1.8 3-4.6 3-8.4z"/>
                <path fill="#FBBC05" d="M5.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.3.3-1.8L2.4 8C1.8 9.2 1.5 10.6 1.5 12s.3 2.8.9 4l3.4-1.7z"/>
                <path fill="#34A853" d="M12 21.5c2.6 0 4.8-.9 6.4-2.4L15 16.5c-.9.7-2 1.2-3 1.2-3.3 0-6-2.7-6-6 0-.6.1-1.2.3-1.8L2.9 7.2C1.9 8.9 1.5 10.4 1.5 12c0 5.2 4.3 9.5 10.5 9.5z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="mb-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9aa3b2] sm:mb-7 sm:text-[13px] sm:tracking-[0.18em]">
              <span className="h-px flex-1 bg-[#d9deea]" />
              Or Continue With
              <span className="h-px flex-1 bg-[#d9deea]" />
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {ROLE_LOGIN_OPTIONS.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => handleRoleChange(option.role)}
                  className={`h-[38px] rounded-[10px] border text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                    role === option.role
                      ? 'border-[#2a4aae] bg-[#eff3ff] text-[#2746a6]'
                      : 'border-[#d4d8e2] bg-white text-[#5f6b7e] hover:border-[#b6bfd4]'
                  }`}
                >
                  {option.role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-[15px] font-semibold text-[#1f2937] sm:text-[18px]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const nextEmail = e.target.value
                    setEmail(nextEmail)
                    const matchedRole = ROLE_LOGIN_OPTIONS.find(
                      (option) => option.defaultEmail.toLowerCase() === nextEmail.trim().toLowerCase(),
                    )
                    if (matchedRole && matchedRole.role !== role) {
                      handleRoleChange(matchedRole.role)
                    }
                  }}
                  placeholder={selectedRole?.defaultEmail || 'name@company.com'}
                  className="h-[52px] w-full rounded-[11px] border border-[#d4d8e2] bg-white px-4 text-[16px] text-[#111827] placeholder:text-[#9ca3af] transition focus:border-[#2f4fae] focus:outline-none focus:ring-4 focus:ring-[#2f4fae1f] sm:h-[58px] sm:text-[20px]"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[15px] font-semibold text-[#1f2937] sm:text-[18px]">Password</label>
                  <button
                    type="button"
                    onClick={() => setError('Password recovery is not configured in this demo.')}
                    className="text-[13px] font-semibold text-[#2352c8] hover:text-[#1f46aa] sm:text-[16px]"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-[52px] w-full rounded-[11px] border border-[#d4d8e2] bg-white px-4 pr-12 text-[16px] text-[#111827] placeholder:text-[#9ca3af] transition focus:border-[#2f4fae] focus:outline-none focus:ring-4 focus:ring-[#2f4fae1f] sm:h-[58px] sm:text-[20px]"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] transition hover:text-[#1f2937]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[15px] text-[#4b5563] sm:text-[17px]">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border border-[#c9ced9] text-[#2b4db4] focus:ring-[#2b4db4]"
                />
                Keep me signed in
              </label>

              {error ? (
                <div className="rounded-[11px] border border-[#f2c7c7] bg-[#fff2f2] px-4 py-3 text-[15px] font-medium text-[#b42318]">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="h-[54px] w-full rounded-[11px] bg-[#2846a5] text-[19px] font-semibold text-white shadow-[0_8px_18px_rgba(36,69,169,0.35)] transition hover:bg-[#213d93] active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-80 sm:h-[60px] sm:text-[24px]"
              >
                {loading ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <p className="mt-8 text-center text-[15px] text-[#4b5563] sm:mt-10 sm:text-[19px]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setError('Enterprise signup flow is not configured in this demo.')}
                className="font-semibold text-[#2352c8] hover:text-[#1f46aa]"
              >
                Create enterprise account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthFlow
