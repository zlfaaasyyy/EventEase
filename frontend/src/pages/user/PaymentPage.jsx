import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI, paymentsAPI } from '../../services/api'

const PAYMENT_METHODS = [
  { value: 'credit_card',    label: 'Credit / Debit Card',  icon: 'credit_card',       desc: 'Visa, Mastercard, JCB' },
  { value: 'bank_transfer',  label: 'Bank Transfer',        icon: 'account_balance',   desc: 'BCA, BNI, Mandiri, BRI' },
  { value: 'e_wallet',       label: 'E-Wallet',             icon: 'wallet',            desc: 'GoPay, OVO, DANA, ShopeePay' },
]

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

export default function PaymentPage() {
  const { registrationId } = useParams()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await registrationsAPI.getMyRegistrations()
        const reg = res.data.find(r => r.id === parseInt(registrationId))
        if (!reg) { setError('Registration not found.'); return }
        if (reg.status === 'confirmed') { navigate('/user/tickets'); return }
        if (reg.status === 'cancelled') { setError('This registration has been cancelled.'); return }
        setRegistration(reg)
      } catch {
        setError('Failed to load registration details.')
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [registrationId, navigate])

  const handlePay = async () => {
    if (!selectedMethod) { setError('Please select a payment method.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await paymentsAPI.pay({ registration_id: parseInt(registrationId), payment_method: selectedMethod })
      setSuccess(true)
      setTimeout(() => navigate('/user/tickets'), 2500)
    } catch (e) {
      setError(e.response?.data?.detail || 'Payment failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <DashboardLayout title="Payment">
        <div className="max-w-md mx-auto mt-xl text-center">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-xl">
            <div className="w-20 h-20 rounded-full bg-[#dcfce7] flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-[40px] text-[#15803d]">check_circle</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-sm">Payment Successful!</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">Your registration is now confirmed. Redirecting to your tickets…</p>
            <div className="w-8 h-1 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Checkout">
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-md py-xl text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading order details...
          </div>
        ) : error && !registration ? (
          <div className="bg-error-container rounded-xl p-lg text-on-error-container flex items-center gap-md">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        ) : registration && (
          <div className="space-y-lg">
            {/* Order summary */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
              <h2 className="text-title-lg font-bold text-on-surface mb-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Order Summary
              </h2>
              <div className="flex items-start gap-md pb-lg border-b border-outline-variant">
                <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[28px]">event</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-body-lg font-semibold text-on-surface">
                    {registration.event?.title || `Event #${registration.event_id}`}
                  </h3>
                  <p className="text-body-md text-on-surface-variant mt-xs">
                    {registration.event?.location || 'Location TBA'}
                  </p>
                  <div className="flex items-center gap-md mt-sm flex-wrap">
                    <span className="flex items-center gap-xs text-label-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      {registration.event?.start_date
                        ? new Date(registration.event.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'}
                    </span>
                    <span className="flex items-center gap-xs text-label-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                      {registration.ticket?.ticket_type || `Ticket #${registration.ticket_id}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-md space-y-sm">
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Ticket price</span>
                  <span className="text-on-surface font-medium">{formatRupiah(registration.ticket?.price)}</span>
                </div>
                <div className="flex justify-between text-body-md">
                  <span className="text-on-surface-variant">Service fee</span>
                  <span className="text-on-surface font-medium">Rp 0</span>
                </div>
                <div className="flex justify-between text-title-lg font-bold pt-sm border-t border-outline-variant">
                  <span className="text-on-surface">Total</span>
                  <span className="text-primary">{formatRupiah(registration.ticket?.price)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
              <h2 className="text-title-lg font-bold text-on-surface mb-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">payment</span>
                Select Payment Method
              </h2>
              <div className="space-y-sm">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMethod(m.value)}
                    className={`w-full flex items-center gap-md p-md rounded-xl border-2 transition-all text-left ${
                      selectedMethod === m.value
                        ? 'border-primary bg-primary-fixed'
                        : 'border-outline-variant bg-surface-container-low hover:border-primary hover:bg-surface-container'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedMethod === m.value ? 'bg-primary' : 'bg-surface-container-high'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${
                        selectedMethod === m.value ? 'text-on-primary' : 'text-on-surface-variant'
                      }`}>{m.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-body-md font-semibold ${selectedMethod === m.value ? 'text-primary' : 'text-on-surface'}`}>
                        {m.label}
                      </p>
                      <p className="text-label-md text-on-surface-variant">{m.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedMethod === m.value ? 'border-primary bg-primary' : 'border-outline-variant'
                    }`}>
                      {selectedMethod === m.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-on-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error-container rounded-xl p-md text-on-error-container flex items-center gap-sm text-body-md">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-md">
              <button
                onClick={() => navigate('/user/registrations')}
                className="flex-1 px-lg py-3 border border-outline-variant rounded-xl text-body-md font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePay}
                disabled={!selectedMethod || submitting}
                className="flex-2 flex-1 flex items-center justify-center gap-sm px-lg py-3 bg-primary text-on-primary rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Processing…</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px]">lock</span> Pay {formatRupiah(registration.ticket?.price)}</>
                )}
              </button>
            </div>

            <p className="text-label-md text-on-surface-variant text-center flex items-center justify-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">security</span>
              Your payment is secured and encrypted
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}