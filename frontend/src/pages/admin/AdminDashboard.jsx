import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'

const MOCK_STATS = {
  totalUsers: 1248,
  totalOrganizers: 34,
  totalEvents: 126,
  totalRevenue: 48750000,
  pendingOrganizers: 5,
  activeEvents: 42,
}

const MOCK_RECENT_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', organizer_name: 'TechOrg Indonesia', status: 'published', start_date: '2025-05-20', registrations: 45 },
  { event_id: 2, title: 'UI/UX Workshop', organizer_name: 'Creative Studio', status: 'draft', start_date: '2025-06-15', registrations: 0 },
  { event_id: 3, title: 'Python Bootcamp', organizer_name: 'CodeCamp ID', status: 'published', start_date: '2025-07-01', registrations: 30 },
]

const MOCK_PENDING = [
  { user_id: 10, name: 'Raka Wijaya', email: 'raka@company.com', created_at: '2025-05-18' },
  { user_id: 11, name: 'Sari Puspita', email: 'sari@eventpro.id', created_at: '2025-05-19' },
]

const STATUS_PILL = {
  published: 'bg-primary-fixed text-primary',
  draft: 'bg-surface-container-highest text-outline',
  cancelled: 'bg-error-container text-error',
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
      <div className="flex items-center justify-between mb-md">
        <p className="text-body-md text-on-surface-variant">{label}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <p className="text-headline-md font-bold text-on-surface">{value}</p>
      {sub && <p className="text-label-md text-on-surface-variant mt-xs">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(MOCK_STATS)
  const [recentEvents, setRecentEvents] = useState(MOCK_RECENT_EVENTS)
  const [pendingOrganizers, setPendingOrganizers] = useState(MOCK_PENDING)

  useEffect(() => {
    if (typeof adminAPI.getSystemReports === 'function') {
      adminAPI.getSystemReports().then(r => setStats(r.data)).catch(() => {})
    }
    if (typeof adminAPI.getAllEvents === 'function') {
      adminAPI.getAllEvents().then(r => {
        if (Array.isArray(r.data)) setRecentEvents(r.data.slice(0, 5))
      }).catch(() => {})
    }
    if (typeof adminAPI.getPendingOrganizers === 'function') {
      adminAPI.getPendingOrganizers().then(r => {
        if (Array.isArray(r.data)) setPendingOrganizers(r.data)
      }).catch(() => {})
    }
  }, [])

  const handleApprove = async (userId) => {
    try { await adminAPI.approveOrganizer(userId) } catch {}
    setPendingOrganizers(prev => prev.filter(o => o.user_id !== userId))
  }

  const handleReject = async (userId) => {
    try { await adminAPI.rejectOrganizer(userId) } catch {}
    setPendingOrganizers(prev => prev.filter(o => o.user_id !== userId))
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <StatCard label="Total Users" value={stats.totalUsers?.toLocaleString('id-ID')} icon="group" color="bg-primary-fixed text-primary" sub="Registered accounts" />
        <StatCard label="Total Events" value={stats.totalEvents?.toLocaleString('id-ID')} icon="event" color="bg-secondary-fixed text-secondary" sub={`${stats.activeEvents} active now`} />
        <StatCard label="Total Organizers" value={stats.totalOrganizers} icon="corporate_fare" color="bg-tertiary-fixed text-on-tertiary-fixed-variant" sub={`${stats.pendingOrganizers} pending approval`} />
        <StatCard label="Total Revenue" value={`Rp${((stats.totalRevenue || 0) / 1_000_000).toFixed(1)}M`} icon="payments" color="bg-primary-fixed text-primary" sub="All-time platform revenue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-title-lg font-bold text-on-surface">Recent Events</h2>
            <Link to="/admin/events" className="text-primary font-bold text-label-md hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Event</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Organizer</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Date</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Reg.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentEvents.map(ev => (
                  <tr key={ev.event_id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-md text-body-md font-medium text-on-surface">{ev.title}</td>
                    <td className="px-lg py-md text-body-md text-on-surface-variant">{ev.organizer_name}</td>
                    <td className="px-lg py-md">
                      <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${STATUS_PILL[ev.status] || STATUS_PILL.draft}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-lg py-md text-body-md text-on-surface-variant">
                      {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-lg py-md text-body-md font-semibold text-on-surface">{ev.registrations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Organizers */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-title-lg font-bold text-on-surface">Pending Approvals</h2>
            <Link to="/admin/organizers" className="text-primary font-bold text-label-md hover:underline">View All</Link>
          </div>
          {pendingOrganizers.length === 0 ? (
            <div className="text-center py-xl px-lg">
              <span className="material-symbols-outlined text-[40px] text-outline">check_circle</span>
              <p className="text-body-md text-on-surface-variant mt-sm">All organizer requests reviewed!</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {pendingOrganizers.map(org => (
                <div key={org.user_id} className="p-lg space-y-md">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold">
                      {org.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-md font-bold text-on-surface truncate">{org.name}</p>
                      <p className="text-label-sm text-outline truncate">{org.email}</p>
                      <p className="text-label-sm text-outline">
                        {new Date(org.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <button onClick={() => handleApprove(org.user_id)} className="flex-1 py-2 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-all">
                      Approve
                    </button>
                    <button onClick={() => handleReject(org.user_id)} className="flex-1 py-2 bg-error-container text-error text-label-md font-bold rounded-lg hover:opacity-90 transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mt-lg">
        {[
          { to: '/admin/users', icon: 'group', label: 'Manage Users', color: 'bg-primary-fixed text-primary' },
          { to: '/admin/categories', icon: 'category', label: 'Categories', color: 'bg-secondary-fixed text-secondary' },
          { to: '/admin/organizers', icon: 'verified_user', label: 'Organizer Approval', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
          { to: '/admin/reports', icon: 'bar_chart', label: 'System Reports', color: 'bg-primary-fixed text-primary' },
        ].map(item => (
          <Link key={item.to} to={item.to}>
            <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-md cursor-pointer group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}>
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              </div>
              <p className="text-label-md font-bold text-on-surface text-center">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}