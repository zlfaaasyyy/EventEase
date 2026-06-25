import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventDetailPage from './pages/EventDetailPage'
import BrowseEventsPage from './pages/BrowseEventsPage'

// User (regular user) pages
import MyTicketsPage from './pages/user/MyTicketsPage'
import MyRegistrationsPage from './pages/user/MyRegistrationsPage'
import PaymentHistoryPage from './pages/user/PaymentHistoryPage'
import PaymentPage from './pages/user/PaymentPage'
import UserProfilePage from './pages/user/UserProfilePage'
import GiveFeedbackPage from './pages/user/GiveFeedbackPage'

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import CreateEventPage from './pages/organizer/CreateEventPage'
import ManageTicketsPage from './pages/organizer/ManageTicketsPage'
import RegistrationsListPage from './pages/organizer/RegistrationsListPage'
import ManageAttendancePage from './pages/organizer/ManageAttendancePage'
import EventFeedbackPage from './pages/organizer/EventFeedbackPage'
import OrganizerReportsPage from './pages/organizer/OrganizerReportsPage'
import OrganizerProfilePage from './pages/organizer/OrganizerProfilePage'

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

      {/* Regular User (role: "user") -- paths match Sidebar.jsx's userLinks */}
      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['user']}>
          <MyRegistrationsPage />
        </ProtectedRoute>
      } />
      <Route path="/user/registrations" element={
        <ProtectedRoute allowedRoles={['user']}>
          <MyRegistrationsPage />
        </ProtectedRoute>
      } />
      <Route path="/user/tickets" element={
        <ProtectedRoute allowedRoles={['user']}>
          <MyTicketsPage />
        </ProtectedRoute>
      } />
      <Route path="/user/payments" element={
        <ProtectedRoute allowedRoles={['user']}>
          <PaymentHistoryPage />
        </ProtectedRoute>
      } />
      <Route path="/user/feedback" element={
        <ProtectedRoute allowedRoles={['user']}>
          <GiveFeedbackPage />
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/user/payment/:registrationId" element={
        <ProtectedRoute allowedRoles={['user']}>
          <PaymentPage />
        </ProtectedRoute>
      } />

      {/* Organizer -- paths match Sidebar.jsx's organizerLinks */}
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
      <Route path="/organizer/tickets" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <ManageTicketsPage />
        </ProtectedRoute>
      } />
      <Route path="/organizer/registrations" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <RegistrationsListPage />
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
      <Route path="/organizer/reports" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <OrganizerReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/organizer/profile" element={
        <ProtectedRoute allowedRoles={['organizer']}>
          <OrganizerProfilePage />
        </ProtectedRoute>
      } />

      {/* Admin -- paths match Sidebar.jsx's adminLinks */}
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