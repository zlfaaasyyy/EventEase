import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI } from '../../services/api'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', border: 'border-l-[#22c55e]', pill: 'bg-[#dcfce7] text-[#15803d]' },
  pending:   { label: 'Pending Payment', border: 'border-l-[#f59e0b]', pill: 'bg-[#fef3c7] text-[#b45309]' },
  cancelled: { label: 'Cancelled', border: 'border-l-[#ef4444]', pill: 'bg-[#fee2e2] text-[#b91c1c]' },
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
]

function TicketQr({ registrationId, status }) {
  const [qr, setQr] = useState(null)

  useEffect(() => {
    if (status !== 'confirmed') return
    registrationsAPI.getQrCode(registrationId)
      .then((res) => setQr(res.data.qr_image_base64))
      .catch(() => setQr(null))
  }, [registrationId, status])

  if (status !== 'confirmed') {
    return (
      <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px] text-outline">
          {status === 'cancelled' ? 'block' : 'hourglass_empty'}
        </span>
      </div>
    )
  }

  return (
    <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
      {qr ? (
        <img src={qr} alt="Ticket QR code" className="w-full h-full object-contain" />
      ) : (
        <span className="material-symbols-outlined text-[28px] text-outline animate-pulse">qr_code_2</span>
      )}
    </div>
  )
}

function TicketCard({ reg }) {
  const navigate = useNavigate()
  const cfg = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending
  const eventTitle = reg.event?.title || `Event #${reg.event_id}`
  const ticketType = reg.ticket?.ticket_type || `Ticket #${reg.ticket_id}`
  const startDate = reg.event?.start_date
    ? new Date(reg.event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const location = reg.event?.location || 'Location TBA'

  return (
    <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant border-l-4 ${cfg.border} shadow-sm p-lg flex gap-lg`}>
      <TicketQr registrationId={reg.id} status={reg.status} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-sm mb-xs">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${cfg.pill}`}>
            {cfg.label}
          </span>
        </div>
        <h3 className="text-body-lg font-bold text-on-surface truncate">{eventTitle}</h3>
        <p className="text-label-md text-on-surface-variant flex items-center gap-xs mt-xs">
          <span className="material-symbols-outlined text-[14px]">calendar_month</span>
          {startDate}
        </p>
        <p className="text-label-md text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {location}
        </p>

        <div className="flex items-center justify-between mt-md pt-md border-t border-outline-variant">
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Ticket ID</p>
            <p className="text-label-md font-bold text-on-surface font-mono">#EE-{String(reg.id).padStart(5, '0')}</p>
            <p className="text-label-sm text-on-surface-variant">{ticketType}</p>
          </div>

          {reg.status === 'confirmed' && (
            <a
              href={`data:text/plain,Ticket ${eventTitle}`}
              download={`ticket-${reg.id}.txt`}
              className="px-md py-xs bg-primary text-on-primary rounded-lg text-label-md font-bold hover:opacity-90 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download
            </a>
          )}
          {reg.status === 'pending' && (
            <button
              onClick={() => navigate(`/user/payment/${reg.id}`)}
              className="px-md py-xs border-2 border-primary text-primary rounded-lg text-label-md font-bold hover:bg-primary-fixed"
            >
              Complete Payment
            </button>
          )}
          {reg.status === 'cancelled' && (
            <span className="text-label-md text-on-surface-variant font-medium">View Refund Status</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await registrationsAPI.getMyRegistrations()
        setTickets(res.data)
      } catch {
        setError('Failed to load tickets.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = activeTab === 'all' ? tickets : tickets.filter((t) => t.status === activeTab)

  return (
    <DashboardLayout title="My Tickets">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">My Tickets</h1>
          <p className="text-body-md text-on-surface-variant">Manage and download your upcoming event passes.</p>
        </div>
        <div className="flex bg-surface-container-low rounded-full p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-md py-xs rounded-full text-label-md font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading tickets...
        </div>
      ) : error ? (
        <div className="bg-error-container rounded-xl p-lg text-on-error-container">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant rounded-xl py-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-[48px] text-outline mb-md">confirmation_number</span>
          <p className="text-body-lg font-bold text-on-surface mb-xs">Looking for older tickets?</p>
          <p className="text-body-md text-on-surface-variant mb-lg max-w-sm">
            {activeTab === 'all'
              ? 'Register for events and complete payment to get your tickets.'
              : `You don't have any ${activeTab} tickets right now.`}
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-lg py-sm bg-primary text-on-primary rounded-xl text-body-md font-medium hover:opacity-90"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {filtered.map((reg) => <TicketCard key={reg.id} reg={reg} />)}
        </div>
      )}
    </DashboardLayout>
  )
}