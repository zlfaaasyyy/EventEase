import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { adminAPI } from '../../services/api'

const MOCK_REQUESTS = [
  { id: 10, name: 'Raka Wijaya', email: 'raka@company.com', created_at: '2025-05-18', status: 'pending', bio: 'Event organizer with 5 years experience in tech conferences.' },
  { id: 11, name: 'Sari Puspita', email: 'sari@eventpro.id', created_at: '2025-05-19', status: 'pending', bio: 'Professional event planner specializing in corporate workshops.' },
  { id: 12, name: 'Hendra Gunawan', email: 'hendra@hevents.com', created_at: '2025-05-17', status: 'approved', bio: 'Startup event creator based in Bandung.' },
  { id: 13, name: 'Nita Maharani', email: 'nita@bali.id', created_at: '2025-05-15', status: 'rejected', bio: 'Online webinar host.' },
]

const STATUS_MAP = {
  pending: { pill: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', label: 'Pending' },
  approved: { pill: 'bg-primary-fixed text-primary', label: 'Approved' },
  rejected: { pill: 'bg-error-container text-error', label: 'Rejected' },
}

export default function OrganizerApprovalsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS)
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(null)

  useEffect(() => {
    adminAPI.getOrganizerApprovals({ status: null })
      .then((r) => {
        if (r.data?.length) {
          setRequests(r.data)
        } else {
          setRequests([])
        }
      })
      .catch(() => {})
  }, [])

  const handleAction = async (id, action) => {
    setLoading(`${id}-${action}`)
    try {
      if (action === 'approve') await adminAPI.approveOrganizer(id)
      else await adminAPI.rejectOrganizer(id)
      setRequests((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r)
      )
    } catch (err) {
      alert(err.response?.data?.detail || `Failed to ${action} organizer`)
    } finally {
      setLoading(null)
    }
  }

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter)

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }

  return (
    <DashboardLayout title="Organizer Approvals">
      {/* Filter tabs */}
      <div className="flex gap-sm mb-xl bg-surface-container-low rounded-xl p-xs w-fit">
        {[
          { key: 'all', label: `All (${counts.all})` },
          { key: 'pending', label: `Pending (${counts.pending})` },
          { key: 'approved', label: `Approved (${counts.approved})` },
          { key: 'rejected', label: `Rejected (${counts.rejected})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-lg py-2 rounded-lg font-bold text-label-md transition-all ${
              filter === tab.key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-xl bg-surface rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-[48px] text-outline">verified_user</span>
          <p className="text-body-md text-on-surface-variant mt-md">No requests in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {filtered.map((req) => {
            const sm = STATUS_MAP[req.status] || STATUS_MAP.pending
            return (
              <div key={req.id} className="bg-surface rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col gap-md">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-md">
                    <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold text-headline-sm">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-on-surface">{req.name}</p>
                      <p className="text-label-md text-on-surface-variant">{req.email}</p>
                    </div>
                  </div>
                  <span className={`px-sm py-1 text-label-sm rounded-full font-bold ${sm.pill}`}>
                    {sm.label}
                  </span>
                </div>

                {/* Bio */}
                {req.bio && (
                  <p className="text-body-md text-on-surface-variant leading-relaxed bg-surface-container-low p-md rounded-lg">
                    {req.bio}
                  </p>
                )}

                {/* Date */}
                {req.created_at && (
                  <p className="text-label-sm text-outline flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    Requested on{' '}
                    {new Date(req.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex gap-sm mt-auto">
                    <button
                      disabled={!!loading}
                      onClick={() => handleAction(req.id, 'approve')}
                      className="flex-1 py-2.5 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-xs disabled:opacity-50"
                    >
                      {loading === `${req.id}-approve`
                        ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                        : <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      }
                      Approve
                    </button>
                    <button
                      disabled={!!loading}
                      onClick={() => handleAction(req.id, 'reject')}
                      className="flex-1 py-2.5 bg-error-container text-error text-label-md font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-xs disabled:opacity-50"
                    >
                      {loading === `${req.id}-reject`
                        ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                        : <span className="material-symbols-outlined text-[16px]">cancel</span>
                      }
                      Reject
                    </button>
                  </div>
                )}

                {req.status !== 'pending' && (
                  <div className={`text-center py-2 rounded-lg text-label-md font-bold ${
                    req.status === 'approved' ? 'bg-primary-fixed text-primary' : 'bg-error-container text-error'
                  }`}>
                    {req.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}