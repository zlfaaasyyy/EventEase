import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import EventCard from '../components/events/EventCard'

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Tech Summit 2025',
    organizer_name: 'TechOrg Indonesia',
    start_date: '2025-05-20',
    end_date: '2025-05-22',
    location: 'Jakarta',
    category_name: 'Conference',
    min_price: 300000,
    available_quota: 55,
    total_quota: 100,
  },
  {
    id: 2,
    title: 'UI/UX Workshop',
    organizer_name: 'TechOrg Indonesia',
    start_date: '2025-06-15',
    location: 'Makassar',
    category_name: 'Workshop',
    min_price: 75000,
    available_quota: 32,
    total_quota: 50,
  },
  {
    id: 3,
    title: 'Python Bootcamp',
    organizer_name: 'TechOrg Indonesia',
    start_date: '2025-07-01',
    end_date: '2025-07-07',
    location: 'Bandung',
    category_name: 'Training',
    min_price: 150000,
    available_quota: 0,
    total_quota: 30,
  },
]

const CATEGORIES = ['All', 'Seminar', 'Workshop', 'Conference', 'Webinar', 'Training']

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (keyword) params.set('q', keyword)
    if (location) params.set('location', location)
    navigate(`/events?${params.toString()}`)
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-16 flex-1">

        {/* ═══════════════════════════════════════════════
            HERO — dark background + foto blend seperti Figma
        ═══════════════════════════════════════════════ */}
        <section className="relative min-h-[580px] flex items-center overflow-hidden">

          {/* ── Foto PENUH sebagai background ── */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-photo.png"
              alt="Event networking"
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay biru HANYA di sisi kiri untuk teks — kanan foto asli */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, #00174b 0%, #001f6b 25%, rgba(0,31,107,0.6) 45%, rgba(0,23,75,0.1) 65%, transparent 100%)',
              }}
            />
          </div>

          {/* Bar chart dekorasi pojok kanan bawah */}
          <svg
            className="absolute right-8 bottom-8 z-10 opacity-50"
            width="140" height="90"
            viewBox="0 0 140 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0"   y="45" width="16" height="45" rx="3" fill="white" opacity="0.4" />
            <rect x="22"  y="22" width="16" height="68" rx="3" fill="white" opacity="0.5" />
            <rect x="44"  y="34" width="16" height="56" rx="3" fill="white" opacity="0.4" />
            <rect x="66"  y="7"  width="16" height="83" rx="3" fill="white" opacity="0.6" />
            <rect x="88"  y="28" width="16" height="62" rx="3" fill="white" opacity="0.4" />
            <rect x="110" y="16" width="16" height="74" rx="3" fill="white" opacity="0.5" />
          </svg>

          {/* ── Konten teks ── */}
          <div className="container mx-auto px-lg relative z-10 py-xl">
            <div className="max-w-lg space-y-xl">
              <h1
                className="text-display-lg leading-[60px] font-bold"
                style={{ color: '#ffffff' }}
              >
                Discover &amp; Join{' '}
                <span style={{ color: '#60a5fa' }}>Amazing Events</span>
              </h1>

              <p className="text-body-lg" style={{ color: '#bfdbfe' }}>
                Find events near you — seminars, workshops, conferences &amp; more.{' '}
                Join thousands of attendees and experts in your field.
              </p>

              {/* Search box */}
              <div
                className="p-md rounded-xl shadow-2xl max-w-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
              >
                <div className="flex flex-col md:flex-row gap-md">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                      event_note
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-body-md text-on-surface placeholder-outline"
                      placeholder="Event name or keyword"
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                      location_on
                    </span>
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-body-md text-on-surface appearance-none cursor-pointer"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">Select Location</option>
                      <option>Jakarta</option>
                      <option>Bandung</option>
                      <option>Makassar</option>
                      <option>Surabaya</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-primary text-on-primary px-xl py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[20px]">search</span>
                    Search
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-md">
                <Link to="/events">
                  <button className="bg-primary text-on-primary px-xl py-3 rounded-lg font-bold text-label-md hover:opacity-90 active:scale-95 transition-all shadow-md">
                    Browse Events
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    className="px-xl py-3 rounded-lg font-bold text-label-md active:scale-95 transition-all"
                    style={{
                      border: '2px solid rgba(255,255,255,0.5)',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Create Event
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Category Filters ─── */}
        <section className="py-xl bg-surface-container-low border-y border-outline-variant/30">
          <div className="container mx-auto px-lg">
            <div className="flex items-center gap-md overflow-x-auto pb-4 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-xl py-2 rounded-full font-bold text-label-md transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-on-primary'
                      : 'bg-white border border-outline-variant text-on-surface-variant font-medium hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Featured Events Grid ─── */}
        <section className="py-xl container mx-auto px-lg">
          <div className="flex justify-between items-end mb-xl">
            <div>
              <h2 className="text-headline-lg text-on-surface">Featured Events</h2>
              <p className="text-body-md text-on-surface-variant">Top-rated events handpicked for your professional growth.</p>
            </div>
            <Link to="/events" className="text-primary font-bold text-label-md flex items-center gap-xs group">
              View All <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* ─── Statistics Bar ─── */}
        <section className="bg-primary-container text-on-primary-container py-xl">
          <div className="container mx-auto px-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl text-center">
              <div className="space-y-xs">
                <p className="text-display-lg">500+</p>
                <p className="text-body-md uppercase tracking-widest opacity-80">Total Events Hosted</p>
              </div>
              <div className="space-y-xs border-y md:border-y-0 md:border-x border-on-primary-container/20 py-lg md:py-0">
                <p className="text-display-lg">12,000+</p>
                <p className="text-body-md uppercase tracking-widest opacity-80">Registered Users</p>
              </div>
              <div className="space-y-xs">
                <p className="text-display-lg">30+</p>
                <p className="text-body-md uppercase tracking-widest opacity-80">Cities Covered</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}