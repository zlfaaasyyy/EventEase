import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI, feedbackAPI } from '../../services/api'

function StarRating({ value, onChange, readonly = false, size = 'text-[28px]' }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-xs">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`material-symbols-outlined ${size} transition-colors ${
            n <= (hovered || value)
              ? 'text-[#f59e0b]'
              : 'text-outline-variant'
          } ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          style={{ fontVariationSettings: n <= (hovered || value) ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </button>
      ))}
    </div>
  )
}

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function GiveFeedbackPage() {
  const navigate = useNavigate()
  const [eligibleEvents, setEligibleEvents] = useState([])
  const [myFeedbacks, setMyFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, fbRes] = await Promise.all([
          registrationsAPI.getMyRegistrations(),
          feedbackAPI.getMyFeedbacks(),
        ])
        const confirmedRegs = regRes.data.filter(r => r.status === 'confirmed')
        const givenEventIds = new Set(fbRes.data.map(f => f.event_id))
        // Filter events user hasn't given feedback yet
        const events = confirmedRegs
          .filter(r => !givenEventIds.has(r.event_id))
          .map(r => ({ id: r.event_id, title: r.event?.title || `Event #${r.event_id}` }))
          // Deduplicate by event_id
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        setEligibleEvents(events)
        setMyFeedbacks(fbRes.data)
      } catch {
        setError('Failed to load events.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const showToast = (msg, type) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmit = async () => {
    if (!selectedEventId) { setError('Please select an event.'); return }
    if (rating === 0) { setError('Please select a rating.'); return }
    if (!comment.trim()) { setError('Please write a comment.'); return }
    setError(null)
    setSubmitting(true)
    try {
      await feedbackAPI.create({ event_id: parseInt(selectedEventId), rating, comment: comment.trim() })
      showToast('Feedback submitted successfully!', 'success')
      // Refresh
      const fbRes = await feedbackAPI.getMyFeedbacks()
      setMyFeedbacks(fbRes.data)
      const givenEventIds = new Set(fbRes.data.map(f => f.event_id))
      setEligibleEvents(prev => prev.filter(e => !givenEventIds.has(e.id)))
      setSelectedEventId('')
      setRating(0)
      setComment('')
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <DashboardLayout title="Give Feedback">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-sm px-md py-sm rounded-xl shadow-lg border-l-4 text-body-md font-medium ${
          toast.type === 'success' ? 'bg-white border-[#15803d] text-[#15803d]' : 'bg-white border-error text-error'
        }`}>
          <span className="material-symbols-outlined text-[20px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-lg">
        {/* Submit form */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
          <h2 className="text-title-lg font-bold text-on-surface mb-sm flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">rate_review</span>
            Share Your Experience
          </h2>
          <p className="text-body-md text-on-surface-variant mb-lg">
            Your feedback helps organizers improve future events.
          </p>

          {loading ? (
            <div className="flex items-center gap-sm text-on-surface-variant py-md">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading events...
            </div>
          ) : eligibleEvents.length === 0 ? (
            <div className="text-center py-lg">
              <span className="material-symbols-outlined text-[48px] text-outline mb-sm block">check_circle</span>
              <p className="text-body-lg font-semibold text-on-surface mb-xs">All caught up!</p>
              <p className="text-body-md text-on-surface-variant mb-md">
                You've given feedback for all attended events. Attend more events to unlock more feedback slots.
              </p>
              <button
                onClick={() => navigate('/events')}
                className="px-lg py-sm bg-primary text-on-primary rounded-xl text-body-md font-medium hover:opacity-90"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="space-y-lg">
              {/* Select event */}
              <div className="space-y-xs">
                <label className="text-label-md font-medium text-on-surface-variant uppercase tracking-wider">Event</label>
                <select
                  value={selectedEventId}
                  onChange={e => setSelectedEventId(e.target.value)}
                  className="w-full h-12 px-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Select an event…</option>
                  {eligibleEvents.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {/* Rating */}
              <div className="space-y-sm">
                <label className="text-label-md font-medium text-on-surface-variant uppercase tracking-wider">Rating</label>
                <div className="flex items-center gap-md">
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && (
                    <span className="text-body-md font-semibold text-on-surface">
                      {RATING_LABELS[rating]}
                    </span>
                  )}
                </div>
                <div className="flex gap-xs mt-xs">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className={`flex-1 py-xs rounded-lg text-label-sm font-bold transition-colors ${
                        rating === n
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-xs">
                <label className="text-label-md font-medium text-on-surface-variant uppercase tracking-wider">Comment</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Share what you loved, what could be improved, and any other thoughts…"
                  className="w-full p-md bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                />
                <div className="flex justify-between">
                  <span className="text-label-sm text-on-surface-variant">Be specific and constructive</span>
                  <span className="text-label-sm text-on-surface-variant">{comment.length}/500</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-sm text-error text-body-md bg-error-container rounded-lg p-sm">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-sm py-3 bg-primary text-on-primary rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Submitting…</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">send</span> Submit Feedback</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Previous feedbacks */}
        {myFeedbacks.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
            <h2 className="text-title-lg font-bold text-on-surface mb-lg flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary">history</span>
              My Previous Feedback
            </h2>
            <div className="space-y-md">
              {myFeedbacks.map(fb => (
                <div key={fb.id} className="p-md rounded-xl bg-surface-container-low border border-outline-variant">
                  <div className="flex items-start justify-between gap-md mb-sm">
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">
                        Event #{fb.event_id}
                      </p>
                      <p className="text-label-md text-on-surface-variant">{formatDate(fb.created_at)}</p>
                    </div>
                    <StarRating value={fb.rating} readonly size="text-[18px]" />
                  </div>
                  <p className="text-body-md text-on-surface-variant">{fb.comment}</p>
                  {fb.organizer_reply && (
                    <div className="mt-sm pt-sm border-t border-outline-variant">
                      <p className="text-label-md font-semibold text-secondary mb-xs flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px]">reply</span>
                        Organizer replied
                      </p>
                      <p className="text-body-md text-on-surface-variant">{fb.organizer_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}