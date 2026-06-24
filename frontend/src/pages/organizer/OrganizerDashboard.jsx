import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI } from '../../services/api'

const MOCK_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', category_name: 'Conference', status: 'published', start_date: '2025-05-20', total_registrations: 45, total_quota: 100 },
  { event_id: 2, title: 'UI/UX Workshop', category_name: 'Workshop', status: 'draft', start_date: '2025-06-15', total_registrations: 0, total_quota: 50 },
]

const STATUS_PILL = {
  published: 'bg-primary-fixed text-primary',
  draft: 'bg-surface-container-highest text-outline',
  cancelled: 'bg-error-container text-error',
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [stats, setStats] = useState({ total: 2, published: 1, draft: 1, totalRegistrations: 45 })

  useEffect(() => {
    eventsAPI.getMyEvents().then((r) => setEvents(r.data)).catch(() => setEvents(MOCK_EVENTS))
  }, [])

  return (
    <DashboardLayout title="Organizer Dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-xl">
        {[
          { label: 'Total Events', value: stats.total, icon: 'event', color: 'text-primary bg-primary-fixed' },
          { label: 'Published', value: stats.published, icon: 'public', color: 'text-primary bg-primary-fixed' },
          { label: 'Drafts', value: stats.draft, icon: 'draft', color: 'text-outline bg-surface-container-highest' },
          { label: 'Total Registrations', value: stats.totalRegistrations, icon: 'group', color: 'text-secondary bg-secondary-fixed' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <p className="text-body-md text-on-surface-variant">{s.label}</p>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
              </div>
            </div>
            <p className="text-headline-md font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      {/* My Events table */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-title-lg font-bold text-on-surface">My Events</h2>
          <Link to="/organizer/events/create">
            <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">add</span> Create Event
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Event</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Category</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Date</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Registrations</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {events.map((ev) => (
                <tr key={ev.event_id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <p className="text-body-md font-bold text-on-surface">{ev.title}</p>
                  </td>
                  <td className="px-lg py-md">
                    <span className="text-label-md text-on-surface-variant">{ev.category_name}</span>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${STATUS_PILL[ev.status] || STATUS_PILL.draft}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">
                    {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-lg py-md">
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{ev.total_registrations}/{ev.total_quota}</p>
                      <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-xs">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(ev.total_registrations / ev.total_quota) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <Link to={`/events/${ev.event_id}`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="View">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </Link>
                      <Link to={`/organizer/events/${ev.event_id}/attendance`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="Attendance">
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                        </button>
                      </Link>
                      <Link to={`/organizer/events/${ev.event_id}/feedback`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="Feedback">
                          <span className="material-symbols-outlined text-[18px]">reviews</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline">event_busy</span>
            <p className="text-body-md text-on-surface-variant mt-md">No events yet. Create your first event!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}