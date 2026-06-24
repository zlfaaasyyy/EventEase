import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'

const MOCK_USERS = [
  { user_id: 1, name: 'Andi Pratama', email: 'andi@gmail.com', role: 'user', created_at: '2025-01-10', status: 'active' },
  { user_id: 2, name: 'Budi Santoso', email: 'budi@gmail.com', role: 'organizer', created_at: '2025-02-05', status: 'active' },
  { user_id: 3, name: 'Citra Dewi', email: 'citra@gmail.com', role: 'user', created_at: '2025-03-20', status: 'inactive' },
  { user_id: 4, name: 'Deni Kurniawan', email: 'deni@company.id', role: 'organizer', created_at: '2025-03-28', status: 'pending' },
  { user_id: 5, name: 'Eva Rahayu', email: 'eva@mail.com', role: 'user', created_at: '2025-04-15', status: 'active' },
  { user_id: 6, name: 'Admin System', email: 'admin@eventease.id', role: 'admin', created_at: '2024-12-01', status: 'active' },
]

const ROLE_PILL = {
  admin: 'bg-primary-fixed text-primary',
  organizer: 'bg-secondary-fixed text-secondary',
  user: 'bg-surface-container-highest text-on-surface-variant',
}

const STATUS_PILL = {
  active: 'bg-primary-fixed text-primary',
  inactive: 'bg-surface-container-highest text-outline',
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    adminAPI.getUsers().then((r) => setUsers(r.data)).catch(() => setUsers(MOCK_USERS))
  }, [])

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'all' || u.role === filterRole
    return matchSearch && matchRole
  })

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await adminAPI.updateUserStatus(userId, { status: newStatus })
      setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, status: newStatus } : u))
    } catch {
      alert('Gagal mengubah status user.')
    }
  }

  return (
    <DashboardLayout title="Manage Users">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg mb-xl">
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Total Users</p>
          <p className="text-headline-md font-bold text-on-surface">{users.length}</p>
        </div>
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Organizers</p>
          <p className="text-headline-md font-bold text-secondary">{users.filter((u) => u.role === 'organizer').length}</p>
        </div>
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Active Users</p>
          <p className="text-headline-md font-bold text-primary">{users.filter((u) => u.status === 'active').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row gap-md justify-between items-start md:items-center">
          <h2 className="text-title-lg font-bold text-on-surface">All Users</h2>
          <div className="flex gap-md flex-wrap">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none w-52"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Role filter */}
            <select
              className="px-md py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-lg py-md text-label-sm text-outline uppercase">User</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Email</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Role</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Joined</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((user) => (
                <tr key={user.user_id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-body-md font-medium text-on-surface">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{user.email}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${ROLE_PILL[user.role] || ROLE_PILL.user}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${STATUS_PILL[user.status] || STATUS_PILL.inactive}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-lg py-md text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleStatusToggle(user.user_id, user.status)}
                        className={`px-md py-1.5 text-label-md font-bold rounded-lg transition-all ${
                          user.status === 'active'
                            ? 'bg-error-container text-error hover:opacity-80'
                            : 'bg-primary-fixed text-primary hover:opacity-80'
                        }`}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline">person_off</span>
            <p className="text-body-md text-on-surface-variant mt-md">Tidak ada user yang ditemukan.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}