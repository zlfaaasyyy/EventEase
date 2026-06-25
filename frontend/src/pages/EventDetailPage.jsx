import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { eventsAPI, ticketsAPI, registrationsAPI, feedbackAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const MOCK_EVENT = {
  event_id: 1,
  title: 'Tech Summit 2025',
  description: 'Tech Summit 2025 is Indonesia\'s premier gathering for technopreneurs, developers, and industry leaders. Over three intensive days, we will explore the frontiers of Artificial Intelligence, Blockchain, and Sustainable Tech.\n\nJoin over 2,000 attendees for keynote sessions from global tech giants, hands-on workshops, and unparalleled networking opportunities. Whether you\'re a startup founder or a senior engineer, this summit offers the insights you need to navigate the rapidly evolving digital landscape.',
  start_date: '2025-05-20',
  end_date: '2025-05-22',
  location: 'Jakarta Convention Center',
  category_name: 'Conference',
  organizer_name: 'TechOrg Indonesia',
  status: 'published',
  tickets: [
    { ticket_id: 1, ticket_type: 'VIP Pass', price: 300000, quota: 50, sold: 45, description: 'Lunch + Private Lounge + Certificate' },
    { ticket_id: 2, ticket_type: 'Regular Pass', price: 150000, quota: 100, sold: 100, description: 'Main Hall Access + Expo Only' },
  ],
  feedback: [
    { feedback_id: 1, user_name: 'Andi Pratama', rating: 4, comment: 'Great event! The speaker sessions were very insightful and the venue is amazing. Highly recommend for any dev looking to grow their network.', created_at: '2025-05-20', reply: { replier_name: 'TechOrg Indonesia', content: 'Thank you Andi! See you there. We are glad you enjoyed the networking sessions.', replied_at: '2025-05-21' } },
  ],
  avg_rating: 4.5,
  total_reviews: 24,
}

function StarRating({ rating, max = 5, size = 18, filled = false }) {
  return (
    <div className="flex" style={{ color: '#F59E0B' }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="material-symbols-outlined" style={{ fontSize: size, fontVariationSettings: i < Math.floor(rating) ? "'FILL' 1" : i < rating ? "'FILL' 0.5" : "'FILL' 0'" }}>
          star
        </span>
      ))}
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(MOCK_EVENT)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
  setLoading(true)

  try {
    const res = await eventsAPI.getById(id)

    let tickets = []
    let feedback = []

    try {
      const ticketsRes = await ticketsAPI.getByEvent(id)
      tickets = ticketsRes.data || []
    } catch (err) {
      console.error('Failed loading tickets:', err)
    }

    try {
      const feedbackRes = await feedbackAPI.getByEvent(id)
      feedback = feedbackRes.data || []
    } catch (err) {
      console.error('Failed loading feedback:', err)
    }

    setEvent({
      ...res.data,
      tickets,
      feedback,
    })
  } catch (err) {
    console.error('Failed loading event:', err)

    setEvent({
      title: 'Event Not Found',
      description: 'The requested event could not be loaded.',
      tickets: [],
      feedback: [],
    })
  } finally {
    setLoading(false)
  }
}

  // const handleRegister = async () => {
  //   if (!user) { window.location.href = '/login'; return }
  //   if (!selectedTicket) { alert('Please select a ticket first'); return }
  //   try {
  //     await registrationsAPI.register({ event_id: id, ticket_id: selectedTicket.ticket_id })
  //     alert('Registration successful! Check your bookings.')
  //   } catch (e) {
  //     alert(e.response?.data?.detail || 'Registration failed.')
  //   }
  // }

