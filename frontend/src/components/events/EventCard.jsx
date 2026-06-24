import { Link } from 'react-router-dom'

const CATEGORY_COLORS = {
  Conference: 'bg-primary/90',
  Workshop: 'bg-secondary/90',
  Seminar: 'bg-primary-container text-on-primary-container',
  Training: 'bg-tertiary/90',
  Webinar: 'bg-secondary/90',
}

function formatPrice(price) {
  if (!price || price === 0) return 'Free'
  return `Rp${Number(price).toLocaleString('id-ID')}`
}

function formatDate(start, end) {
  if (!start) return '-'
  const s = new Date(start)
  const dateStr = s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  if (end && end !== start) {
    const e = new Date(end)
    const endStr = e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${dateStr} – ${endStr}`
  }
  return dateStr
}

export default function EventCard({ event }) {
  const isSoldOut = event.available_quota === 0
  const categoryColor = CATEGORY_COLORS[event.category_name] || 'bg-primary/90'
  const progress = event.total_quota > 0 ? ((event.total_quota - (event.available_quota ?? event.total_quota)) / event.total_quota) * 100 : 0

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-outline-variant/30 flex flex-col h-full ${isSoldOut ? 'grayscale-[0.2]' : ''}`}>
      {/* Image */}
      <div className="relative h-48 bg-surface-container-high">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-fixed to-secondary-fixed">
            <span className="material-symbols-outlined text-primary text-[64px]">event</span>
          </div>
        )}

        {/* Category badge */}
        {event.category_name && (
          <span className={`absolute top-4 left-4 text-white text-label-sm px-md py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${categoryColor}`}>
            {event.category_name}
          </span>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-on-background/40 flex items-center justify-center">
            <span className="bg-error text-white font-bold px-lg py-1 rounded-full text-label-md uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-lg flex flex-col flex-1 ${isSoldOut ? 'opacity-75' : ''}`}>
        <div className="flex justify-between items-start mb-sm">
          <h3 className="text-title-lg text-on-surface leading-tight flex-1">{event.title}</h3>
          <button className="material-symbols-outlined text-outline hover:text-error transition-colors ml-sm">favorite</button>
        </div>

        <div className="space-y-sm mb-md flex-1">
          {event.organizer_name && (
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
              <span className="text-label-md">{event.organizer_name}</span>
            </div>
          )}
          <div className="flex items-center gap-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="text-label-md">{formatDate(event.start_date, event.end_date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-label-md">{event.location}</span>
            </div>
          )}
        </div>

        {/* Price + quota */}
        <div className="pt-md border-t border-outline-variant/30 mt-auto">
          <div className="flex justify-between items-center mb-md">
            <span className="text-primary font-bold text-title-lg">{formatPrice(event.min_price)}</span>
            <div className="text-right">
              <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isSoldOut ? 'bg-error' : 'bg-primary'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {isSoldOut ? (
                <span className="text-label-sm text-error font-bold">0 Seats Left</span>
              ) : (
                <span className="text-label-sm text-on-surface-variant">
                  {event.available_quota ?? '?'}/{event.total_quota ?? '?'} Joined
                </span>
              )}
            </div>
          </div>

          <Link to={`/events/${event.event_id}`} className="block">
            <button
              disabled={isSoldOut}
              className={`w-full py-2.5 rounded-lg font-bold text-label-md transition-all ${
                isSoldOut
                  ? 'bg-outline text-on-primary cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:opacity-90'
              }`}
            >
              {isSoldOut ? 'Full Capacity' : 'Book Seat'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}