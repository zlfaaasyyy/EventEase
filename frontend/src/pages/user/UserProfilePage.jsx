import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { usersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const bars = [
    { label: 'Weak',   color: 'bg-error',        min: 1 },
    { label: 'Fair',   color: 'bg-tertiary',      min: 2 },
    { label: 'Good',   color: 'bg-[#ca8a04]',     min: 3 },
    { label: 'Strong', color: 'bg-[#15803d]',     min: 4 },
  ]
  const current = score > 0 ? bars[Math.min(score - 1, 3)] : null
  return (
    <div className="mt-sm space-y-xs">
      <div className="flex gap-xs h-1.5">
        {[1,2,3,4].map(n => (
          <div key={n} className={`flex-1 rounded-full transition-colors ${n <= score ? (current?.color || 'bg-outline-variant') : 'bg-surface-container-high'}`} />
        ))}
      </div>
      {current && <p className={`text-label-sm font-semibold ${current.color.replace('bg-', 'text-')}`}>{current.label} strength</p>}
    </div>
  )
}

export default function UserProfilePage() {
  const { user: authUser, login } = useAuth()
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getMe()
        const u = res.data
        setProfile({ name: u.name || '', phone: u.phone || '', bio: u.bio || '' })
      } catch {
        showToast('Failed to load profile.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { showToast('Name is required.', 'error'); return }
    setSavingProfile(true)
    try {
      const res = await usersAPI.updateMe(profile)
      localStorage.setItem('user', JSON.stringify(res.data))
      showToast('Profile updated successfully!', 'success')
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to update profile.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (!pwForm.current_password) { showToast('Current password is required.', 'error'); return }
    if (pwForm.new_password.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return }
    if (pwForm.new_password !== pwForm.confirm_new_password) { showToast('Passwords do not match.', 'error'); return }
    setSavingPw(true)
    try {
      await usersAPI.updatePassword(pwForm)
      showToast('Password changed successfully!', 'success')
      setPwForm({ current_password: '', new_password: '', confirm_new_password: '' })
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to change password.', 'error')
    } finally {
      setSavingPw(false)
    }
  }

  const inputClass = "w-full h-12 px-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"

  return (
    <DashboardLayout title="Profile">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-sm px-md py-sm rounded-xl shadow-lg border-l-4 text-body-md font-medium ${
          toast.type === 'success' ? 'bg-white border-[#15803d] text-[#15803d]' : 'bg-white border-error text-error'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading profile...
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-lg">
          {/* Profile Header */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-lg">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-display-lg border-4 border-surface-container-highest shadow-sm">
                  {profile.name?.charAt(0)?.toUpperCase() || authUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary p-xs rounded-full border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-md flex-wrap">
                  <h1 className="text-headline-md font-bold text-on-surface">{profile.name || 'Your Name'}</h1>
                  <span className="px-md py-xs bg-secondary-fixed text-on-secondary-fixed-variant text-label-md font-semibold rounded-full ring-1 ring-secondary-fixed-dim capitalize">
                    {authUser?.role || 'user'}
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant flex items-center gap-xs mt-xs">
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {authUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            {/* Personal Info */}
            <div className="md:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg space-y-lg">
              <div>
                <h2 className="text-title-lg font-bold text-on-surface">Personal Information</h2>
                <p className="text-body-md text-on-surface-variant">Manage your account identity and contact details.</p>
              </div>

              <div className="space-y-md">
                <div className="space-y-xs">
                  <label className="text-label-md font-medium text-on-surface-variant">Full Name *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-medium text-on-surface-variant">Email Address</label>
                  <input
                    type="email"
                    value={authUser?.email || ''}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed bg-surface-container-high`}
                  />
                  <p className="text-label-sm text-on-surface-variant">Email cannot be changed.</p>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-medium text-on-surface-variant">Phone Number</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                      className={`${inputClass} pl-xl`}
                      placeholder="+62 8xx xxxx xxxx"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md font-medium text-on-surface-variant">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    maxLength={150}
                    rows={4}
                    placeholder="Tell us a bit about yourself…"
                    className="w-full p-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  />
                  <p className="text-label-sm text-on-surface-variant text-right">{profile.bio.length}/150</p>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full flex items-center justify-center gap-sm py-3 bg-primary text-on-primary rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingProfile ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Saving…</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">save</span> Save Changes</>
                )}
              </button>
            </div>

            {/* Security */}
            <div className="md:col-span-5 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg space-y-lg">
              <div>
                <h2 className="text-title-lg font-bold text-on-surface flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">security</span>
                  Security
                </h2>
                <p className="text-body-md text-on-surface-variant">Update your password.</p>
              </div>

              <div className="space-y-md">
                {[
                  { key: 'current_password', label: 'Current Password', showKey: 'current' },
                  { key: 'new_password',      label: 'New Password',     showKey: 'new'     },
                  { key: 'confirm_new_password', label: 'Confirm New Password', showKey: 'confirm' },
                ].map(field => (
                  <div key={field.key} className="space-y-xs">
                    <label className="text-label-md font-medium text-on-surface-variant">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPw[field.showKey] ? 'text' : 'password'}
                        value={pwForm[field.key]}
                        onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className={`${inputClass} pr-xl`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => ({ ...p, [field.showKey]: !p[field.showKey] }))}
                        className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPw[field.showKey] ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {field.key === 'new_password' && pwForm.new_password && (
                      <PasswordStrength password={pwForm.new_password} />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSavePassword}
                disabled={savingPw}
                className="w-full flex items-center justify-center gap-sm py-3 bg-secondary text-on-secondary rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingPw ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Updating…</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">lock_reset</span> Change Password</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}