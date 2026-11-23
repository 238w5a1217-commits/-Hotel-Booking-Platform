import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react'

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
}

export default function BookingDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => { const { data } = await api.get(`/bookings/${id}`); return data.data },
  })

  if (isLoading) return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-500" /></div>
  if (!data) return <p className="text-center py-16 text-gray-500">Booking not found.</p>

  const bd = data.priceBreakdown

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 mb-6">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <span className={`badge text-sm ${STATUS_COLORS[data.status] || 'bg-gray-100 text-gray-600'}`}>
          {data.status}
        </span>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">{data.property?.name}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-1"><MapPin size={14} /> {data.property?.address}</p>
            <p className="flex items-center gap-1"><Calendar size={14} /> {data.checkIn} → {data.checkOut} ({bd?.numberOfNights} nights)</p>
            <p className="font-medium">{data.roomType?.name} × {data.quantity}</p>
            <p className="text-xs text-gray-400">Reference: {data._id}</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3">Guest Contact</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-1"><User size={14} /> {data.guestDetails?.name}</p>
            <p>{data.guestDetails?.email}</p>
            <p>{data.guestDetails?.phone}</p>
          </div>
        </div>

        {bd && (
          <div className="card p-5">
            <h2 className="font-semibold mb-3">Itemized Price Breakdown</h2>
            <table className="w-full text-sm mb-3">
              <thead className="text-gray-500 border-b"><tr>
                <th className="text-left pb-2">Night</th>
                <th className="text-right pb-2">Base</th>
                <th className="text-right pb-2">GST</th>
                <th className="text-right pb-2">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {bd.nights?.map((n) => (
                  <tr key={n.date} className="text-gray-700">
                    <td className="py-1.5">{n.date}</td>
                    <td className="text-right py-1.5">₹{n.basePrice?.toLocaleString('en-IN')}</td>
                    <td className="text-right py-1.5 text-orange-500">{n.gstLabel}</td>
                    <td className="text-right py-1.5 font-medium">₹{n.nightTotal?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{data.subtotal?.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-orange-500"><span>Total GST</span><span>₹{data.totalGST?.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Grand Total</span><span>₹{data.grandTotal?.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        )}

        {data.status === 'cancelled' && (
          <div className="card p-5 border-red-100">
            <h2 className="font-semibold mb-2 text-red-600">Cancellation Status</h2>
            <div className="text-sm text-gray-600">
              <p>Cancelled: {new Date(data.cancelledAt).toLocaleString('en-IN')}</p>
              <p>Refund: ₹{data.refundAmount?.toLocaleString('en-IN')} ({data.refundStatus})</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

