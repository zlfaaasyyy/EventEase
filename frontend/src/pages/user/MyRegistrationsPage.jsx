import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI } from '../../services/api'

const STATUS_STYLES = {
  confirmed: { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', dot: 'bg-[#15803d]', label: 'Confirmed' },
  pending:   { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]', dot: 'bg-[#a16207]', label: 'Pending'   },
  cancelled: { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', dot: 'bg-[#ba1a1a]', label: 'Cancelled' },
}

const PAY_STYLES = {
  paid:    { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]', label: 'Paid'    },
  pending: { bg: 'bg-[#fef9c3]', text: 'text-[#a16207]', label: 'Pending' },
  failed:  { bg: 'bg-[#ffdad6]', text: 'text-[#ba1a1a]', label: 'Failed'  },
}

function StatusBadge({ status, styles }) {
  const s = styles[status] || styles.pending
  return (
    <span className={`inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-label-sm font-bold ${s.bg} ${s.text}`}>
      {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
      {s.label}
    </span>
  )
}

export default function MyRegistrationsPage() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchRegistrations() }, [filterStatus])

  const fetchRegistrations = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await registrationsAPI.getMyRegistrations()
      let data = res.data
      if (filterStatus) data = data.filter(r => r.status === filterStatus)
      setRegistrations(data)
    } catch {
      setError('Failed to load registrations.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this registration?')) return
    setCancellingId(id)
    try {
      await registrationsAPI.cancel(id)
      showToast('Registration cancelled.', 'success')
      fetchRegistrations()
    } catch (e) {
      showToast(e.response?.data?.detail || 'Failed to cancel.', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const total     = registrations.length
  const confirmed = registrations.filter(r => r.status === 'confirmed').length
  const pending   = registrations.filter(r => r.status === 'pending').length

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <DashboardLayout title="My Registrations">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-sm px-md py-sm rounded-xl shadow-lg border-l-4 text-body-md font-medium ${
          toast.type === 'success'
            ? 'bg-white border-[#15803d] text-[#15803d]'
            : 'bg-white border-error text-error'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
        {[
          { label: 'Total Events',  value: total,     icon: 'event',        color: 'text-primary'        },
          { label: 'Confirmed',     value: confirmed, icon: 'check_circle', color: 'text-[#15803d]'      },
          { label: 'Pending',       value: pending,   icon: 'pending',      color: 'text-[#a16207]'      },
        ].map(c => (
          <div key={c.label} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-sm">
              <span className="text-label-md text-on-surface-variant">{c.label}</span>
              <span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span>
            </div>
            <div className="text-headline-md font-bold text-on-surface">{loading ? '—' : c.value}</div>
          </div>
        ))}
      </div>

      {/* Header + filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-md gap-md">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">My Registrations</h1>
          <p className="text-body-md text-on-surface-variant">Manage your upcoming events and ticket details.</p>
        </div>
        <div className="flex items-center gap-sm">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-md py-2 bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-xs px-md py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Browse Events
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {loading ? (
          <div className="p-xl flex items-center justify-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading registrations...
          </div>
        ) : error ? (
          <div className="p-xl text-center text-error">{error}</div>
        ) : registrations.length === 0 ? (
          <div className="p-xl text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-md block">event_busy</span>
            <p className="text-body-lg font-semibold text-on-surface mb-sm">No registrations yet</p>
            <p className="text-body-md text-on-surface-variant mb-lg">Find events you love and register!</p>
            <button
              onClick={() => navigate('/events')}
              className="px-lg py-sm bg-primary text-on-primary rounded-lg text-body-md font-medium hover:opacity-90"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {['Event Name', 'Date', 'Ticket Type', 'Reg. Status', 'Action'].map(h => (
                    <th key={h} className="px-md py-4 text-label-sm uppercase tracking-wider text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-4">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">
                            {reg.event?.title || `Event #${reg.event_id}`}
                          </p>
                          <p className="text-label-md text-on-surface-variant">ID #{reg.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-md py-4 text-body-md text-on-surface-variant">
                      {formatDate(reg.event?.start_date || reg.registration_date)}
                    </td>
                    <td className="px-md py-4">
                      <span className="text-label-md font-semibold bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-1 rounded">
                        {reg.ticket?.ticket_type || `Ticket #${reg.ticket_id}`}
                      </span>
                    </td>
                    <td className="px-md py-4">
                      <StatusBadge status={reg.status} styles={STATUS_STYLES} />
                    </td>
                    <td className="px-md py-4">
                      <div className="flex items-center gap-sm">
                        {reg.status === 'pending' && (
                          <button
                            onClick={() => navigate(`/user/payment/${reg.id}`)}
                            className="text-primary text-label-md font-semibold hover:underline"
                          >
                            Pay Now
                          </button>
                        )}
                        {reg.status === 'confirmed' && (
                          <button
                            onClick={() => navigate('/user/tickets')}
                            className="text-primary text-label-md font-semibold hover:underline"
                          >
                            View Ticket
                          </button>
                        )}
                        {reg.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(reg.id)}
                            disabled={cancellingId === reg.id}
                            className="text-error text-label-md font-semibold hover:underline disabled:opacity-50"
                          >
                            {cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}
                          </button>
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