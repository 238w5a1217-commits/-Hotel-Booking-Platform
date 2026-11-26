import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { IndianRupee, CreditCard, Info, ShieldCheck, CheckCircle2, Calendar, User, Mail, Phone, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function BookingFlow() {
  const { roomTypeId }  = useParams()
  const { state }       = useLocation()
  const navigate        = useNavigate()
  const { user }        = useAuthStore()
  const { room, property, searchParams } = state || {}

  const [step, setStep]       = useState(1)
  const [quantity, setQty]    = useState(1)
  const [guestDetails, setGD] = useState({ name: user?.name || '', email: user?.email || '', phone: '', specialRequests: '' })
  const [booking, setBooking] = useState(null)
  const [paying, setPaying]   = useState(false)

  const { data: breakdownData, isLoading: bdLoading } = useQuery({
    queryKey: ['breakdown', roomTypeId, searchParams?.checkIn, searchParams?.checkOut, quantity],
    queryFn: async () => {
      const { data } = await api.get('/bookings/breakdown', {
        params: { roomTypeId, checkIn: searchParams.checkIn, checkOut: searchParams.checkOut, quantity },
      })
      return data.data
    },
    enabled: !!roomTypeId && !!searchParams,
  })

  const handleCreateBooking = async () => {
    try {
      const { data } = await api.post('/bookings', {
        roomTypeId, checkIn: searchParams.checkIn, checkOut: searchParams.checkOut,
        quantity, guestDetails,
      })
      setBooking(data.data)
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate booking')
    }
  }

  const handleMockPay = async () => {
    setPaying(true)
    try {
      const { data } = await api.post('/payments/mock-pay', { bookingId: booking._id })
      toast.success('Payment verified! Booking confirmed.')
      navigate(`/bookings/${data.data.booking._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed')
    } finally {
      setPaying(false)
    }
  }

  if (!room || !searchParams) return <p className="text-center py-16">Invalid booking state. Please return to search.</p>

  const bd = breakdownData

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 mb-5 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Hotel Details</span>
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complete Your Stay Reservation</h1>
        <p className="text-slate-500 text-sm mt-0.5">{property?.name} · {room?.name}</p>
      </div>

      {/* Modern Stepper with Rollback Navigation */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {[
          { num: 1, label: 'Guest Details' },
          { num: 2, label: 'Price & GST' },
          { num: 3, label: 'Payment' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            disabled={s.num > step}
            onClick={() => s.num < step && setStep(s.num)}
            className={`flex flex-col items-center transition-all ${
              s.num < step
                ? 'cursor-pointer hover:opacity-80 group'
                : s.num === step
                ? 'cursor-default'
                : 'cursor-not-allowed opacity-50'
            }`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                step >= s.num ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'
              }`}>
              {s.num < step ? '✓' : s.num}
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= s.num ? 'text-slate-800' : 'text-slate-400'
              }`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="card p-4 sm:p-6 space-y-4 border border-slate-200/90 shadow-md bg-white">
          <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <User size={18} className="text-brand-600" /> Guest Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Check-in (2:00 PM IST)</label>
              <div className="input bg-slate-50 flex items-center gap-2 text-slate-700 text-sm">
                <Calendar size={14} className="text-slate-400" />
                <span>{searchParams.checkIn}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Check-out (12:00 PM IST)</label>
              <div className="input bg-slate-50 flex items-center gap-2 text-slate-700 text-sm">
                <Calendar size={14} className="text-slate-400" />
                <span>{searchParams.checkOut}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Number of Rooms</label>
            <input className="input w-full sm:w-32" type="number" min={1} max={5} value={quantity}
              onChange={(e) => setQty(+e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input className="input text-sm" type="text" required value={guestDetails.name}
              onChange={(e) => setGD({ ...guestDetails, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
            <input className="input text-sm" type="email" required value={guestDetails.email}
              onChange={(e) => setGD({ ...guestDetails, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
            <input className="input text-sm" type="tel" required value={guestDetails.phone}
              onChange={(e) => setGD({ ...guestDetails, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Special Requests (Optional)</label>
            <textarea className="input text-sm" rows={2} value={guestDetails.specialRequests}
              onChange={(e) => setGD({ ...guestDetails, specialRequests: e.target.value })} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary py-3 flex items-center justify-center gap-2 font-medium text-xs sm:text-sm">
              <ArrowLeft size={16} />
              <span>Back to Hotel</span>
            </button>
            <button
              type="button"
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20"
              onClick={() => setStep(2)}
              disabled={!guestDetails.name || !guestDetails.email || !guestDetails.phone}>
              <span>Continue to Price Breakdown</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 space-y-4 border border-slate-200/90 shadow-md bg-white">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <IndianRupee size={18} className="text-brand-600" /> Itemized Nightly Price & GST
          </h2>
          {bdLoading ? (
            <div className="text-center py-8 text-slate-400">Calculating breakdown...</div>
          ) : bd ? (
            <>
              <table className="w-full text-sm">
                <thead className="text-slate-400 text-xs border-b border-slate-100">
                  <tr>
                    <th className="text-left pb-2 font-semibold">Night</th>
                    <th className="text-right pb-2 font-semibold">Base Price</th>
                    <th className="text-right pb-2 font-semibold">Tax Slab</th>
                    <th className="text-right pb-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bd.nights?.map((n) => (
                    <tr key={n.date} className="text-slate-700">
                      <td className="py-2.5 font-mono text-xs">{n.date}</td>
                      <td className="text-right py-2.5">₹{n.basePrice.toLocaleString('en-IN')}</td>
                      <td className="text-right py-2.5 text-brand-600 font-medium">{n.gstLabel} (₹{n.gst})</td>
                      <td className="text-right py-2.5 font-bold text-slate-900">₹{n.nightTotal.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quantity > 1 && <p className="text-xs text-slate-500 text-right">× {quantity} rooms requested</p>}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Room Subtotal</span><span>₹{bd.subtotal?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-brand-600 font-medium"><span>Total GST</span><span>₹{bd.totalGST?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-extrabold text-lg border-t border-slate-100 pt-3 text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-brand-600">₹{bd.grandTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3">
                <button
                  type="button"
                  className="btn-secondary py-3 flex items-center justify-center gap-2 font-medium text-xs sm:text-sm"
                  onClick={() => setStep(1)}>
                  <ArrowLeft size={16} />
                  <span>Back to Guest Details</span>
                </button>
                <button
                  type="button"
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20"
                  onClick={handleCreateBooking}>
                  <span>Confirm & Lock Room</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <p className="text-rose-500">Could not calculate price.</p>
          )}
        </div>
      )}

      {step === 3 && booking && (
        <div className="card p-6 space-y-5 border border-slate-200/90 shadow-md bg-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-600" />
            <h2 className="font-bold text-lg text-slate-900">Payment Verification</h2>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-xl flex gap-3 text-xs text-amber-800">
            <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Inventory Hold Active (10 Minutes)</p>
              <p className="mt-0.5 text-amber-700">
                Your room is atomically held. If payment is not completed within 10 minutes, the background job will automatically release it.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/70">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Payable</p>
              <p className="text-2xl font-extrabold text-brand-600">₹{booking.grandTotal?.toLocaleString('en-IN')}</p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Ref: #{booking._id?.slice(-8)}
            </span>
          </div>

          {/* Sandbox Payment Box with Lucide Icon */}
          <div className="border border-brand-200 rounded-2xl p-6 text-center bg-brand-50/40">
            <div className="w-12 h-12 rounded-2xl bg-brand-100/80 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CreditCard size={24} />
            </div>
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">Sandbox Payment Gateway</p>
            <p className="text-xs text-slate-600 mb-4 max-w-sm mx-auto">
              Simulates secure payment gateway processing with instant backend signature verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary py-3 px-5 flex items-center justify-center gap-2 font-medium">
                <ArrowLeft size={16} />
                <span>Review Price & Details</span>
              </button>
              <button onClick={handleMockPay} disabled={paying}
                className="btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-brand-500/25">
                <CreditCard size={16} />
                <span>{paying ? 'Verifying with Backend...' : `Complete Payment of ₹${booking.grandTotal?.toLocaleString('en-IN')}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
