import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { registrationsAPI, paymentsAPI } from '../../services/api'

const PAYMENT_METHODS = [
  { value: 'credit_card',    label: 'Credit / Debit Card',  icon: 'credit_card',       desc: 'Visa, Mastercard, JCB' },
  { value: 'bank_transfer',  label: 'Bank Transfer',        icon: 'account_balance',   desc: 'BCA, BNI, Mandiri' },
  { value: 'e_wallet',       label: 'E-Wallet',             icon: 'wallet',            desc: 'GoPay, OVO, DANA' },
]

// Static demo destination numbers per method, shown after the user picks one
// (this is a simulated/academic payment flow -- no real gateway integration).
const BANK_DESTINATIONS = [
  { bank: 'BCA',     account: '8190123456', holder: 'PT EventEase Indonesia' },
  { bank: 'Mandiri', account: '1270098765', holder: 'PT EventEase Indonesia' },
  { bank: 'BNI',     account: '0192837465', holder: 'PT EventEase Indonesia' },
]

const EWALLET_DESTINATIONS = [
  { provider: 'GoPay',     number: '0812-3456-7890' },
  { provider: 'OVO',       number: '0812-3456-7890' },
  { provider: 'DANA',      number: '0812-3456-7890' },
]

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
}

function extractErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail
  if (!detail) return fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
  return fallback
}

