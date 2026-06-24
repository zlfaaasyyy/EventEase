import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const userLinks = [
  { to: '/user',               icon: 'dashboard',          label: 'Dashboard',        exact: true },
  { to: '/user/registrations', icon: 'calendar_month',     label: 'My Registrations'               },
  { to: '/user/tickets',       icon: 'confirmation_number',label: 'My Tickets'                     },
  { to: '/events',             icon: 'explore',            label: 'Browse Events'                  },
  { to: '/user/feedback',      icon: 'rate_review',        label: 'Give Feedback'                  },
  { to: '/user/profile',       icon: 'manage_accounts',    label: 'Profile'                        },
]

const organizerLinks = [
  { to: '/organizer',               icon: 'dashboard',    label: 'Dashboard',    exact: true },
  { to: '/organizer/events/create', icon: 'add_circle',   label: 'Create Event'               },
  { to: '/organizer/tickets',       icon: 'local_activity',label: 'Manage Tickets'            },
  { to: '/organizer/registrations', icon: 'group',        label: 'Registrations'              },
  { to: '/organizer/reports',       icon: 'bar_chart',    label: 'Reports'                    },
  { to: '/organizer/profile',       icon: 'manage_accounts',label: 'Profile'                  },
]

const adminLinks = [
  { to: '/admin',             icon: 'dashboard',     label: 'Dashboard',           exact: true },
  { to: '/admin/events',      icon: 'event',         label: 'Events Management'                },
  { to: '/admin/users',       icon: 'group',         label: 'Manage Users'                     },
  { to: '/admin/categories',  icon: 'category',      label: 'Manage Categories'                },
  { to: '/admin/organizers',  icon: 'verified_user', label: 'Organizer Approvals'              },
  { to: '/admin/reports',     icon: 'bar_chart',     label: 'System Reports'                   },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const links =
    user?.role === 'admin'     ? adminLinks     :
    user?.role === 'organizer' ? organizerLinks :
    userLinks

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to)

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-sm px-lg py-4 border-b border-outline-variant h-16">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-on-primary text-[20px]">event</span>
        </div>
        <span className="text-title-lg font-bold text-primary">EventEase</span>
      </div>

      {/* User info */}
      <div className="px-lg py-md border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-headline-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-body-md font-bold text-on-surface truncate">{user?.name}</p>
            <span className={`text-label-sm px-sm py-0.5 rounded-full font-bold uppercase tracking-wider ${
              user?.role === 'admin'
                ? 'bg-primary-fixed text-primary'
                : user?.role === 'organizer'
                ? 'bg-secondary-fixed text-secondary'
                : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-md py-md overflow-y-auto">
        <p className="text-label-sm text-outline uppercase tracking-wider px-md mb-sm">Navigation</p>
        <ul className="space-y-xs">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-all text-body-md font-medium group ${
                  isActive(link)
                    ? 'bg-secondary-container text-on-secondary-container font-bold translate-x-0.5'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${
                  isActive(link) ? 'text-on-secondary-container' : 'text-outline group-hover:text-on-surface'
                }`}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="my-md border-t border-outline-variant" />

        <ul className="space-y-xs">
          <li>
            <Link
              to="/"
              className="flex items-center gap-md px-md py-sm rounded-lg transition-all text-body-md font-medium text-on-surface-variant hover:bg-surface-container-high group"
            >
              <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-on-surface">home</span>
              Back to Home
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center gap-md px-md py-sm rounded-lg transition-all text-body-md font-medium text-error hover:bg-error-container group"
            >
              <span className="material-symbols-outlined text-[20px] text-error">logout</span>
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}