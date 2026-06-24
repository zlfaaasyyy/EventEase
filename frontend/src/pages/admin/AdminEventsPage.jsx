import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'

const MOCK_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', organizer_name: 'TechOrg Indonesia', category_name: 'Conference', status: 'published', start_date: '2025-05-20', registrations: 95, location: 'Jakarta' },
  { event_id: 2, title: 'UI/UX Workshop', organizer_name: 'Creative Studio', category_name: 'Workshop', status: 'draft', start_date: '2025-06-15', registrations: 0, location: 'Makassar' },
  { event_id: 3, title: 'Python Bootcamp', organizer_name: 'CodeCamp ID', category_name: 'Training', status: 'published', start_date: '2025-07-01', registrations: 30, location: 'Bandung' },
  { event_id: 4, title: 'Digital Marketing Seminar', organizer_name: 'DigiMark ID', category_name: 'Seminar', status: 'published', start_date: '2025-06-20', registrations: 80, location: 'Surabaya' },
  { event_id: 5, title: 'Cloud Computing Webinar', organizer_name: 'CloudTech', category_name: 'Webinar', status: 'cancelled', start_date: '2025-07-10', registrations: 200, location: 'Online' },
]

const STATUS_PILL = {
  published: 'bg-primary-fixed text-primary',
  draft: 'bg-surface-container-highest text-outline',
  cancelled: 'bg-error-container text-error',
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    adminAPI.getAllEvents().then((r) => setEvents(r.data)).catch(() => setEvents(MOCK_EVENTS))
  }, [])

  const filtered = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <DashboardLayout title="Events Management">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-lg mb-xl">
        {[
          { label: 'Total', value: events.length, status: 'all' },
          { label: 'Published', value: events.filter((e) => e.status === 'published').length, status: 'published' },
          { label: 'Draft', value: events.filter((e) => e.status === 'draft').length, status: 'draft' },
          { label: 'Cancelled', value: events.filter((e) => e.status === 'cancelled').length, status: 'cancelled' },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => setFilterStatus(s.status)}
            className={`bg-surface rounded-xl p-lg border text-left transition-all shadow-sm ${
              filterStatus === s.status ? 'border-primary shadow-md' : 'border-outline-variant hover:border-primary/50'
            }`}
          >
            <p className="text-body-md text-on-surface-variant mb-xs">{s.label} Events</p>
            <p className="text-headline-md font-bold text-on-surface">{s.value}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row gap-md justify-between items-start md:items-center">
          <h2 className="text-title-lg font-bold text-on-surface">All Events</h2>
          <div className="flex gap-md flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                className="pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none w-56"
                placeholder="Search event or organizer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-md py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Event</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Organizer</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Category</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Date</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Reg.</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((ev) => (
                <tr key={ev.event_id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md">
                    <p className="text-body-md font-bold text-on-surface">{ev.title}</p>
                    <p className="text-label-sm text-outline">{ev.location}</p>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{ev.organizer_name}</td>
                  <td className="px-lg py-md">
                    <span className="text-label-md text-on-surface-variant bg-surface-container-high px-sm py-1 rounded-full">
                      {ev.category_name}
                    </span>
                  </td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-1 text-label-sm rounded-full capitalize font-bold ${STATUS_PILL[ev.status] || STATUS_PILL.draft}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">
                    {new Date(ev.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-lg py-md text-body-md font-semibold text-on-surface">{ev.registrations}</td>
                  <td className="px-lg py-md text-right">
                    <div className="flex gap-sm justify-end">
                      <Link to={`/events/${ev.event_id}`}>
                        <button className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant" title="View">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline">event_busy</span>
            <p className="text-body-md text-on-surface-variant mt-md">Tidak ada event yang ditemukan.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}