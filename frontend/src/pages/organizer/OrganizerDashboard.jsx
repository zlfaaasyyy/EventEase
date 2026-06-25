import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI } from '../../services/api'

const MOCK_EVENTS = [
  { id: 1, title: 'Tech Summit 2025', category_id: 1, status: 'published', start_date: '2025-05-20' },
  { id: 2, title: 'UI/UX Workshop', category_id: 2, status: 'draft', start_date: '2025-06-15' },
]

const STATUS_PILL = {
  published: 'bg-primary-fixed text-primary',
  draft: 'bg-surface-container-highest text-outline',
  cancelled: 'bg-error-container text-error',
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState(MOCK_EVENTS)

  useEffect(() => {
    eventsAPI.getMyEvents().then((r) => setEvents(r.data)).catch(() => setEvents(MOCK_EVENTS))
  }, [])

  const stats = {
    total: events.length,
    published: events.filter((e) => e.status === 'published').length,
    draft: events.filter((e) => e.status === 'draft').length,
  }

  return (
    <DashboardLayout title="Organizer Dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {[
          { label: 'Total Events', value: stats.total, icon: 'event', color: 'text-primary bg-primary-fixed' },
          { label: 'Published', value: stats.published, icon: 'public', color: 'text-primary bg-primary-fixed' },
          { label: 'Drafts', value: stats.draft, icon: 'draft', color: 'text-outline bg-surface-container-highest' },
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
                <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Date</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <p className="text-body-md font-bold text-on-surface">{ev.title}</p>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${STATUS_PILL[ev.status] || STATUS_PILL.draft}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">
                    {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <Link to={`/events/${ev.id}`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="View">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </Link>
                      <Link to={`/organizer/events/${ev.id}/attendance`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="Attendance">
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                        </button>
                      </Link>
                      <Link to={`/organizer/events/${ev.id}/feedback`}>
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