export default function PaymentPage() {
  const { registrationId } = useParams()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState(null)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [pendingPayment, setPendingPayment] = useState(null)
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

  // Step 1: create/resume a pending payment for the chosen method.
  // This does NOT confirm the registration or issue the ticket yet --
  // it just records the intent to pay and shows the destination details
  // + a confirm step, like a real payment flow.
  const handlePay = async () => {
    if (!selectedMethod) { setError('Please select a payment method.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const res = await paymentsAPI.pay({ registration_id: parseInt(registrationId), payment_method: selectedMethod })
      setPendingPayment(res.data)
    } catch (e) {
      setError(extractErrorMessage(e, 'Payment failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: user explicitly confirms they've completed the transfer/charge.
  // Only now does the registration become "confirmed" and the official
  // ticket get issued.
  const handleConfirmPayment = async () => {
    if (!pendingPayment) return
    setConfirming(true)
    setError(null)
    try {
      await paymentsAPI.confirm(pendingPayment.id)
      setSuccess(true)
      setTimeout(() => navigate('/user/tickets'), 2500)
    } catch (e) {
      setError(extractErrorMessage(e, 'Could not confirm payment. Please try again.'))
    } finally {
      setConfirming(false)
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
            <h2 className="text-headline-md font-bold text-on-surface mb-sm">Payment Confirmed!</h2>
            <p className="text-body-md text-on-surface-variant mb-lg">Your official ticket has been issued. Redirecting to your tickets…</p>
            <div className="w-8 h-1 bg-primary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Intermediate step: payment created as "pending", waiting for the user
  // to confirm they've actually completed the transfer/charge.
  if (pendingPayment) {
    return (
      <DashboardLayout title="Confirm Payment">
        <div className="max-w-md mx-auto mt-xl">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-xl">
            <div className="w-16 h-16 rounded-full bg-[#fef3c7] flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-[32px] text-[#b45309]">hourglass_top</span>
            </div>
            <h2 className="text-headline-md font-bold text-on-surface mb-sm text-center">Waiting for Your Payment</h2>
            <p className="text-body-md text-on-surface-variant mb-lg text-center">
              Amount due: <span className="font-bold text-on-surface">{formatRupiah(pendingPayment.amount)}</span>
            </p>

            {pendingPayment.payment_method === 'bank_transfer' && (
              <div className="bg-surface-container-low rounded-xl p-lg mb-lg">
                <p className="text-label-md font-bold text-on-surface mb-sm">Transfer to one of these accounts</p>
                <div className="space-y-sm">
                  {BANK_DESTINATIONS.map((b) => (
                    <div key={b.bank} className="flex items-center justify-between p-md bg-surface rounded-lg">
                      <div>
                        <p className="text-label-md font-bold text-on-surface">{b.bank}</p>
                        <p className="text-body-md font-mono text-on-surface-variant">{b.account}</p>
                        <p className="text-label-sm text-on-surface-variant">a.n. {b.holder}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(b.account)}
                        className="px-md py-1.5 border border-outline-variant rounded-lg text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingPayment.payment_method === 'e_wallet' && (
              <div className="bg-surface-container-low rounded-xl p-lg mb-lg">
                <p className="text-label-md font-bold text-on-surface mb-sm">Send payment to this number</p>
                <div className="space-y-sm">
                  {EWALLET_DESTINATIONS.map((w) => (
                    <div key={w.provider} className="flex items-center justify-between p-md bg-surface rounded-lg">
                      <div>
                        <p className="text-label-md font-bold text-on-surface">{w.provider}</p>
                        <p className="text-body-md font-mono text-on-surface-variant">{w.number}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(w.number.replace(/-/g, ''))}
                        className="px-md py-1.5 border border-outline-variant rounded-lg text-label-sm font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingPayment.payment_method === 'credit_card' && (
              <div className="bg-surface-container-low rounded-xl p-lg mb-lg">
                <p className="text-body-md text-on-surface-variant">
                  You'll be redirected to a secure card payment page to enter your card number, expiry date, and CVV.
                </p>
              </div>
            )}

            <p className="text-body-md text-on-surface-variant text-center mb-lg">
              Once you've completed the {pendingPayment.payment_method === 'bank_transfer' ? 'transfer' : pendingPayment.payment_method === 'e_wallet' ? 'payment' : 'charge'}, confirm below.
            </p>

            {error && (
              <div className="bg-error-container rounded-xl p-md text-on-error-container flex items-center gap-sm text-body-md mb-lg">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="w-full flex items-center justify-center gap-sm px-lg py-3 bg-primary text-on-primary rounded-xl text-body-md font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirming ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Confirming…</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">check_circle</span> I've Completed Payment</>
              )}
            </button>
            <p className="mt-md text-label-sm text-center text-outline">
              Your official ticket will only be issued after you confirm here.
            </p>
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

            {/* Bank transfer destination details (preview before confirming method) */}
            {selectedMethod === 'bank_transfer' && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
                <h3 className="text-body-lg font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                  Transfer to one of these accounts
                </h3>
                <div className="space-y-sm">
                  {BANK_DESTINATIONS.map((b) => (
                    <div key={b.bank} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                      <div>
                        <p className="text-label-md font-bold text-on-surface">{b.bank}</p>
                        <p className="text-body-md font-mono text-on-surface-variant">{b.account}</p>
                        <p className="text-label-sm text-on-surface-variant">a.n. {b.holder}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(b.account)}
                        className="px-md py-1.5 border border-outline-variant rounded-lg text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-label-md text-on-surface-variant mt-md">
                  After clicking "Continue to Pay" below, you'll get a confirmation step once the transfer is done.
                </p>
              </div>
            )}

            {/* E-wallet destination details (preview before confirming method) */}
            {selectedMethod === 'e_wallet' && (
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-lg">
                <h3 className="text-body-lg font-bold text-on-surface mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">wallet</span>
                  Send payment to this number
                </h3>
                <div className="space-y-sm">
                  {EWALLET_DESTINATIONS.map((w) => (
                    <div key={w.provider} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                      <div>
                        <p className="text-label-md font-bold text-on-surface">{w.provider}</p>
                        <p className="text-body-md font-mono text-on-surface-variant">{w.number}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText(w.number.replace(/-/g, ''))}
                        className="px-md py-1.5 border border-outline-variant rounded-lg text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-label-md text-on-surface-variant mt-md">
                  After clicking "Continue to Pay" below, you'll get a confirmation step once the payment is done.
                </p>
              </div>
            )}

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
                  <><span className="material-symbols-outlined text-[20px]">arrow_forward</span> Continue to Pay {formatRupiah(registration.ticket?.price)}</>
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