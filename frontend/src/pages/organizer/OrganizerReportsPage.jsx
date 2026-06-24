import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI } from '../../services/api'

const MOCK_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', start_date: '2025-05-20', status: 'published', registrations: 95, quota: 100, revenue: 28500000, rating: 4.5, category_name: 'Conference' },
  { event_id: 2, title: 'UI/UX Workshop', start_date: '2025-06-15', status: 'draft', registrations: 0, quota: 50, revenue: 0, rating: null, category_name: 'Workshop' },
  { event_id: 3, title: 'Python Bootcamp', start_date: '2025-07-01', status: 'published', registrations: 28, quota: 30, revenue: 4200000, rating: 4.2, category_name: 'Training' },
]

const MOCK_MONTHLY = [
  { month: 'Mar', events: 1, registrations: 28, revenue: 4200000 },
  { month: 'Apr', events: 0, registrations: 0, revenue: 0 },
  { month: 'Mei', events: 1, registrations: 95, revenue: 28500000 },
  { month: 'Jun', events: 1, registrations: 0, revenue: 0 },
  { month: 'Jul', events: 1, registrations: 0, revenue: 0 },
]

const BAR_MAX = Math.max(...MOCK_MONTHLY.map(m => m.revenue), 1)

export default function OrganizerReportsPage() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    eventsAPI.getMyEvents().then(r => setEvents(r.data)).catch(() => setEvents(MOCK_EVENTS))
  }, [])

  const totalRevenue = events.reduce((s, e) => s + e.revenue, 0)
  const totalRegistrations = events.reduce((s, e) => s + e.registrations, 0)
  const totalQuota = events.reduce((s, e) => s + e.quota, 0)
  const avgRating = events.filter(e => e.rating).length
    ? (events.filter(e => e.rating).reduce((s, e) => s + e.rating, 0) / events.filter(e => e.rating).length).toFixed(1)
    : '—'

  return (
    <DashboardLayout title="My Reports">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        {[
          { label: 'Total Revenue', value: `Rp${(totalRevenue / 1_000_000).toFixed(1)}M`, icon: 'payments', color: 'bg-primary-fixed text-primary' },
          { label: 'Total Registrations', value: totalRegistrations, icon: 'confirmation_number', color: 'bg-secondary-fixed text-secondary' },
          { label: 'Fill Rate', value: `${totalQuota > 0 ? Math.round((totalRegistrations / totalQuota) * 100) : 0}%`, icon: 'donut_large', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
          { label: 'Avg Rating', value: avgRating, icon: 'star', color: 'bg-primary-fixed text-primary' },
        ].map(k => (
          <div key={k.label} className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <p className="text-body-md text-on-surface-variant">{k.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <span className="material-symbols-outlined text-[18px]">{k.icon}</span>
              </div>
            </div>
            <p className="text-headline-md font-bold text-on-surface">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-sm mb-xl bg-surface-container-low rounded-xl p-xs w-fit">
        {[
          { key: 'overview', label: 'Monthly Overview' },
          { key: 'events', label: 'Per Event' },
        ].map(tab => (
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

      {/* Monthly chart */}
      {activeTab === 'overview' && (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg">
          <h2 className="text-title-lg font-bold text-on-surface mb-xl">Revenue per Bulan (2025)</h2>
          <div className="flex items-end gap-md h-52 mb-md">
            {MOCK_MONTHLY.map(m => {
              const pct = Math.round((m.revenue / BAR_MAX) * 100)
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-sm group">
                  <div className="relative w-full flex items-end justify-center h-40">
                    <div
                      className="w-full rounded-t-lg bg-primary group-hover:bg-primary-container transition-colors cursor-pointer relative"
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-background text-surface text-label-sm px-sm py-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {m.revenue > 0 ? `Rp${(m.revenue / 1_000_000).toFixed(1)}M` : 'Rp0'}
                      </div>
                    </div>
                  </div>
                  <p className="text-label-sm text-on-surface-variant font-medium">{m.month}</p>
                </div>
              )
            })}
          </div>

          <div className="overflow-x-auto mt-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="py-md text-label-sm text-outline uppercase">Bulan</th>
                  <th className="py-md text-label-sm text-outline uppercase">Events</th>
                  <th className="py-md text-label-sm text-outline uppercase">Registrasi</th>
                  <th className="py-md text-label-sm text-outline uppercase text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {MOCK_MONTHLY.map(m => (
                  <tr key={m.month} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-md font-bold text-on-surface">{m.month} 2025</td>
                    <td className="py-md text-on-surface-variant">{m.events}</td>
                    <td className="py-md text-on-surface-variant">{m.registrations}</td>
                    <td className="py-md text-right font-semibold text-primary">
                      {m.revenue > 0 ? `Rp${m.revenue.toLocaleString('id-ID')}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary-container">
                  <td className="py-md font-bold text-on-surface">Total</td>
                  <td className="py-md font-bold">{MOCK_MONTHLY.reduce((s, m) => s + m.events, 0)}</td>
                  <td className="py-md font-bold">{MOCK_MONTHLY.reduce((s, m) => s + m.registrations, 0)}</td>
                  <td className="py-md text-right font-bold text-primary text-title-lg">
                    Rp{MOCK_MONTHLY.reduce((s, m) => s + m.revenue, 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Per event */}
      {activeTab === 'events' && (
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant">
            <h2 className="text-title-lg font-bold text-on-surface">Performa per Event</h2>
          </div>
          <div className="divide-y divide-outline-variant">
            {events.map((ev, i) => {
              const fillPct = ev.quota > 0 ? Math.round((ev.registrations / ev.quota) * 100) : 0
              return (
                <div key={ev.event_id} className="p-lg flex flex-col md:flex-row md:items-center gap-lg hover:bg-surface-container-low transition-colors">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md shrink-0 ${
                    i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
                  }`}>
                    #{i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-md mb-xs flex-wrap">
                      <p className="text-body-md font-bold text-on-surface">{ev.title}</p>
                      <span className="text-label-sm bg-surface-container-high text-on-surface-variant px-sm py-0.5 rounded-full">
                        {ev.category_name}
                      </span>
                      <span className={`text-label-sm px-sm py-0.5 rounded-full font-bold ${
                        ev.status === 'published' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest text-outline'
                      }`}>
                        {ev.status}
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-sm">
                      {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {/* Fill bar */}
                    <div className="flex items-center gap-md">
                      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden max-w-xs">
                        <div
                          className={`h-full rounded-full ${fillPct >= 90 ? 'bg-error' : 'bg-primary'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
                        {ev.registrations}/{ev.quota} seats ({fillPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-xl shrink-0">
                    <div className="text-center">
                      <p className="text-label-sm text-outline uppercase mb-xs">Revenue</p>
                      <p className="text-body-md font-bold text-primary">
                        {ev.revenue > 0 ? `Rp${(ev.revenue / 1_000_000).toFixed(1)}M` : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-label-sm text-outline uppercase mb-xs">Rating</p>
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: '#F59E0B', fontVariationSettings: "'FILL' 1" }}>star</span>
                        <p className="text-body-md font-bold text-on-surface">{ev.rating ?? '—'}</p>
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/organizer/events/${ev.event_id}/registrations`}
                        className="text-label-sm text-primary font-bold hover:underline flex items-center gap-xs mt-3"
                      >
                        Detail <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}