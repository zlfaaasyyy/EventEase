import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', role: 'user' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleRoleSelect = (role) => {
    setForm({ ...form, role })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm_password) {
      setError('Password and confirmation do not match')
      return
    }

    const result = await register(form)
    if (result.success) {
      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-background flex items-center justify-center p-md relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-[480px] z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-md shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-[28px]">event</span>
          </div>
          <h1 className="text-headline-md text-primary font-bold">EventEase</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Create your account to start managing events</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30">
          <h2 className="text-headline-sm text-on-surface font-bold mb-lg">Create Account</h2>

          {error && (
            <div className="mb-lg p-md bg-error-container text-error rounded-lg text-body-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-lg p-md bg-primary-fixed text-primary rounded-lg text-body-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md">
            {/* Full Name */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface block" htmlFor="name"> Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="  John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-xl pr-md py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface block" htmlFor="email"> Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="  name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-xl pr-md py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface block" htmlFor="password"> Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="  Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  className="w-full pl-xl pr-12 py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface block" htmlFor="confirm_password"> Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="  Re-enter your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  minLength={8}
                  className="w-full pl-xl pr-md py-md bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface block">I am a...</label>
              <div className="grid grid-cols-2 gap-md">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('user')}
                  className={`flex flex-col items-center justify-center p-md border-2 rounded-xl transition-all duration-200 active:scale-95 ${
                    form.role === 'user'
                      ? 'border-primary bg-primary-fixed'
                      : 'border-outline-variant bg-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className={`material-symbols-outlined text-headline-sm mb-xs ${form.role === 'user' ? 'text-primary' : 'text-outline'}`}>
                    person
                  </span>
                  <span className={`text-label-md ${form.role === 'user' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    Regular User
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('organizer')}
                  className={`flex flex-col items-center justify-center p-md border-2 rounded-xl transition-all duration-200 active:scale-95 ${
                    form.role === 'organizer'
                      ? 'border-primary bg-primary-fixed'
                      : 'border-outline-variant bg-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className={`material-symbols-outlined text-headline-sm mb-xs ${form.role === 'organizer' ? 'text-primary' : 'text-outline'}`}>
                    festival
                  </span>
                  <span className={`text-label-md ${form.role === 'organizer' ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    Organizer
                  </span>
                </button>
              </div>
              {form.role === 'organizer' && (
                <p className="text-label-md text-on-surface-variant bg-surface-container-low p-sm rounded-lg">
                  <span className="material-symbols-outlined text-[14px] align-middle mr-xs text-secondary">info</span>
                  Organizer accounts require admin approval before you can publish events.
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-md rounded-lg font-bold text-title-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60 mt-lg"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <div className="mt-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline decoration-2 underline-offset-4">
              Login here
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}