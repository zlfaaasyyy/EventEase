import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/events?q=${encodeURIComponent(search.trim())}`)
    }
  }

  const isActive = (path) => location.pathname === path

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'organizer') return '/organizer'
    if (user?.role === 'user') return '/my-registrations'
    return '/'
  }

  return (
    <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Left: Logo + Nav links */}
      <div className="flex items-center gap-xl">
        <Link to="/" className="text-headline-md font-bold text-primary">
          EventEase
        </Link>
        <div className="hidden md:flex gap-lg">
          <Link
            to="/"
            className={`text-body-md py-2 transition-colors duration-200 font-medium ${
              isActive('/') 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container-high px-2 rounded'
            }`}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={`text-body-md py-2 transition-colors duration-200 font-medium ${
              isActive('/events') 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-on-surface-variant hover:bg-surface-container-high px-2 rounded'
            }`}
          >
            Events
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              className={`text-body-md py-2 transition-colors duration-200 font-medium ${
                location.pathname.startsWith('/admin') || location.pathname.startsWith('/organizer') || location.pathname.startsWith('/my-registrations')
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-high px-2 rounded'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* Right: Search + Auth */}
      <div className="flex items-center gap-md">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            className="pl-10 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-low text-body-md focus:ring-2 focus:ring-primary focus:outline-none w-64 transition-all"
            placeholder="Search events..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Notification bell */}
        <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all text-[22px]">
          notifications
        </button>

        {user ? (
          <div className="flex items-center gap-sm">
            <div className="flex items-center gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-body-md font-medium text-on-surface">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-on-surface-variant font-medium text-label-md px-md py-2 hover:bg-surface-container-high transition-colors rounded-lg"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-on-surface-variant font-medium text-label-md px-md py-2 hover:bg-surface-container-high transition-colors rounded-lg"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary-container text-on-primary-container font-bold text-label-md px-lg py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}