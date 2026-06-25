import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { eventsAPI, categoriesAPI } from '../../services/api'

function extractErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
  return fallback
}

const MOCK_CATEGORIES = [
  { id: 1, category_name: 'Conference' },
  { id: 2, category_name: 'Workshop' },
  { id: 3, category_name: 'Seminar' },
  { id: 4, category_name: 'Webinar' },
  { id: 5, category_name: 'Training' },
]

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState(MOCK_CATEGORIES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tickets, setTickets] = useState([{ ticket_type: '', price: 0, quota: 0 }])
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    category_id: '',
    status: 'draft',
    banner_url: '',
  })

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => setCategories(MOCK_CATEGORIES))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleTicketChange = (index, field, value) => {
    const updated = tickets.map((t, i) => i === index ? { ...t, [field]: value } : t)
    setTickets(updated)
  }

  const addTicket = () => setTickets([...tickets, { ticket_type: '', price: 0, quota: 0 }])
  const removeTicket = (index) => setTickets(tickets.filter((_, i) => i !== index))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        description: form.description,
        location: form.location,
        category_id: form.category_id ? Number(form.category_id) : null,
        banner_url: form.banner_url || null,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : new Date(form.start_date).toISOString(),
        status: form.status,
        tickets: tickets.map((t) => ({
          ticket_type: t.ticket_type,
          price: Number(t.price) || 0,
          quota: Number(t.quota) || 0,
        })),
      }

      await eventsAPI.create(payload)
      navigate('/organizer')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create event'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-md py-md bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"

  return (
    <DashboardLayout title="Create New Event">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-xl">
        {error && (
          <div className="p-md bg-error-container text-error rounded-lg text-body-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant">
            <h2 className="text-title-lg font-bold text-on-surface">Basic Information</h2>
          </div>
          <div className="p-lg space-y-lg">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block">Event Title *</label>
              <input name="title" required placeholder="e.g., Tech Summit 2025" value={form.title} onChange={handleChange} className={inputClass} />
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block">Description *</label>
              <textarea name="description" required placeholder="Describe your event..." value={form.description} onChange={handleChange} rows={5}
                className="w-full px-md py-md bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Category *</label>
                <select name="category_id" required value={form.category_id} onChange={handleChange} className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block">Location *</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[18px]">location_on</span>
                <input name="location" required placeholder="e.g., Jakarta Convention Center" value={form.location} onChange={handleChange}
                  className="w-full pl-xl pr-md py-md bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md" />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block">Banner Image URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[18px]">image</span>
                <input name="banner_url" type="url" placeholder="https://example.com/your-event-banner.jpg" value={form.banner_url} onChange={handleChange}
                  className="w-full pl-xl pr-md py-md bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md" />
              </div>
              <p className="text-label-sm text-outline">Paste a link to an image. This appears as the event's thumbnail and banner.</p>
              {form.banner_url && (
                <div className="mt-sm rounded-lg overflow-hidden border border-outline-variant h-32 bg-surface-container-low">
                  <img
                    src={form.banner_url}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                    onLoad={(e) => { e.target.style.display = 'block' }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">Start Date *</label>
                <input name="start_date" type="date" required value={form.start_date} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant block">End Date</label>
                <input name="end_date" type="date" value={form.end_date} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-title-lg font-bold text-on-surface">Ticket Types</h2>
            <button type="button" onClick={addTicket} className="flex items-center gap-xs text-primary font-bold text-label-md hover:bg-primary-fixed px-md py-sm rounded-lg transition-all">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Ticket
            </button>
          </div>
          <div className="p-lg space-y-md">
            {tickets.map((ticket, index) => (
              <div key={index} className="p-md bg-surface-container-low rounded-lg border border-outline-variant relative">
                {tickets.length > 1 && (
                  <button type="button" onClick={() => removeTicket(index)}
                    className="absolute top-md right-md text-error hover:bg-error-container p-xs rounded transition-all">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Ticket Type</label>
                    <input placeholder="e.g., VIP Pass" value={ticket.ticket_type}
                      onChange={(e) => handleTicketChange(index, 'ticket_type', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Price (Rp)</label>
                    <input type="number" min="0" placeholder="0 for free" value={ticket.price}
                      onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))}
                      className={inputClass} />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant block">Quota</label>
                    <input type="number" min="1" placeholder="e.g., 100" value={ticket.quota}
                      onChange={(e) => handleTicketChange(index, 'quota', Number(e.target.value))}
                      className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-md justify-end">
          <button type="button" onClick={() => navigate('/organizer')}
            className="px-xl py-md border border-outline-variant text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-surface-container-high transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-xl py-md bg-primary text-on-primary rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-sm disabled:opacity-60">
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
            {form.status === 'published' ? 'Publish Event' : 'Save Draft'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}