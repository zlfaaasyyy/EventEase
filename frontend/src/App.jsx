import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventDetailPage from './pages/EventDetailPage'
import BrowseEventsPage from './pages/BrowseEventsPage'

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreateEventPage from './pages/organizer/CreateEventPage'
import ManageAttendancePage from './pages/organizer/ManageAttendancePage'
import EventFeedbackPage from './pages/organizer/EventFeedbackPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import ManageCategoriesPage from './pages/admin/ManageCategoriesPage'
import OrganizerApprovalsPage from './pages/admin/OrganizerApprovalsPage'
import SystemReportsPage from './pages/admin/SystemReportsPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/events" element={<BrowseEventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />

      {/* Organizer */}
      <Route path="/organizer" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/organizer/events/create" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <CreateEventPage />
        </ProtectedRoute>
      } />
      <Route path="/organizer/events/:id/attendance" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <ManageAttendancePage />
        </ProtectedRoute>
      } />
      <Route path="/organizer/events/:id/feedback" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <EventFeedbackPage />
        </ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageUsersPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <ManageCategoriesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/organizers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <OrganizerApprovalsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <SystemReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminEventsPage />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}