const handleRegister = async () => {
  if (!user) {
    window.location.href = '/login'
    return
  }

  if (!selectedTicket) {
    alert('Please select a ticket first')
    return
  }

  try {
    const payload = {
      event_id: Number(id),
      ticket_id: Number(selectedTicket.id),
    }

    const res = await registrationsAPI.register(payload)

    const registrationId = res.data.id

    window.location.href = `/user/payment/${registrationId}`

  } catch (e) {
    console.error(e.response?.data)

    alert(
      e.response?.data?.detail ||
      'Registration failed'
    )
  }
}

  const total = selectedTicket ? selectedTicket.price : 0
  const available = selectedTicket ? selectedTicket.quota - selectedTicket.sold : null

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-16 flex-1">
        {/* ─── Hero Banner ─── */}
        <section className="relative h-[400px] w-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-surface-container to-secondary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[120px] text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-lg w-full">
            <div className="max-w-[1280px] mx-auto px-lg">
              <div className="flex flex-wrap gap-sm mb-md">
                <span className="px-md py-1 bg-primary-container text-on-primary-container text-label-md rounded-full shadow-lg">
                  {event.category_name}
                </span>
                <span className="px-md py-1 bg-surface-container-highest text-primary text-label-md rounded-full shadow-lg border border-primary-container capitalize">
                  {event.status}
                </span>
              </div>
              <h1 className="text-display-lg text-white mb-xs">{event.title}</h1>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center text-primary font-bold">
                  {event.organizer_name?.charAt(0)}
                </div>
                <p className="text-title-lg text-white/90">
                  Organized by <span className="font-bold text-white">{event.organizer_name}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Content ─── */}
        <div className="max-w-[1280px] mx-auto px-lg py-xl">
          {/* Info Row Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md bg-surface border border-outline-variant p-lg rounded-xl shadow-sm mb-xl">
            <div className="flex items-center gap-md border-b md:border-b-0 md:border-r border-outline-variant pb-md md:pb-0">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase">Date</p>
                <p className="text-body-lg font-semibold">
                  {new Date(event.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {event.end_date && event.end_date !== event.start_date && ` – ${new Date(event.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-md border-b md:border-b-0 md:border-r border-outline-variant pb-md md:pb-0">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase">Venue</p>
                <p className="text-body-lg font-semibold">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              </div>
              <div>
                <p className="text-label-sm text-outline uppercase">Time</p>
                <p className="text-body-lg font-semibold">09:00 – 17:00 WIB</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-xl">
            {/* ─── Left Column ─── */}
            <div className="lg:w-2/3 space-y-xl">
              {/* Description */}
              <section className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm">
                <h2 className="text-headline-sm mb-md">About the Event</h2>
                <div className="text-body-lg text-on-surface-variant leading-relaxed space-y-md">
                  {event.description?.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </section>

              {/* Ticket Types Table */}
              {event.tickets?.length > 0 && (
                <section className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                  <div className="p-lg border-b border-outline-variant">
                    <h2 className="text-headline-sm">Ticket Types</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="px-lg py-md text-label-sm text-outline uppercase">Ticket Class</th>
                          <th className="px-lg py-md text-label-sm text-outline uppercase">Price</th>
                          <th className="px-lg py-md text-label-sm text-outline uppercase">Quota</th>
                          <th className="px-lg py-md text-label-sm text-outline uppercase">Availability</th>
                          <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {event.tickets.map((ticket) => {
                          const remaining = ticket.quota - ticket.sold
                          const isSoldOut = remaining <= 0
                          const isSelected = selectedTicket?.ticket_id === ticket.ticket_id

                          return (
                            <tr key={ticket.ticket_id} className={`hover:bg-surface-container-low transition-colors ${isSoldOut ? 'opacity-60' : ''}`}>
                              <td className="px-lg py-lg">
                                <p className={`text-body-lg font-bold ${isSoldOut ? 'text-outline' : ''}`}>{ticket.ticket_type}</p>
                                {ticket.description && <p className="text-label-md text-outline">{ticket.description}</p>}
                              </td>
                              <td className="px-lg py-lg font-semibold text-primary">
                                {ticket.price === 0 ? 'Free' : `Rp${Number(ticket.price).toLocaleString('id-ID')}`}
                              </td>
                              <td className="px-lg py-lg text-on-surface-variant">{ticket.quota}</td>
                              <td className="px-lg py-lg">
                                {isSoldOut ? (
                                  <span className="px-sm py-1 bg-error-container text-error text-label-sm rounded-full">Sold Out</span>
                                ) : remaining <= 10 ? (
                                  <span className="px-sm py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm rounded-full">{remaining} Remaining</span>
                                ) : (
                                  <span className="px-sm py-1 bg-primary-fixed text-primary text-label-sm rounded-full">{remaining} Available</span>
                                )}
                              </td>
                              <td className="px-lg py-lg text-right">
                                <button
                                  disabled={isSoldOut}
                                  onClick={() => !isSoldOut && setSelectedTicket(ticket)}
                                  className={`px-md py-2 text-label-md font-bold rounded-lg active:scale-95 transition-all ${
                                    isSoldOut
                                      ? 'bg-outline-variant text-outline cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-primary-fixed text-primary border-2 border-primary'
                                      : 'bg-primary text-on-primary hover:opacity-90'
                                  }`}
                                >
                                  {isSelected ? 'Selected ✓' : 'Select'}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Reviews */}
              <section className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center justify-between mb-xl">
                  <h2 className="text-headline-sm">Reviews &amp; Feedback</h2>
                  <div className="flex items-center gap-sm">
                    <StarRating rating={event.avg_rating || 0} />
                    <p className="text-body-md font-bold">
                      {event.avg_rating || '—'} <span className="text-outline font-medium">({event.total_reviews || 0} Reviews)</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-md">
                  {(event.feedback || []).map((fb) => (
                    <div key={fb.feedback_id} className="p-lg bg-surface-container-low rounded-xl">
                      <div className="flex items-center justify-between mb-sm">
                        <div className="flex items-center gap-md">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                            {fb.user_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-body-md font-bold">{fb.user_name}</p>
                            <p className="text-label-sm text-outline">{new Date(fb.created_at).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        <StarRating rating={fb.rating} size={16} />
                      </div>
                      <p className="text-body-md text-on-surface mb-md">{fb.comment}</p>

                      {fb.reply && (
                        <div className="ml-lg pl-lg border-l-4 border-primary-container bg-surface p-md rounded-r-lg">
                          <div className="flex items-center gap-sm mb-xs">
                            <span className="material-symbols-outlined text-primary text-[16px]">reply</span>
                            <p className="text-label-sm font-bold text-primary">{fb.reply.replier_name}</p>
                            <span className="text-label-sm text-outline">• {new Date(fb.reply.replied_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p className="text-body-md text-on-surface-variant">{fb.reply.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-lg py-md text-label-md font-bold text-primary hover:bg-surface-container-high rounded-lg border border-primary transition-all">
                  Show All Reviews
                </button>
              </section>
            </div>

            {/* ─── Right Column (Sticky) ─── */}
            <div className="lg:w-1/3">
              <div className="sticky top-24 space-y-lg">
                {/* Registration Card */}
                <div className="bg-surface p-lg rounded-xl border border-outline-variant shadow-lg">
                  <h3 className="text-title-lg mb-md">Registration</h3>
                  <div className="space-y-md mb-lg">
                    {selectedTicket ? (
                      <div className="flex items-center justify-between p-md border border-primary-container bg-primary-fixed/20 rounded-lg">
                        <div>
                          <p className="text-label-sm text-primary font-bold uppercase">Selected Ticket</p>
                          <p className="text-body-lg font-bold">{selectedTicket.ticket_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-label-sm text-outline">Qty</p>
                          <p className="text-body-lg font-bold">1</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-md bg-surface-container-low rounded-lg text-center">
                        <p className="text-body-md text-on-surface-variant">Select a ticket type above to proceed</p>
                      </div>
                    )}

                    <div className="space-y-sm">
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Subtotal</span>
                        <span className="font-semibold">{total ? `Rp${total.toLocaleString('id-ID')}` : '-'}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="text-on-surface-variant">Service Fee</span>
                        <span className="font-semibold text-tertiary">Free</span>
                      </div>
                      <div className="pt-sm border-t border-outline-variant flex justify-between items-center">
                        <span className="text-title-lg">Total</span>
                        <span className="text-headline-sm text-primary font-bold">{total ? `Rp${total.toLocaleString('id-ID')}` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={!selectedTicket}
                    className="w-full py-md bg-primary text-on-primary text-title-lg font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Register Now
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <p className="mt-md text-label-sm text-center text-outline">Limited availability. Ticket price includes tax.</p>
                </div>

                {/* Info note */}
                <div className="bg-secondary-container/10 p-md rounded-xl border border-secondary-container/20">
                  <div className="flex items-start gap-md">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <div>
                      <p className="text-label-md font-bold text-secondary mb-xs">Important Note</p>
                      <p className="text-body-md text-on-surface-variant">
                        Your registration will be confirmed via email. Make sure to complete payment within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}