import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      const role = result.user.role
      if (role === 'admin') navigate('/admin')
      else if (role === 'organizer') navigate('/organizer')
      else navigate('/user')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-md relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 mesh-gradient" />
      <div className="fixed -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-[440px] z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-md shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[28px]">event</span>
          </div>
          <h1 className="text-headline-md text-primary font-bold">EventEase</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Seamless Management for Every Event</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30">
          <h2 className="text-headline-sm text-on-surface font-bold mb-lg">Welcome back</h2>

          {error && (
            <div className="mb-lg p-md bg-error-container text-error rounded-lg text-body-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email */}
            <div className="space-y-sm">
              <label className="text-label-md text-on-surface-variant block" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-xl pr-md py-md bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="text-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-label-md text-primary hover:underline transition-all">
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-xl pr-12 py-md bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-md rounded-lg font-bold text-title-lg shadow-md hover:bg-primary-container hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              ) : (
                <>
                  Login
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-md">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="flex-shrink mx-md text-label-md text-outline">or</span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full bg-surface border border-outline-variant text-on-surface-variant py-md rounded-lg font-bold text-title-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-md group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div className="mt-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}