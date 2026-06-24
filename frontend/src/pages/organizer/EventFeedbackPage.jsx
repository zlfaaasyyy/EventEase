import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { feedbackAPI } from '../../services/api'

const MOCK_FEEDBACK = [
  {
    feedback_id: 1,
    user_name: 'Andi Pratama',
    rating: 5,
    comment: 'Acara luar biasa! Speaker sangat inspiratif dan materi yang disampaikan sangat relevan dengan kebutuhan industri saat ini.',
    created_at: '2025-05-21T10:30:00',
    reply: null,
  },
  {
    feedback_id: 2,
    user_name: 'Budi Santoso',
    rating: 4,
    comment: 'Secara keseluruhan bagus, tapi jadwal agak molor. Konten workshop sangat bermanfaat.',
    created_at: '2025-05-21T14:00:00',
    reply: {
      replier_name: 'TechOrg Indonesia',
      content: 'Terima kasih atas masukannya, Budi! Kami akan memperbaiki manajemen waktu di event berikutnya.',
      replied_at: '2025-05-22T09:00:00',
    },
  },
  {
    feedback_id: 3,
    user_name: 'Citra Dewi',
    rating: 3,
    comment: 'Venue nyaman, tapi koneksi wifi kurang stabil saat workshop coding. Semoga bisa diperbaiki.',
    created_at: '2025-05-22T08:15:00',
    reply: null,
  },
]

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="material-symbols-outlined text-[16px]"
          style={{
            color: star <= rating ? '#F59E0B' : '#D1D5DB',
            fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}`,
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

export default function EventFeedbackPage() {
  const { id } = useParams()
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACK)
  const [replyText, setReplyText] = useState({})
  const [replyOpen, setReplyOpen] = useState({})
  const [submitting, setSubmitting] = useState(null)

  useEffect(() => {
    feedbackAPI
      .getByEvent(id)
      .then((r) => setFeedbacks(r.data))
      .catch(() => setFeedbacks(MOCK_FEEDBACK))
  }, [id])

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—'

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
    pct: feedbacks.length
      ? Math.round((feedbacks.filter((f) => f.rating === star).length / feedbacks.length) * 100)
      : 0,
  }))

  const toggleReply = (id) => {
    setReplyOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleReply = async (feedbackId) => {
    const text = replyText[feedbackId]?.trim()
    if (!text) return
    setSubmitting(feedbackId)
    try {
      await feedbackAPI.reply(feedbackId, { content: text })
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.feedback_id === feedbackId
            ? {
                ...f,
                reply: {
                  replier_name: 'Organizer',
                  content: text,
                  replied_at: new Date().toISOString(),
                },
              }
            : f
        )
      )
      setReplyText((prev) => ({ ...prev, [feedbackId]: '' }))
      setReplyOpen((prev) => ({ ...prev, [feedbackId]: false }))
    } catch {
      alert('Gagal mengirim balasan.')
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <DashboardLayout title="Event Feedback">
      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {/* Average rating */}
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col items-center justify-center gap-sm">
          <p className="text-label-sm text-outline uppercase tracking-wider">Average Rating</p>
          <p className="text-display-lg text-primary font-bold">{avgRating}</p>
          <StarDisplay rating={Math.round(parseFloat(avgRating))} />
          <p className="text-body-md text-on-surface-variant">{feedbacks.length} reviews</p>
        </div>

        {/* Rating distribution */}
        <div className="md:col-span-2 bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-title-lg font-bold text-on-surface mb-md">Rating Distribution</p>
          <div className="space-y-sm">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-md">
                <div className="flex items-center gap-xs w-16">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: '#F59E0B', fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-body-md text-on-surface font-medium">{star}</span>
                </div>
                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-label-md text-on-surface-variant w-12 text-right">
                  {count} ({pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback list */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant">
          <h2 className="text-title-lg font-bold text-on-surface">All Feedback</h2>
        </div>

        <div className="divide-y divide-outline-variant">
          {feedbacks.length === 0 && (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-[48px] text-outline">reviews</span>
              <p className="text-body-md text-on-surface-variant mt-md">Belum ada feedback untuk event ini.</p>
            </div>
          )}

          {feedbacks.map((fb) => (
            <div key={fb.feedback_id} className="p-lg">
              {/* User + rating */}
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-headline-sm">
                    {fb.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-md font-bold text-on-surface">{fb.user_name}</p>
                    <p className="text-label-sm text-outline">
                      {new Date(fb.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={fb.rating} />
              </div>

              {/* Comment */}
              <p className="text-body-md text-on-surface-variant mb-md leading-relaxed">{fb.comment}</p>

              {/* Existing reply */}
              {fb.reply && (
                <div className="ml-lg pl-lg border-l-4 border-primary-container bg-surface-container-low p-md rounded-r-xl mb-md">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="material-symbols-outlined text-primary text-[16px]">reply</span>
                    <p className="text-label-sm font-bold text-primary">{fb.reply.replier_name}</p>
                    <span className="text-label-sm text-outline">
                      •{' '}
                      {new Date(fb.reply.replied_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant">{fb.reply.content}</p>
                </div>
              )}

              {/* Reply action */}
              {!fb.reply && (
                <div>
                  {!replyOpen[fb.feedback_id] ? (
                    <button
                      onClick={() => toggleReply(fb.feedback_id)}
                      className="flex items-center gap-xs text-primary text-label-md font-bold hover:bg-primary-fixed px-md py-sm rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">reply</span>
                      Balas Feedback
                    </button>
                  ) : (
                    <div className="space-y-sm ml-lg">
                      <textarea
                        rows={3}
                        placeholder="Tulis balasan Anda..."
                        value={replyText[fb.feedback_id] || ''}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [fb.feedback_id]: e.target.value }))
                        }
                        className="w-full px-md py-md bg-surface border border-outline-variant rounded-lg text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md resize-none"
                      />
                      <div className="flex gap-sm">
                        <button
                          onClick={() => handleReply(fb.feedback_id)}
                          disabled={submitting === fb.feedback_id || !replyText[fb.feedback_id]?.trim()}
                          className="px-lg py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md hover:opacity-90 transition-all flex items-center gap-xs disabled:opacity-50"
                        >
                          {submitting === fb.feedback_id ? (
                            <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">send</span>
                          )}
                          Kirim Balasan
                        </button>
                        <button
                          onClick={() => toggleReply(fb.feedback_id)}
                          className="px-lg py-2 border border-outline-variant text-on-surface-variant rounded-lg font-bold text-label-md hover:bg-surface-container-high transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}