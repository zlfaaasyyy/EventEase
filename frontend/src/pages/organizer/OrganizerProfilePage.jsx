import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function OrganizerProfilePage() {
  const { user, login } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    organization: user?.organization || '',
    website: user?.website || '',
    location: user?.location || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', form)
      showToast('Profil berhasil diperbarui!')
    } catch {
      showToast('Gagal menyimpan profil.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('Password baru tidak cocok.', 'error')
      return
    }
    if (passwordForm.new_password.length < 8) {
      showToast('Password minimal 8 karakter.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.put('/profile/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      showToast('Password berhasil diubah!')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Gagal mengubah password.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full px-md py-[10px] bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md transition-all'

  const tabs = [
    { key: 'profile', label: 'Informasi Profil', icon: 'person' },
    { key: 'password', label: 'Ubah Password', icon: 'lock' },
  ]

  return (
    <DashboardLayout title="My Profile">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-md px-lg py-md rounded-xl shadow-lg text-body-md font-medium transition-all animate-pulse ${
          toast.type === 'error' ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl">
        {/* Profile header card */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg mb-xl flex items-center gap-lg">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-display-lg select-none">
              {form.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-[14px]">edit</span>
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-headline-sm font-bold text-on-surface">{form.name || 'Organizer'}</p>
            <p className="text-body-md text-on-surface-variant">{form.email}</p>
            <div className="flex items-center gap-sm mt-xs">
              <span className="text-label-sm bg-secondary-fixed text-secondary px-sm py-0.5 rounded-full font-bold uppercase tracking-wider">
                Organizer
              </span>
              {user?.is_approved ? (
                <span className="text-label-sm bg-primary-fixed text-primary px-sm py-0.5 rounded-full font-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
              ) : (
                <span className="text-label-sm bg-tertiary-fixed text-on-tertiary-fixed-variant px-sm py-0.5 rounded-full font-bold">
                  Pending Approval
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-sm mb-xl bg-surface-container-low rounded-xl p-xs w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-sm px-lg py-2 rounded-lg font-bold text-label-md transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave}>
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="text-title-lg font-bold text-on-surface">Informasi Dasar</h2>
                <p className="text-body-md text-on-surface-variant mt-xs">Data diri kamu yang tampil di profil publik.</p>
              </div>
              <div className="p-lg space-y-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Nama Lengkap *</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">person</span>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama lengkap"
                        className={`${inputClass} pl-xl`}
                      />
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Email *</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">mail</span>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="email@example.com"
                        className={`${inputClass} pl-xl`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Nomor HP</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">phone</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+62 812 0000 0000"
                        className={`${inputClass} pl-xl`}
                      />
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Lokasi</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">location_on</span>
                      <input
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        placeholder="Kota, Provinsi"
                        className={`${inputClass} pl-xl`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Ceritakan sedikit tentang dirimu sebagai organizer..."
                    className="w-full px-md py-[10px] bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-body-md transition-all resize-none"
                  />
                  <p className="text-label-sm text-outline text-right">{form.bio.length}/300</p>
                </div>
              </div>
            </div>

            {/* Organization info */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="text-title-lg font-bold text-on-surface">Informasi Organisasi</h2>
                <p className="text-body-md text-on-surface-variant mt-xs">Detail organisasi atau perusahaan kamu.</p>
              </div>
              <div className="p-lg space-y-lg">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Nama Organisasi</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">corporate_fare</span>
                    <input
                      value={form.organization}
                      onChange={e => setForm({ ...form, organization: e.target.value })}
                      placeholder="PT. Nama Perusahaan / Komunitas"
                      className={`${inputClass} pl-xl`}
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Website</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">language</span>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                      placeholder="https://yourorganization.com"
                      className={`${inputClass} pl-xl`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-md">
              <button
                type="button"
                onClick={() => setForm({
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: user?.phone || '',
                  bio: user?.bio || '',
                  organization: user?.organization || '',
                  website: user?.website || '',
                  location: user?.location || '',
                })}
                className="px-xl py-2 border border-outline-variant text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-surface-container-high transition-all"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-xl py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm disabled:opacity-60"
              >
                {saving
                  ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                  : <span className="material-symbols-outlined text-[16px]">save</span>
                }
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* Password form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSave}>
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
              <div className="p-lg border-b border-outline-variant">
                <h2 className="text-title-lg font-bold text-on-surface">Ubah Password</h2>
                <p className="text-body-md text-on-surface-variant mt-xs">Pastikan password baru minimal 8 karakter.</p>
              </div>
              <div className="p-lg space-y-lg">
                {/* Current password */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Password Saat Ini *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">lock</span>
                    <input
                      required
                      type={showCurrent ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="••••••••"
                      className={`${inputClass} pl-xl pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">{showCurrent ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Password Baru *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">lock_reset</span>
                    <input
                      required
                      type={showNew ? 'text' : 'password'}
                      minLength={8}
                      value={passwordForm.new_password}
                      onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Min. 8 karakter"
                      className={`${inputClass} pl-xl pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">{showNew ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* Strength bar */}
                  {passwordForm.new_password && (
                    <div className="flex gap-xs mt-xs">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            passwordForm.new_password.length >= i * 3
                              ? i <= 1 ? 'bg-error' : i <= 2 ? 'bg-tertiary' : i <= 3 ? 'bg-secondary' : 'bg-primary'
                              : 'bg-surface-container-highest'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block">Konfirmasi Password Baru *</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[18px]">lock_open</span>
                    <input
                      required
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      placeholder="Ulangi password baru"
                      className={`${inputClass} pl-xl ${
                        passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password
                          ? 'border-error focus:border-error focus:ring-error/20'
                          : ''
                      }`}
                    />
                  </div>
                  {passwordForm.confirm_password && passwordForm.confirm_password !== passwordForm.new_password && (
                    <p className="text-label-sm text-error flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      Password tidak cocok
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || (passwordForm.confirm_password !== passwordForm.new_password)}
                className="px-xl py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm disabled:opacity-60"
              >
                {saving
                  ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                  : <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                }
                Ubah Password
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}