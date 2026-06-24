import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'

const MOCK_MONTHLY = [
  { month: 'Jan', events: 8, users: 120, revenue: 4500000 },
  { month: 'Feb', events: 12, users: 180, revenue: 6800000 },
  { month: 'Mar', events: 15, users: 210, revenue: 8200000 },
  { month: 'Apr', events: 10, users: 150, revenue: 5500000 },
  { month: 'May', events: 20, users: 310, revenue: 12000000 },
  { month: 'Jun', events: 18, users: 280, revenue: 9800000 },
]

const MOCK_TOP_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', registrations: 95, revenue: 28500000 },
  { event_id: 2, title: 'UI/UX Workshop Series', registrations: 48, revenue: 3600000 },
  { event_id: 3, title: 'Python Bootcamp', registrations: 30, revenue: 4500000 },
  { event_id: 4, title: 'Digital Marketing Seminar', registrations: 80, revenue: 0 },
  { event_id: 5, title: 'Cloud Webinar', registrations: 200, revenue: 10000000 },
]

const BAR_MAX = Math.max(...MOCK_MONTHLY.map((m) => m.revenue))

export default function SystemReportsPage() {
  const [reports, setReports] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    adminAPI.getSystemReports().then((r) => setReports(r.data)).catch(() => {})
  }, [])

  const stats = reports || {
    totalUsers: 1248,
    totalEvents: 126,
    totalRevenue: 48750000,
    totalRegistrations: 3420,
    activeEvents: 42,
    totalOrganizers: 34,
  }

  return (
    <DashboardLayout title="System Reports">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
        {[
          { label: 'Total Revenue', value: `Rp${(stats.totalRevenue / 1_000_000).toFixed(1)}M`, icon: 'payments', color: 'bg-primary-fixed text-primary', change: '+12.5%' },
          { label: 'Total Registrations', value: stats.totalRegistrations?.toLocaleString('id-ID'), icon: 'confirmation_number', color: 'bg-secondary-fixed text-secondary', change: '+8.3%' },
          { label: 'Total Events', value: stats.totalEvents, icon: 'event', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', change: '+5.2%' },
          { label: 'Total Users', value: stats.totalUsers?.toLocaleString('id-ID'), icon: 'group', color: 'bg-primary-fixed text-primary', change: '+20.1%' },
          { label: 'Active Events', value: stats.activeEvents, icon: 'event_available', color: 'bg-secondary-fixed text-secondary', change: '' },
          { label: 'Organizers', value: stats.totalOrganizers, icon: 'corporate_fare', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', change: '' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <p className="text-body-md text-on-surface-variant">{kpi.label}</p>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
              </div>
            </div>
            <p className="text-headline-md font-bold text-on-surface">{kpi.value}</p>
            {kpi.change && (
              <p className="text-label-md text-primary mt-xs flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {kpi.change} from last month
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-xl bg-surface-container-low rounded-xl p-xs w-fit">
        {[
          { key: 'overview', label: 'Monthly Overview' },
          { key: 'events', label: 'Top Events' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-lg py-2 rounded-lg font-bold text-label-md transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      {activeTab === 'overview' && (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
          <h2 className="text-title-lg font-bold text-on-surface mb-xl">Monthly Revenue (2025)</h2>
          <div className="flex items-end gap-md h-56">
            {MOCK_MONTHLY.map((m) => {
              const pct = Math.round((m.revenue / BAR_MAX) * 100)
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-sm group">
                  <div className="relative w-full flex items-end justify-center h-44">
                    <div
                      className="w-full rounded-t-lg bg-primary group-hover:bg-primary-container transition-colors relative overflow-hidden cursor-pointer"
                      style={{ height: `${pct}%`, minHeight: 4 }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-background text-surface text-label-sm px-sm py-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Rp{(m.revenue / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                  <p className="text-label-sm text-on-surface-variant font-medium">{m.month}</p>
                </div>
              )
            })}
          </div>

          {/* Monthly stats table */}
          <div className="mt-xl overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-md text-label-sm text-outline uppercase">Month</th>
                  <th className="py-md text-label-sm text-outline uppercase">Events</th>
                  <th className="py-md text-label-sm text-outline uppercase">New Users</th>
                  <th className="py-md text-label-sm text-outline uppercase text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {MOCK_MONTHLY.map((m) => (
                  <tr key={m.month} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-md font-bold text-on-surface">{m.month} 2025</td>
                    <td className="py-md text-on-surface-variant">{m.events}</td>
                    <td className="py-md text-on-surface-variant">{m.users}</td>
                    <td className="py-md text-right font-semibold text-primary">
                      Rp{m.revenue.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary-container">
                  <td className="py-md font-bold text-on-surface">Total</td>
                  <td className="py-md font-bold text-on-surface">{MOCK_MONTHLY.reduce((s, m) => s + m.events, 0)}</td>
                  <td className="py-md font-bold text-on-surface">{MOCK_MONTHLY.reduce((s, m) => s + m.users, 0)}</td>
                  <td className="py-md text-right font-bold text-primary text-title-lg">
                    Rp{MOCK_MONTHLY.reduce((s, m) => s + m.revenue, 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Top Events */}
      {activeTab === 'events' && (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant">
            <h2 className="text-title-lg font-bold text-on-surface">Top Performing Events</h2>
            <p className="text-body-md text-on-surface-variant">Ranked by total registrations</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">#</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Event</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Registrations</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase">Popularity</th>
                  <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {MOCK_TOP_EVENTS.sort((a, b) => b.registrations - a.registrations).map((ev, i) => {
                  const maxReg = Math.max(...MOCK_TOP_EVENTS.map((e) => e.registrations))
                  const pct = Math.round((ev.registrations / maxReg) * 100)
                  return (
                    <tr key={ev.event_id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-label-sm font-bold ${
                          i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-lg py-md text-body-md font-medium text-on-surface">{ev.title}</td>
                      <td className="px-lg py-md text-body-md font-bold text-primary">{ev.registrations}</td>
                      <td className="px-lg py-md">
                        <div className="w-32 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-lg py-md text-right text-body-md font-semibold text-on-surface">
                        {ev.revenue > 0 ? `Rp${ev.revenue.toLocaleString('id-ID')}` : (
                          <span className="text-primary font-bold">Free</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}