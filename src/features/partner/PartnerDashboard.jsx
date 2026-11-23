import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  Building2,
  CalendarCheck,
  PlusCircle,
  MapPin,
  Star,
  Sliders,
  ExternalLink,
  TrendingUp,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react'

const STATUS_CONFIG = {
  approved: {
    label: 'Live & Approved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dotClass: 'bg-emerald-500 animate-pulse',
  },
  pending: {
    label: 'Pending Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dotClass: 'bg-amber-500',
  },
  rejected: {
    label: 'Needs Changes',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dotClass: 'bg-rose-500',
  },
}

export default function PartnerDashboard() {
  const { user } = useAuthStore()

  const { data: propData, isLoading: propLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const { data } = await api.get('/properties/my')
      return data.data
    },
  })

  const { data: bookData, isLoading: bookLoading } = useQuery({
    queryKey: ['partner-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/partner/all', { params: { limit: 10 } })
      return data
    },
  })

  const properties = propData || []
  const bookings = bookData?.data || []

  // Calculated Metrics
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0)

  const activeProperties = properties.filter((p) => p.status === 'approved').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section with Partner welcome & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
              Hotel Partner Hub
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Partner Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Manage your property listings, room rates, and guest reservations.
          </p>
        </div>

        <Link
          to="/partner/properties/new"
          className="btn-primary self-start sm:self-auto gap-2 text-sm shadow-brand-500/20">
          <PlusCircle size={18} />
          <span>List New Property</span>
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Properties</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{properties.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">{activeProperties} active & bookable</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600">
            <Building2 size={24} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Bookings Received</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{bookings.length}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp size={12} /> Real-time reservations
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CalendarCheck size={24} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Gross Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-0.5">From confirmed bookings</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Inventory Status</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">100%</p>
            <p className="text-xs text-slate-500 mt-0.5">Sync & double-booking safe</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Layers size={24} />
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-brand-600" /> My Hotel Properties
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Click <strong>"Inventory & Rates"</strong> to configure room types, daily prices, and available room counts.
            </p>
          </div>
        </div>

        {propLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-slate-100" />
            ))}
          </div>
        )}

        {!propLoading && properties.length === 0 && (
          <div className="card p-12 text-center max-w-lg mx-auto">
            <Building2 size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No properties listed yet</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Start earning by listing your first hotel or resort on Ajintara.
            </p>
            <Link to="/partner/properties/new" className="btn-primary text-sm">
              <PlusCircle size={16} className="mr-1.5" /> List Your Property
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => {
            const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
            const imageUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'

            return (
              <div
                key={p._id}
                className="card card-hover overflow-hidden flex flex-col group border border-slate-200/90">
                {/* Image Cover with Gradient & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`badge border backdrop-blur-md bg-white/90 shadow-sm ${statusCfg.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>

                    {p.starRating && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 shadow-sm">
                        <Star size={12} className="fill-amber-300 text-amber-300" />
                        {p.starRating} Star
                      </span>
                    )}
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1 drop-shadow-sm">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-1 capitalize">
                      <MapPin size={12} className="text-brand-400 shrink-0" />
                      {p.city} · <span className="text-slate-300 line-clamp-1">{p.address}</span>
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {p.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                            {a}
                          </span>
                        ))}
                        {p.amenities.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[11px]">
                            +{p.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {p.status === 'rejected' && p.rejectionReason && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700">
                        <strong>Reason:</strong> {p.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Clean Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link
                      to={`/hotels/${p._id}`}
                      className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 font-semibold">
                      <ExternalLink size={13} /> View Page
                    </Link>
                    <Link
                      to={`/partner/inventory/${p._id}`}
                      className="btn-primary text-xs flex items-center justify-center gap-1.5 py-2 font-semibold shadow-none">
                      <Sliders size={13} /> Inventory & Rates
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Bookings Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck size={20} className="text-brand-600" /> Recent Guest Reservations
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Bookings made by guests at your approved hotel properties.
          </p>
        </div>

        {bookLoading && <div className="card p-8 animate-pulse bg-slate-100 h-40" />}

        {!bookLoading && bookings.length === 0 && (
          <div className="card p-8 text-center text-slate-400 text-sm">
            No guest bookings recorded yet. As soon as a guest books a room, it will appear here instantly.
          </div>
        )}

        {bookings.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="text-left p-3.5">Guest</th>
                    <th className="text-left p-3.5">Property & Room</th>
                    <th className="text-left p-3.5">Dates</th>
                    <th className="text-right p-3.5">Payout</th>
                    <th className="text-left p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                            {b.guest?.name?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{b.guest?.name}</p>
                            <p className="text-xs text-slate-400">{b.guest?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{b.property?.name}</p>
                        <p className="text-xs text-slate-400">{b.roomType?.name || 'Standard'} × {b.quantity || 1} room</p>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="font-mono text-xs">{b.checkIn}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <span className="font-mono text-xs">{b.checkOut}</span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        ₹{b.grandTotal?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`badge ${
                            b.status === 'confirmed'
                              ? 'badge-success'
                              : b.status === 'cancelled'
                              ? 'badge-danger'
                              : 'badge-pending'
                          }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
