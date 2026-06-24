import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI, ticketsAPI } from '../../services/api'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

function TicketModal({ eventId, ticket, onClose, onSaved }) {
  const isEdit = !!ticket
  const [form, setForm] = useState({
    ticket_type: ticket?.ticket_type || '',
    price:       ticket?.price ?? 0,
    quota:       ticket?.quota ?? 50,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!form.ticket_type.trim()) { setError('Ticket name is required.'); return }
    if (form.quota < 1) { setError('Quota must be at least 1.'); return }
    setSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await ticketsAPI.update(ticket.id, { ticket_type: form.ticket_type, price: Number(form.price), quota: Number(form.quota) })
      } else {
        await ticketsAPI.create(eventId, { ticket_type: form.ticket_type, price: Number(form.price), quota: Number(form.quota) })
      }
      onSaved()
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to save ticket.')
      setSaving(false)
    }
  }

  const inputClass = "w-full h-11 px-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-md">
      <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant w-full max-w-md">
        <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
          <h3 className="text-title-lg font-bold text-on-surface">{isEdit ? 'Edit Ticket Type' : 'Add Ticket Type'}</h3>
          <button onClick={onClose} className="p-xs rounded-full hover:bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-lg space-y-md">
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant">Ticket Name *</label>
            <input type="text" value={form.ticket_type} onChange={e => setForm(p => ({ ...p, ticket_type: e.target.value }))} placeholder="e.g. Regular, VIP, Early Bird" className={inputClass} />
          </div>
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant">Price (IDR)</label>
            <input type="number" min={0} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0 for free" className={inputClass} />
            <p className="text-label-sm text-on-surface-variant">Set 0 for a free ticket.</p>
          </div>
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant">Quota *</label>
            <input type="number" min={1} value={form.quota} onChange={e => setForm(p => ({ ...p, quota: e.target.value }))} placeholder="Max attendees" className={inputClass} />
          </div>
          {error && <p className="text-error text-body-md flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">error</span>{error}</p>}
        </div>
        <div className="flex gap-md px-lg py-md border-t border-outline-variant">
          <button onClick={onClose} className="flex-1 py-2.5 border border-outline-variant rounded-xl text-body-md text-on-surface-variant hover:bg-surface-container-low">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-xs py-2.5 bg-primary text-on-primary rounded-xl text-body-md font-bold hover:opacity-90 disabled:opacity-50">
            {saving ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving…</> : <><span className="material-symbols-outlined text-[18px]">save</span> Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ManageTicketsPage() {
  const [events, setEvents] = useState([])
  const [tickets, setTickets] = useState({})  // eventId → []
  const [loading, setLoading] = useState(true)
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [modal, setModal] = useState(null)  // { eventId, ticket? }
  const [toast, setToast] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await eventsAPI.getMyEvents()
      setEvents(res.data)
    } catch {
      showToast('Failed to load events.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTickets = async (eventId) => {
    try {
      const res = await ticketsAPI.getByEvent(eventId)
      setTickets(prev => ({ ...prev, [eventId]: res.data }))
    } catch {
      showToast('Failed to load tickets.', 'error')
    }
  }

  const toggleEvent = async (eventId) => {
    if (expandedEvent === eventId) { setExpandedEvent(null); return }
    setExpandedEvent(eventId)
    if (!tickets[eventId]) await fetchTickets(eventId)
  }

  const handleDelete = async (ticketId, eventId) => {
    if (!window.confirm('Delete this ticket type?')) return
    setDeleting(ticketId)
    try {
      await ticketsAPI.delete(ticketId)
      showToast('Ticket deleted.', 'success')
      fetchTickets(eventId)
    } catch (e) {
      showToast(e.response?.data?.detail || 'Cannot delete ticket with existing sales.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getStatusStyle = (status) => ({
    published: 'bg-[#dcfce7] text-[#15803d]',
    draft:     'bg-surface-container-high text-on-surface-variant',
    cancelled: 'bg-[#ffdad6] text-[#ba1a1a]',
  }[status] || 'bg-surface-container-high text-on-surface-variant')

  return (
    <DashboardLayout title="Manage Tickets">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-sm px-md py-sm rounded-xl shadow-lg border-l-4 text-body-md font-medium ${
          toast.type === 'success' ? 'bg-white border-[#15803d] text-[#15803d]' : 'bg-white border-error text-error'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}
      {modal && (
        <TicketModal
          eventId={modal.eventId}
          ticket={modal.ticket}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchTickets(modal.eventId); showToast('Ticket saved!', 'success') }}
        />
      )}

      <div className="mb-lg">
        <h1 className="text-headline-md font-bold text-on-surface">Manage Tickets</h1>
        <p className="text-body-md text-on-surface-variant">Configure ticket types and quotas for your events.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading your events...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-xl bg-surface-container-lowest rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-[48px] text-outline mb-sm block">event_busy</span>
          <p className="text-body-lg font-semibold text-on-surface mb-sm">No events yet</p>
          <p className="text-body-md text-on-surface-variant">Create your first event to start managing tickets.</p>
        </div>
      ) : (
        <div className="space-y-md">
          {events.map(event => (
            <div key={event.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
              {/* Event row */}
              <button
                onClick={() => toggleEvent(event.id)}
                className="w-full flex items-center gap-md p-lg hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">event</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm flex-wrap">
                    <span className="text-body-md font-semibold text-on-surface truncate">{event.title}</span>
                    <span className={`text-label-sm font-bold px-2 py-0.5 rounded-full capitalize ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-md text-label-md text-on-surface-variant mt-xs">
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {event.start_date ? new Date(event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                    <span className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">local_activity</span>
                      {tickets[event.id]?.length ?? '—'} ticket type{tickets[event.id]?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${expandedEvent === event.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Tickets list */}
              {expandedEvent === event.id && (
                <div className="border-t border-outline-variant px-lg pb-lg">
                  <div className="flex items-center justify-between py-md">
                    <p className="text-label-md font-semibold text-on-surface-variant uppercase tracking-wider">Ticket Types</p>
                    <button
                      onClick={() => setModal({ eventId: event.id })}
                      className="flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-lg text-label-md font-medium hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add Ticket
                    </button>
                  </div>
                  {!tickets[event.id] ? (
                    <div className="flex items-center gap-sm text-on-surface-variant py-md">
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Loading...
                    </div>
                  ) : tickets[event.id].length === 0 ? (
                    <div className="text-center py-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px] text-outline block mb-sm">local_activity</span>
                      No ticket types yet. Add your first one.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-outline-variant">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low">
                          <tr>
                            {['Ticket Type', 'Price', 'Quota', 'Sold', 'Available', 'Actions'].map(h => (
                              <th key={h} className="px-md py-3 text-label-sm uppercase tracking-wider text-on-surface-variant">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {tickets[event.id].map(t => {
                            const available = t.quota - t.sold
                            const soldPct = Math.round((t.sold / t.quota) * 100)
                            return (
                              <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                                <td className="px-md py-3">
                                  <span className="text-body-md font-semibold text-on-surface">{t.ticket_type}</span>
                                </td>
                                <td className="px-md py-3 text-body-md text-on-surface">
                                  {t.price === 0 ? <span className="text-[#15803d] font-bold">Free</span> : formatRupiah(t.price)}
                                </td>
                                <td className="px-md py-3 text-body-md text-on-surface">{t.quota}</td>
                                <td className="px-md py-3">
                                  <div className="flex items-center gap-sm">
                                    <span className="text-body-md text-on-surface">{t.sold}</span>
                                    <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${soldPct > 80 ? 'bg-error' : soldPct > 50 ? 'bg-tertiary' : 'bg-[#15803d]'}`} style={{ width: `${soldPct}%` }} />
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant">{soldPct}%</span>
                                  </div>
                                </td>
                                <td className="px-md py-3">
                                  <span className={`text-body-md font-semibold ${available === 0 ? 'text-error' : available < 10 ? 'text-tertiary' : 'text-[#15803d]'}`}>
                                    {available}
                                  </span>
                                </td>
                                <td className="px-md py-3">
                                  <div className="flex items-center gap-xs">
                                    <button
                                      onClick={() => setModal({ eventId: event.id, ticket: t })}
                                      className="p-xs rounded-lg text-primary hover:bg-primary-fixed transition-colors"
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(t.id, event.id)}
                                      disabled={deleting === t.id || t.sold > 0}
                                      className="p-xs rounded-lg text-error hover:bg-error-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                      title={t.sold > 0 ? 'Cannot delete: has sales' : 'Delete'}
                                    >
                                      <span className="material-symbols-outlined text-[18px]">
                                        {deleting === t.id ? 'progress_activity' : 'delete'}
                                      </span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}