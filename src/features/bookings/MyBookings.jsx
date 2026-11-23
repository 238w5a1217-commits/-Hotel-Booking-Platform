import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Calendar, MapPin, IndianRupee, XCircle, Building2 } from 'lucide-react'

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
}

export default function MyBookings() {
  const [status, setStatus]         = useState('')
  const [preview, setPreview]       = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', status],
    queryFn: async () => {
      const { data } = await api.get('/bookings/my', { params: { status, limit: 20 } })
      return data
    },
  })

  const handleCancelPreview = async (bookingId) => {
    try {
      const { data } = await api.post(`/bookings/${bookingId}/cancel?preview=true`)
      setPreview({ bookingId, ...data.data })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch refund policy')
    }
  }

  const handleConfirmCancel = async () => {
    if (!preview) return
    setCancelling(preview.bookingId)
    try {
      await api.post(`/bookings/${preview.bookingId}/cancel`)
      toast.success('Booking cancelled successfully')
      qc.invalidateQueries(['my-bookings'])
      setPreview(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancelling(null)
    }
  }

  const bookings = data?.data || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <select className="input w-auto text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading && <div className="text-center py-16 text-gray-400">Loading your bookings...</div>}

      {!isLoading && bookings.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 text-gray-200" />
          <p>No bookings found. <Link to="/" className="text-brand-600 hover:underline">Find a hotel →</Link></p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="card p-5 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {b.property?.images?.[0]
                ? <img src={b.property.images[0]} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><Building2 size={32} /></div>}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.property?.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={12} className="capitalize" /> {b.property?.city}
                  </div>
                </div>
                <span className={`badge ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span><Calendar size={12} className="inline mr-1" />{b.checkIn} → {b.checkOut}</span>
                <span className="flex items-center"><IndianRupee size={12} />{b.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{b.roomType?.name} · Booking #{b._id.slice(-8)}</p>
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <Link to={`/bookings/${b._id}`} className="btn-secondary text-sm text-center">Details</Link>
              {b.status === 'confirmed' && (
                <button onClick={() => handleCancelPreview(b._id)}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-3">Cancellation & Refund</h3>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Policy Applied:</strong> {preview.policy}</p>
              <p><strong>Original Total:</strong> ₹{preview.grandTotal?.toLocaleString('en-IN')}</p>
              <p className={`font-bold text-base ${preview.refundPercent === 0 ? 'text-red-500' : 'text-green-600'}`}>
                Eligible Refund: ₹{preview.refundAmount?.toLocaleString('en-IN')} ({preview.refundPercent}%)
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPreview(null)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleConfirmCancel} disabled={!!cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg">
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

