import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI, registrationsAPI } from '../../services/api'

const STATUS_STYLES = {
  confirmed: { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', dot: 'bg-[#15803d]', label: 'Confirmed' },
  pending:   { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]', dot: 'bg-[#a16207]', label: 'Pending'   },
  cancelled: { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', dot: 'bg-[#ba1a1a]', label: 'Cancelled' },
}

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span className={`inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-label-sm font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function RegistrationsListPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [registrations, setRegistrations] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventsAPI.getMyEvents()
        setEvents(res.data)
        if (res.data.length > 0) setSelectedEvent(res.data[0].id)
      } catch {
        showToast('Failed to load events.', 'error')
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) fetchRegistrations()
  }, [selectedEvent, filterStatus])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const params = filterStatus ? { status: filterStatus } : {}
      const res = await registrationsAPI.getByEvent(selectedEvent, params)
      setRegistrations(res.data)
    } catch {
      showToast('Failed to load registrations.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await registrationsAPI.updateStatus(id, { status })
      showToast(`Registration ${status}.`, 'success')
      fetchRegistrations()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to update status.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const total     = registrations.length
  const confirmed = registrations.filter(r => r.status === 'confirmed').length
  const pending   = registrations.filter(r => r.status === 'pending').length
  const cancelled = registrations.filter(r => r.status === 'cancelled').length

  return (
    <DashboardLayout title="Registrations">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-sm px-md py-sm rounded-xl shadow-lg border-l-4 text-body-md font-medium ${
          toast.type === 'success' ? 'bg-white border-[#15803d] text-[#15803d]' : 'bg-white border-error text-error'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="mb-lg">
        <h1 className="text-headline-md font-bold text-on-surface">Registrations</h1>
        <p className="text-body-md text-on-surface-variant">View and manage participant registrations for your events.</p>
      </div>

      {/* Event selector */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg mb-lg">
        <div className="flex flex-col md:flex-row gap-md">
          <div className="flex-1 space-y-xs">
            <label className="text-label-md font-medium text-on-surface-variant">Select Event</label>
            {loadingEvents ? (
              <div className="h-11 bg-surface-container-low rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedEvent}
                onChange={e => setSelectedEvent(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none"
              >
                {events.length === 0
                  ? <option value="">No events</option>
                  : events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)
                }
              </select>
            )}
          </div>
          <div className="space-y-xs">
            <label className="text-label-md font-medium text-on-surface-variant">Filter Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-11 px-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && registrations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
          {[
            { label: 'Total',     value: total,     color: 'text-primary',     icon: 'group'         },
            { label: 'Confirmed', value: confirmed, color: 'text-[#15803d]',   icon: 'check_circle'  },
            { label: 'Pending',   value: pending,   color: 'text-[#a16207]',   icon: 'pending'       },
            { label: 'Cancelled', value: cancelled, color: 'text-[#ba1a1a]',   icon: 'cancel'        },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md">
              <div className="flex items-center justify-between mb-xs">
                <span className="text-label-md text-on-surface-variant">{s.label}</span>
                <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
              </div>
              <span className={`text-headline-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading registrations...
          </div>
        ) : !selectedEvent || events.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant">Select an event to view its registrations.</div>
        ) : registrations.length === 0 ? (
          <div className="p-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-sm block">group_off</span>
            <p className="text-body-lg font-semibold text-on-surface">No registrations {filterStatus ? `with status "${filterStatus}"` : 'yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {['Participant', 'Ticket Type', 'Registered On', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-md py-4 text-label-sm uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-3">
                      <div className="flex items-center gap-md">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md flex-shrink-0">
                          {(reg.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">{reg.user?.name || `User #${reg.user_id}`}</p>
                          <p className="text-label-md text-on-surface-variant">{reg.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-3">
                      <span className="text-label-md font-semibold bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded">
                        {reg.ticket?.ticket_type || `#${reg.ticket_id}`}
                      </span>
                    </td>
                    <td className="px-md py-3 text-body-md text-on-surface-variant">
                      {formatDate(reg.registration_date)}
                    </td>
                    <td className="px-md py-3"><Badge status={reg.status} /></td>
                    <td className="px-md py-3">
                      <div className="flex items-center gap-xs">
                        {reg.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                            disabled={updatingId === reg.id}
                            className="flex items-center gap-xs px-sm py-xs bg-[#dcfce7] text-[#15803d] rounded-lg text-label-md font-semibold hover:bg-[#bbf7d0] disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Confirm
                          </button>
                        )}
                        {reg.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(reg.id, 'cancelled')}
                            disabled={updatingId === reg.id}
                            className="flex items-center gap-xs px-sm py-xs bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-label-md font-semibold hover:bg-[#fecaca] disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                            Cancel
                          </button>
                        )}
                        {updatingId === reg.id && (
                          <span className="material-symbols-outlined animate-spin text-[16px] text-on-surface-variant">progress_activity</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}