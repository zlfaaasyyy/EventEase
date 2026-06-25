import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { paymentsAPI } from '../../services/api'

const MOCK_PAYMENTS = [
  {
    payment_id: 1,
    registration_id: 1,
    event_title: 'Tech Summit 2025',
    ticket_type: 'VIP Pass',
    amount: 300000,
    payment_method: 'Bank Transfer',
    payment_status: 'paid',
    transaction_date: '2025-04-10T10:30:00',
  },
  {
    payment_id: 2,
    registration_id: 2,
    event_title: 'Python Bootcamp',
    ticket_type: 'Regular Pass',
    amount: 150000,
    payment_method: 'QRIS',
    payment_status: 'paid',
    transaction_date: '2025-05-01T14:00:00',
  },
  {
    payment_id: 3,
    registration_id: 3,
    event_title: 'UI/UX Workshop',
    ticket_type: 'Student Pass',
    amount: 75000,
    payment_method: 'Virtual Account',
    payment_status: 'pending',
    transaction_date: '2025-05-20T09:15:00',
  },
  {
    payment_id: 4,
    registration_id: 4,
    event_title: 'Digital Marketing Seminar',
    ticket_type: 'Regular Pass',
    amount: 0,
    payment_method: '-',
    payment_status: 'free',
    transaction_date: '2025-06-01T08:00:00',
  },
]

const STATUS_PILL = {
  paid: 'bg-primary-fixed text-primary',
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  failed: 'bg-error-container text-error',
  refunded: 'bg-surface-container-highest text-outline',
  free: 'bg-secondary-fixed text-secondary',
}

const STATUS_ICON = {
  paid: 'check_circle',
  pending: 'schedule',
  failed: 'cancel',
  refunded: 'currency_exchange',
  free: 'card_giftcard',
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Try fetching from API, fallback to mock
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS)
      setLoading(false)
    }, 300)
  }, [])

  const filtered = payments.filter(p =>
    filter === 'all' || p.payment_status === filter
  )

  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((s, p) => s + p.amount, 0)

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-16 flex-1">
        {/* Header */}
        <div className="bg-surface border-b border-outline-variant py-xl px-lg">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-headline-lg text-on-surface font-bold">Payment History</h1>
            <p className="text-body-md text-on-surface-variant mt-xs">Riwayat semua transaksi pembayaran tiket kamu.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-lg py-xl space-y-xl">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
              <p className="text-body-md text-on-surface-variant mb-sm">Total Transaksi</p>
              <p className="text-headline-md font-bold text-on-surface">{payments.length}</p>
            </div>
            <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
              <p className="text-body-md text-on-surface-variant mb-sm">Total Dibayar</p>
              <p className="text-headline-md font-bold text-primary">Rp{totalPaid.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
              <p className="text-body-md text-on-surface-variant mb-sm">Menunggu Bayar</p>
              <p className="text-headline-md font-bold text-on-tertiary-fixed-variant">
                {payments.filter(p => p.payment_status === 'pending').length}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-sm bg-surface-container-low rounded-xl p-xs w-fit">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'paid', label: 'Lunas' },
              { key: 'pending', label: 'Pending' },
              { key: 'refunded', label: 'Refund' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-lg py-2 rounded-lg font-bold text-label-md transition-all ${
                  filter === tab.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment list */}
          <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {loading ? (
              <div className="divide-y divide-outline-variant">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-lg animate-pulse flex gap-lg">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high" />
                    <div className="flex-1 space-y-sm">
                      <div className="h-4 bg-surface-container-high rounded w-1/2" />
                      <div className="h-3 bg-surface-container-high rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-xl">
                <span className="material-symbols-outlined text-[48px] text-outline">receipt_long</span>
                <p className="text-body-md text-on-surface-variant mt-md">Tidak ada riwayat pembayaran.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {filtered.map(payment => (
                  <div key={payment.payment_id} className="p-lg flex flex-col sm:flex-row sm:items-center gap-lg hover:bg-surface-container-low transition-colors">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${STATUS_PILL[payment.payment_status]}`}>
                      <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {STATUS_ICON[payment.payment_status]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md font-bold text-on-surface">{payment.event_title}</p>
                      <div className="flex flex-wrap gap-md mt-xs">
                        <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">confirmation_number</span>
                          {payment.ticket_type}
                        </span>
                        <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(payment.transaction_date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                        {payment.payment_method !== '-' && (
                          <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[14px]">payment</span>
                            {payment.payment_method}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount + status */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-md shrink-0">
                      <p className="text-title-lg font-bold text-on-surface">
                        {payment.amount === 0 ? (
                          <span className="text-secondary">Free</span>
                        ) : `Rp${payment.amount.toLocaleString('id-ID')}`}
                      </p>
                      <span className={`px-sm py-1 text-label-sm rounded-full font-bold capitalize ${STATUS_PILL[payment.payment_status]}`}>
                        {payment.payment_status}
                      </span>
                    </div>

                    {/* Action if pending */}
                    {payment.payment_status === 'pending' && (
                      <Link to={`/user/payment/${payment.registration_id}`}>
                        <button className="px-lg py-2 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-all shrink-0">
                          Bayar Sekarang
                        </button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}