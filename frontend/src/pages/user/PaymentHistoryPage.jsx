import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { paymentsAPI } from '../../services/api'

const STATUS_PILL = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
  free: 'bg-blue-100 text-blue-700',
}

const STATUS_ICON = {
  paid: 'check_circle',
  pending: 'schedule',
  failed: 'cancel',
  refunded: 'currency_exchange',
  free: 'card_giftcard',
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)

        const response = await paymentsAPI.getMyPayments()

        const formattedPayments = response.data.map(payment => ({
          payment_id: payment.id,
          registration_id: payment.registration_id,

          event_title:
            payment.registration?.event?.title ||
            'Unknown Event',

          ticket_type:
            payment.registration?.ticket?.ticket_type ||
            'Regular Ticket',

          amount: payment.amount,

          payment_method:
            payment.payment_method || '-',

          payment_status:
            payment.payment_status,

          transaction_date:
            payment.transaction_date ||
            new Date().toISOString()
        }))

        setPayments(formattedPayments)

      } catch (error) {
        console.log(error)
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const filtered = payments.filter(
    p => filter === 'all' || p.payment_status === filter
  )

  const totalPaid = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingCount = payments.filter(
    p => p.payment_status === 'pending'
  ).length

  return (
    <DashboardLayout role="user">

      <div className="p-8 bg-background min-h-screen">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Transaction History
          </h1>

          <p className="text-on-surface-variant mt-2">
            Manage your payments and receipts
          </p>
        </div>


        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-surface rounded-xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">
              TOTAL TRANSACTIONS
            </p>

            <p className="text-3xl font-bold">
              {payments.length}
            </p>
          </div>

          <div className="bg-surface rounded-xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">
              TOTAL SPENT
            </p>

            <p className="text-3xl font-bold text-primary">
              Rp{totalPaid.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-surface rounded-xl border p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-2">
              PENDING PAYMENTS
            </p>

            <p className="text-3xl font-bold">
              {pendingCount}
            </p>
          </div>

        </div>


        {/* Filter */}
        <div className="flex gap-3 mb-8">

          {[
            {key:'all',label:'All'},
            {key:'paid',label:'Paid'},
            {key:'pending',label:'Pending'},
            {key:'failed',label:'Failed'}
          ].map(item=>(
            <button
              key={item.key}
              onClick={()=>setFilter(item.key)}
              className={`px-5 py-2 rounded-lg transition
              ${
                filter===item.key
                ? 'bg-primary text-white'
                : 'bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}

        </div>


        {/* Table */}

        <div className="bg-surface rounded-xl border overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr className="text-left">

                <th className="p-4">
                  Event
                </th>

                <th className="p-4">
                  Amount
                </th>

                <th className="p-4">
                  Method
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Date
                </th>

                <th className="p-4">
                  Information
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="p-8 text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : filtered.length===0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="p-8 text-center"
                  >
                    No payment history found
                  </td>

                </tr>

              ) : (

                filtered.map(payment=>(

                  <tr
                    key={payment.payment_id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4">

                      <div className="font-bold">
                        {payment.event_title}
                      </div>

                      <div className="text-sm text-gray-500">
                        {payment.ticket_type}
                      </div>

                    </td>

                    <td className="p-4 font-semibold">

                      Rp{payment.amount.toLocaleString('id-ID')}

                    </td>

                    <td className="p-4">

                      {payment.payment_method}

                    </td>

                    <td className="p-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_PILL[payment.payment_status]}`}
                      >
                        {payment.payment_status}
                      </span>

                    </td>

                    <td className="p-4">

                      {
                        new Date(
                          payment.transaction_date
                        ).toLocaleDateString(
                          'id-ID'
                        )
                      }

                    </td>

                    <td className="p-4">

                      {payment.payment_status === 'pending' && (
                        <Link
                          to={`/user/payment/${payment.registration_id}`}
                        >
                          <button
                            className="px-4 py-2 bg-primary
                            text-white rounded-lg hover:opacity-90"
                          >
                            Complete Payment
                          </button>
                        </Link>
                      )}

                      {payment.payment_status === 'paid' && (
                        <span
                          className="text-sm text-green-600 font-medium"
                        >
                          Payment Completed
                        </span>
                      )}

                      {payment.payment_status === 'failed' && (
                        <span
                          className="text-sm text-red-600 font-medium"
                        >
                          Payment Failed
                        </span>
                      )}

                      {payment.payment_status === 'refunded' && (
                        <span
                          className="text-sm text-gray-500 font-medium"
                        >
                          Refunded
                        </span>
                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>
  )
}