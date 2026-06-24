import axios from 'axios'

// PENTING: semua endpoint backend (lihat app/main.py) didaftarkan dengan
// prefix "/api" (app.include_router(..., prefix="/api")). BASE_URL di sini
// HARUS menyertakan "/api" supaya semua request mengarah ke endpoint yang benar.
const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───────────────────────────────────────────────
// Backend: POST /api/login, POST /api/register (TIDAK ada prefix /auth)
export const authAPI = {
  login:    (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  // Tidak ada endpoint /auth/me di backend. Gunakan usersAPI.getMe() (-> /users/me)
  // untuk mengambil data user yang sedang login.
}

// ─── Events ─────────────────────────────────────────────
// Backend: GET /api/events (publik), GET /api/events/{id} (publik)
// Create/update/delete/publish event ada di bawah /api/organizer/events/...
export const eventsAPI = {
  getAll:        (params) => api.get('/events', { params }),
  getById:       (id)     => api.get(`/events/${id}`),
  getRecommended:(params) => api.get('/events/recommended/me', { params }),
  create:        (data)   => api.post('/organizer/events', data),
  update:        (id, d)  => api.put(`/organizer/events/${id}`, d),
  delete:        (id)     => api.delete(`/organizer/events/${id}`),
  publish:       (id)     => api.patch(`/organizer/events/${id}/publish`),
  unpublish:     (id)     => api.patch(`/organizer/events/${id}/unpublish`),
  getMyEvents:   (params) => api.get('/organizer/events', { params }),
}

// ─── Categories ─────────────────────────────────────────
export const categoriesAPI = {
  getAll:  ()       => api.get('/categories'),
  getById: (id)     => api.get(`/categories/${id}`),
  create:  (data)   => api.post('/categories', data),
  update:  (id, d)  => api.put(`/categories/${id}`, d),
  delete:  (id)     => api.delete(`/categories/${id}`),
}

// ─── Tickets ────────────────────────────────────────────
export const ticketsAPI = {
  getByEvent: (eventId)       => api.get(`/events/${eventId}/tickets`),
  create:     (eventId, data) => api.post(`/organizer/events/${eventId}/tickets`, data),
  update:     (id, data)      => api.put(`/organizer/tickets/${id}`, data),
  delete:     (id)            => api.delete(`/organizer/tickets/${id}`),
}

// ─── Registrations ──────────────────────────────────────
export const registrationsAPI = {
  register:           (data)           => api.post('/registrations', data),
  getMyRegistrations: (params)         => api.get('/registrations/me', { params }),
  getById:            (id)             => api.get(`/registrations/${id}`),
  getByEvent:         (eventId, params) => api.get(`/organizer/events/${eventId}/registrations`, { params }),
  updateStatus:       (id, data)        => api.patch(`/organizer/registrations/${id}/status`, data),
  cancel:             (id)              => api.patch(`/registrations/${id}/cancel`),
  manualRegister:     (eventId, params) => api.post(`/organizer/events/${eventId}/registrations`, null, { params }),
  getQrCode:          (id)              => api.get(`/registrations/${id}/qrcode`),
}

// ─── Payments ───────────────────────────────────────────
export const paymentsAPI = {
  pay:          (data)      => api.post('/payments', data),
  getMyPayments:(params)    => api.get('/payments/me', { params }),
  getById:      (id)        => api.get(`/payments/${id}`),
  retry:        (id)        => api.patch(`/payments/${id}/retry`),
  updateStatus: (id, data)  => api.patch(`/organizer/payments/${id}/status`, data),
}

// ─── Attendance / Check-in ──────────────────────────────
// Backend TIDAK punya /events/{id}/attendance atau /registrations/{id}/checkin.
// Yang benar ada di bawah /organizer/...
export const attendanceAPI = {
  getByEvent:    (eventId, params) => api.get(`/organizer/events/${eventId}/attendance`, { params }),
  checkIn:       (registrationId)  => api.post('/organizer/attendance/check-in', { registration_id: registrationId }),
  scanCheckIn:   (registrationId)  => api.post('/organizer/attendance/scan', { registration_id: registrationId }),
  manualCheckIn: (registrationId)  => api.patch(`/organizer/registrations/${registrationId}/check-in`),
}

// ─── Feedback ───────────────────────────────────────────
export const feedbackAPI = {
  getByEvent:           (eventId) => api.get(`/events/${eventId}/feedback`),
  getMyFeedbacks:       ()        => api.get('/feedback/me'),
  create:               (data)    => api.post('/feedback', data),
  reply:                (id, data)=> api.patch(`/organizer/feedback/${id}/reply`, data),
  getOrganizerFeedback: (params)  => api.get('/organizer/feedback', { params }),
}

// ─── Favorites ──────────────────────────────────────────
export const favoritesAPI = {
  getMine: ()         => api.get('/favorites/me'),
  add:     (eventId)  => api.post(`/favorites/${eventId}`),
  remove:  (eventId)  => api.delete(`/favorites/${eventId}`),
}

// ─── Subscription (Organizer PRO Plan) ──────────────────
export const subscriptionAPI = {
  getMine: ()       => api.get('/organizer/subscription'),
  upgrade: (data)   => api.patch('/organizer/subscription/upgrade', data),
  cancel:  ()       => api.patch('/organizer/subscription/cancel'),
}

// ─── Users/Profile ──────────────────────────────────────
export const usersAPI = {
  getMe:          ()     => api.get('/users/me'),
  updateMe:       (data) => api.put('/users/me', data),
  updatePassword: (data) => api.put('/users/me/password', data),
  deleteMe:       ()     => api.delete('/users/me'),
}

// ─── Reports ────────────────────────────────────────────
export const reportsAPI = {
  organizerSummary:        ()        => api.get('/organizer/dashboard/summary'),
  eventReport:             (eventId) => api.get(`/organizer/events/${eventId}/reports`),
  organizerMonthly:        (params)  => api.get('/organizer/reports/monthly-growth', { params }),
  adminSystem:             ()        => api.get('/admin/reports/system'),
  adminSystemExportCsv:    ()        => api.get('/admin/reports/system/export', { responseType: 'blob' }),
  adminCategoryPopularity: ()        => api.get('/admin/reports/categories-popularity'),
  adminMonthlyGrowth:      (params)  => api.get('/admin/reports/monthly-growth', { params }),
  adminTopOrganizers:      (params)  => api.get('/admin/reports/top-organizers', { params }),
  adminTopEvents:          (params)  => api.get('/admin/reports/top-events', { params }),
  exportEventRegistrationsCsv: (eventId) =>
    api.get(`/organizer/events/${eventId}/registrations/export`, { responseType: 'blob' }),
}

// ─── Admin ──────────────────────────────────────────────
export const adminAPI = {
  getUsers:              (params) => api.get('/admin/users', { params }),
  getUserById:           (id)     => api.get(`/admin/users/${id}`),
  updateUserStatus:      (id, d)  => api.patch(`/admin/users/${id}/status`, d),
  updateUserRole:        (id, d)  => api.patch(`/admin/users/${id}/role`, d),
  deleteUser:            (id)     => api.delete(`/admin/users/${id}`),
  getOrganizerApprovals: (params) => api.get('/admin/organizer-approvals', { params }),
  approveOrganizer:      (id)     => api.patch(`/admin/organizer-approvals/${id}/approve`),
  rejectOrganizer:       (id)     => api.patch(`/admin/organizer-approvals/${id}/reject`),
  getAllEvents:          (params) => api.get('/admin/events', { params }),
  updateEventStatus:     (id, d)  => api.patch(`/admin/events/${id}/status`, d),
  deleteEvent:           (id)     => api.delete(`/admin/events/${id}`),
}

export default api
