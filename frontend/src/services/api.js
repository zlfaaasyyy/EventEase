import axios from 'axios'

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
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  me:       ()     => api.get('/users/me'),
}

// ─── Events ─────────────────────────────────────────────
export const eventsAPI = {
  getAll:     (params) => api.get('/events', { params }),
  getById:    (id)     => api.get(`/events/${id}`),
  getRecommended: ()   => api.get('/events/recommended/me'),
  create:     (data)   => api.post('/organizer/events', data),
  update:     (id, d)  => api.put(`/organizer/events/${id}`, d),
  delete:     (id)     => api.delete(`/organizer/events/${id}`),
  publish:    (id)     => api.patch(`/organizer/events/${id}/publish`),
  unpublish:  (id)     => api.patch(`/organizer/events/${id}/unpublish`),
  getMyEvents:()       => api.get('/organizer/events'),
}

// ─── Categories ─────────────────────────────────────────
export const categoriesAPI = {
  getAll:  ()       => api.get('/categories'),
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
  register:          (data) => api.post('/registrations', data),
  getMyRegistrations:()     => api.get('/registrations/me'),
  getByEvent:        (eventId, params) => api.get(`/organizer/events/${eventId}/registrations`, { params }),
  updateStatus:      (id, data)        => api.patch(`/organizer/registrations/${id}/status`, data),
  cancel:            (id)              => api.patch(`/registrations/${id}/cancel`),
}

// ─── Payments ───────────────────────────────────────────
export const paymentsAPI = {
  pay:        (data)       => api.post('/payments', data),
  getMyPayments: (params)  => api.get('/payments/me', { params }),
  getById:    (id)         => api.get(`/payments/${id}`),
  retry:      (id)         => api.patch(`/payments/${id}/retry`),
  updateStatus: (id, data) => api.patch(`/organizer/payments/${id}/status`, data),
}

// ─── Attendance ─────────────────────────────────────────
export const attendanceAPI = {
  getByEvent: (eventId)         => api.get(`/organizer/events/${eventId}/attendance`),
  checkIn:    (registrationId)  => api.patch(`/organizer/registrations/${registrationId}/check-in`),
  scan:       (data)            => api.post('/organizer/attendance/scan', data),
}

// ─── Feedback ───────────────────────────────────────────
export const feedbackAPI = {
  getByEvent: (eventId) => api.get(`/events/${eventId}/feedback`),
  getMyFeedbacks: ()    => api.get('/feedback/me'),
  create:   (data)      => api.post('/feedback', data),
  reply:    (id, data)  => api.patch(`/organizer/feedback/${id}/reply`, data),
  getOrganizerFeedback: (params) => api.get('/organizer/feedback', { params }),
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
  organizerSummary:     ()        => api.get('/organizer/dashboard/summary'),
  eventReport:          (eventId) => api.get(`/organizer/events/${eventId}/reports`),
  organizerMonthly:     ()        => api.get('/organizer/reports/monthly-growth'),
  adminSystem:          ()        => api.get('/admin/reports/system'),
  adminCategoryPopularity: ()     => api.get('/admin/reports/categories-popularity'),
  adminMonthlyGrowth:   ()        => api.get('/admin/reports/monthly-growth'),
  adminTopOrganizers:   ()        => api.get('/admin/reports/top-organizers'),
  adminTopEvents:       ()        => api.get('/admin/reports/top-events'),
}

// ─── Admin ──────────────────────────────────────────────
export const adminAPI = {
  getUsers:            (params) => api.get('/admin/users', { params }),
  updateUserStatus:    (id, d)  => api.patch(`/admin/users/${id}/status`, d),
  updateUserRole:      (id, d)  => api.patch(`/admin/users/${id}/role`, d),
  deleteUser:          (id)     => api.delete(`/admin/users/${id}`),
  getOrganizerApprovals: (params) => api.get('/admin/organizer-approvals', { params }),
  approveOrganizer:    (id)     => api.patch(`/admin/organizer-approvals/${id}/approve`),
  rejectOrganizer:     (id)     => api.patch(`/admin/organizer-approvals/${id}/reject`),
  getAllEvents:         ()       => api.get('/admin/events'),
}

export default api