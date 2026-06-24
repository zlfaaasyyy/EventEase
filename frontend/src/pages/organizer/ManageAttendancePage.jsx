import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { attendanceAPI } from '../../services/api'

const MOCK_ATTENDANCE = [
  { attendance_id: 1, registration_id: 1, user_name: 'Andi Pratama', ticket_type: 'VIP Pass', check_in_time: '2025-05-20T09:05:00', status: 'hadir' },
  { attendance_id: 2, registration_id: 2, user_name: 'Budi Santoso', ticket_type: 'Regular', check_in_time: null, status: 'tidak hadir' },
  { attendance_id: 3, registration_id: 3, user_name: 'Citra Dewi', ticket_type: 'VIP Pass', check_in_time: '2025-05-20T09:30:00', status: 'hadir' },
]

export default function ManageAttendancePage() {
  const { id } = useParams()
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE)
  const [search, setSearch] = useState('')

  useEffect(() => {
    attendanceAPI.getByEvent(id).then((r) => setAttendance(r.data)).catch(() => setAttendance(MOCK_ATTENDANCE))
  }, [id])

  const handleCheckIn = async (registrationId) => {
    try {
      await attendanceAPI.checkIn(registrationId)
      setAttendance(attendance.map((a) =>
        a.registration_id === registrationId
          ? { ...a, status: 'hadir', check_in_time: new Date().toISOString() }
          : a
      ))
    } catch {
      alert('Check-in failed')
    }
  }

  const filtered = attendance.filter((a) =>
    a.user_name.toLowerCase().includes(search.toLowerCase()) ||
    a.ticket_type.toLowerCase().includes(search.toLowerCase())
  )

  const present = attendance.filter((a) => a.status === 'hadir').length
  const total = attendance.length

  return (
    <DashboardLayout title="Manage Attendance">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Total Registrations</p>
          <p className="text-headline-md font-bold text-on-surface">{total}</p>
        </div>
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Present</p>
          <p className="text-headline-md font-bold text-primary">{present}</p>
        </div>
        <div className="bg-surface rounded-xl p-lg border border-outline-variant shadow-sm">
          <p className="text-body-md text-on-surface-variant mb-sm">Attendance Rate</p>
          <p className="text-headline-md font-bold text-on-surface">{total > 0 ? Math.round((present / total) * 100) : 0}%</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center gap-md">
          <h2 className="text-title-lg font-bold text-on-surface">Attendees</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              className="pl-10 pr-4 py-2 rounded-lg border border-outline-variant bg-surface text-body-md focus:ring-2 focus:ring-primary outline-none w-56"
              placeholder="Search attendee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-lg py-md text-label-sm text-outline uppercase">#</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Name</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Ticket</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Check-in Time</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase">Status</th>
                <th className="px-lg py-md text-label-sm text-outline uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((a, i) => (
                <tr key={a.attendance_id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{i + 1}</td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-label-md">
                        {a.user_name.charAt(0)}
                      </div>
                      <span className="text-body-md font-medium text-on-surface">{a.user_name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{a.ticket_type}</td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">
                    {a.check_in_time
                      ? new Date(a.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="px-lg py-md">
                    {a.status === 'hadir' ? (
                      <span className="px-sm py-1 bg-primary-fixed text-primary text-label-sm rounded-full font-bold">Hadir</span>
                    ) : (
                      <span className="px-sm py-1 bg-error-container text-error text-label-sm rounded-full font-bold">Tidak Hadir</span>
                    )}
                  </td>
                  <td className="px-lg py-md text-right">
                    {a.status !== 'hadir' && (
                      <button
                        onClick={() => handleCheckIn(a.registration_id)}
                        className="px-md py-1.5 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-all"
                      >
                        Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}