import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI } from '../../services/api'

function QRPlaceholder({ registrationId }) {
  const code = `EVT-${String(registrationId).padStart(6, '0')}`
  return (
    <div className="flex flex-col items-center gap-sm p-md bg-surface-container-low rounded-xl border border-outline-variant">
      {/* Simple QR-style grid */}
      <div className="w-24 h-24 grid grid-cols-7 gap-px bg-on-surface p-sm rounded-lg">
        {Array.from({ length: 49 }).map((_, i) => {
          const corner = [0,1,6,7,42,43,48].includes(i) || [0,6,7,13,35,41,42,48].includes(i)
          const rand = ((i * 37 + registrationId * 13) % 3 === 0)
          return (
            <div key={i} className={`rounded-[1px] ${corner || rand ? 'bg-on-primary' : 'bg-on-surface'}`} />
          )
        })}
      </div>
      <span className="text-label-sm font-bold text-on-surface tracking-widest">{code}</span>
    </div>
  )
}

function TicketCard({ reg }) {
  const [expanded, setExpanded] = useState(false)
  const eventTitle = reg.event?.title || `Event #${reg.event_id}`
  const ticketType = reg.ticket?.ticket_type || `Ticket #${reg.ticket_id}`
  const startDate  = reg.event?.start_date
    ? new Date(reg.event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const location = reg.event?.location || 'Location TBA'

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      {/* Ticket header strip */}
      <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
      <div className="p-lg">
        <div className="flex flex-col md:flex-row gap-lg">
          {/* QR Code */}
          <QRPlaceholder registrationId={reg.id} />

          {/* Info */}
          <div className="flex-1 space-y-md">
            <div className="flex items-start justify-between gap-md">
              <div>
                <h3 className="text-headline-sm font-bold text-on-surface">{eventTitle}</h3>
                <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-label-sm font-bold bg-[#dcfce7] text-[#15803d] mt-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                  Confirmed
                </span>
              </div>
              <span className="text-label-md font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-sm py-xs rounded-full flex-shrink-0">
                {ticketType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-md text-body-md">
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Date</p>
                <p className="font-medium text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                  {startDate}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Location</p>
                <p className="font-medium text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  {location}
                </p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Ticket ID</p>
                <p className="font-medium text-on-surface font-mono">#{String(reg.id).padStart(6, '0')}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Registered</p>
                <p className="font-medium text-on-surface">
                  {reg.registration_date
                    ? new Date(reg.registration_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="my-md border-t-2 border-dashed border-outline-variant" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-label-md text-on-surface-variant">Show this QR code at the event entrance</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-xs text-primary text-label-md font-semibold hover:underline"
          >
            {expanded ? 'Hide details' : 'Show details'}
            <span className={`material-symbols-outlined text-[16px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>
        </div>

        {expanded && (
          <div className="mt-md pt-md border-t border-outline-variant grid grid-cols-2 gap-sm text-body-md">
            <div>
              <p className="text-label-md text-on-surface-variant">Event ID</p>
              <p className="font-medium text-on-surface">#{reg.event_id}</p>
            </div>
            <div>
              <p className="text-label-md text-on-surface-variant">Ticket Type ID</p>
              <p className="font-medium text-on-surface">#{reg.ticket_id}</p>
            </div>
            {reg.event?.description && (
              <div className="col-span-2">
                <p className="text-label-md text-on-surface-variant">Description</p>
                <p className="text-on-surface">{reg.event.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await registrationsAPI.getMyRegistrations()
        setTickets(res.data.filter(r => r.status === 'confirmed'))
      } catch {
        setError('Failed to load tickets.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = tickets.filter(r =>
    !search || (r.event?.title || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout title="My Tickets">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-lg gap-md">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">My Tickets</h1>
          <p className="text-body-md text-on-surface-variant">Your confirmed event tickets with check-in QR codes.</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="pl-10 pr-md py-2 bg-surface border border-outline-variant rounded-full text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none w-64"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-md mb-lg">
        <div className="bg-primary-fixed rounded-xl px-md py-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">confirmation_number</span>
          <span className="text-body-md font-bold text-primary">{tickets.length} Active Ticket{tickets.length !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-xs px-md py-sm bg-surface border border-outline-variant rounded-xl text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Get More Tickets
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading tickets...
        </div>
      ) : error ? (
        <div className="bg-error-container rounded-xl p-lg text-on-error-container">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-[64px] text-outline mb-md block">confirmation_number</span>
          <p className="text-headline-sm font-bold text-on-surface mb-sm">
            {search ? 'No tickets match your search' : 'No confirmed tickets yet'}
          </p>
          <p className="text-body-md text-on-surface-variant mb-lg">
            {search ? 'Try a different keyword.' : 'Register for events and complete payment to get your tickets.'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/events')}
              className="px-lg py-sm bg-primary text-on-primary rounded-xl text-body-md font-medium hover:opacity-90"
            >
              Browse Events
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-lg">
          {filtered.map(reg => <TicketCard key={reg.id} reg={reg} />)}
        </div>
      )}
    </DashboardLayout>
  )
}