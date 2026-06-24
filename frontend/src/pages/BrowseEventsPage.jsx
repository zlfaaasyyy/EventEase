import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import EventCard from '../components/events/EventCard'
import { eventsAPI } from '../services/api'

const CATEGORIES = ['All', 'Seminar', 'Workshop', 'Conference', 'Webinar', 'Training']
const MOCK_EVENTS = [
  { event_id: 1, title: 'Tech Summit 2025', organizer_name: 'TechOrg Indonesia', start_date: '2025-05-20', end_date: '2025-05-22', location: 'Jakarta', category_name: 'Conference', min_price: 300000, available_quota: 55, total_quota: 100 },
  { event_id: 2, title: 'UI/UX Workshop', organizer_name: 'Creative Studio', start_date: '2025-06-15', location: 'Makassar', category_name: 'Workshop', min_price: 75000, available_quota: 32, total_quota: 50 },
  { event_id: 3, title: 'Python Bootcamp', organizer_name: 'CodeCamp ID', start_date: '2025-07-01', end_date: '2025-07-07', location: 'Bandung', category_name: 'Training', min_price: 150000, available_quota: 0, total_quota: 30 },
  { event_id: 4, title: 'Digital Marketing Seminar', organizer_name: 'DigiMark ID', start_date: '2025-06-20', location: 'Surabaya', category_name: 'Seminar', min_price: 0, available_quota: 80, total_quota: 100 },
  { event_id: 5, title: 'Cloud Computing Webinar', organizer_name: 'CloudTech', start_date: '2025-07-10', location: 'Online', category_name: 'Webinar', min_price: 50000, available_quota: 200, total_quota: 500 },
  { event_id: 6, title: 'Data Science Conference', organizer_name: 'DataCo', start_date: '2025-08-01', end_date: '2025-08-02', location: 'Jakarta', category_name: 'Conference', min_price: 500000, available_quota: 15, total_quota: 200 },
]

export default function BrowseEventsPage() {
  const [searchParams] = useSearchParams()
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState('date')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [activeCategory])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = {}
      if (activeCategory !== 'All') params.category = activeCategory
      if (search) params.q = search
      const res = await eventsAPI.getAll(params)
      setEvents(res.data)
    } catch {
      // use mock data if API not available
      setEvents(MOCK_EVENTS)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((e) => {
    const matchCat = activeCategory === 'All' || e.category_name === activeCategory
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-16 flex-1">
        {/* Page header */}
        <div className="bg-surface border-b border-outline-variant py-xl px-lg">
          <div className="container mx-auto">
            <h1 className="text-headline-lg text-on-surface mb-sm">Browse Events</h1>
            <p className="text-body-md text-on-surface-variant">Discover amazing events happening near you</p>

            {/* Search + sort row */}
            <div className="flex flex-col md:flex-row gap-md mt-lg items-center">
              <div className="relative flex-1 max-w-lg">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchEvents()}
                />
              </div>
              <select
                className="px-md py-2.5 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="popularity">Sort by Popularity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="bg-surface-container-low border-b border-outline-variant/30 py-md px-lg">
          <div className="container mx-auto">
            <div className="flex gap-md overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-lg py-1.5 rounded-full font-bold text-label-md transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-on-primary'
                      : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events grid */}
        <div className="container mx-auto px-lg py-xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-outline-variant/30 h-80 animate-pulse">
                  <div className="h-48 bg-surface-container-high rounded-t-xl" />
                  <div className="p-lg space-y-sm">
                    <div className="h-4 bg-surface-container-high rounded w-3/4" />
                    <div className="h-3 bg-surface-container-high rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-[64px] text-outline">search_off</span>
              <p className="text-headline-sm text-on-surface-variant mt-md">No events found</p>
              <p className="text-body-md text-outline mt-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <p className="text-body-md text-on-surface-variant mb-lg">
                Showing <span className="font-bold text-on-surface">{filteredEvents.length}</span> events
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}