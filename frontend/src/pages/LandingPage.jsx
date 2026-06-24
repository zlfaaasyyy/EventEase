import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import EventCard from '../components/events/EventCard'
import { eventsAPI, categoriesAPI } from '../services/api'

const MOCK_EVENTS = [
  {
    event_id: 1,
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
    event_id: 2,
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
    event_id: 3,
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
        {/* ─── Hero ─── */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-xl">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-surface to-secondary/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          <div className="container mx-auto px-lg relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div className="space-y-xl">
              <h1 className="text-display-lg text-on-background tracking-tight leading-[60px]">
                Discover &amp; Join{' '}
                <span className="text-primary">Amazing Events</span>
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-lg">
                Find events near you — seminars, workshops, conferences &amp; more. Join thousands of attendees and experts in your field.
              </p>

              {/* Search box */}
              <div className="glass-effect p-md rounded-xl shadow-lg border border-white/20 max-w-xl">
                <div className="flex flex-col md:flex-row gap-md">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">event_note</span>
                    <input
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-body-md"
                      placeholder="Event name or keyword"
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-[20px]">location_on</span>
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-body-md appearance-none"
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
                    className="bg-primary text-on-primary px-xl py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-sm"
                  >
                    <span className="material-symbols-outlined">search</span> Search
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex gap-md pt-md">
                <Link to="/events">
                  <button className="bg-primary-container text-on-primary-container px-xl py-3 rounded-lg font-bold text-label-md hover:shadow-md transition-all">
                    Browse Events
                  </button>
                </Link>
                <Link to="/register">
                  <button className="border-2 border-secondary text-secondary px-xl py-3 rounded-lg font-bold text-label-md hover:bg-secondary-container/10 transition-all">
                    Create Event
                  </button>
                </Link>
              </div>
            </div>

            {/* Decorative right panel */}
            <div className="hidden lg:flex justify-end relative">
              <div className="w-80 h-96 bg-secondary-container rounded-3xl rotate-6 absolute -z-10 translate-x-4 translate-y-4 opacity-20" />
              <div className="w-80 h-[450px] bg-gradient-to-br from-primary-fixed to-secondary-fixed rounded-3xl shadow-xl border-4 border-white rotate-3 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  event
                </span>
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
              <EventCard key={event.event_id} event={event} />
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