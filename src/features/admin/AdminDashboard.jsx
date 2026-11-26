import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import {
  BarChart3,
  Building2,
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  MapPin,
  IndianRupee,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return data.data
    },
  })

  const cards = [
    {
      label: 'Confirmed Bookings',
      value: data?.totalBookings ?? 0,
      icon: CalendarCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Total Revenue',
      value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-brand-600 bg-orange-50 border-orange-100',
    },
    {
      label: 'Cancellations',
      value: data?.totalCancellations ?? 0,
      icon: BarChart3,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      label: 'Registered Users',
      value: data?.totalUsers ?? 0,
      icon: Users,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      label: 'Live Properties',
      value: data?.totalProperties ?? 0,
      icon: Building2,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ]

  const controls = [
    {
      to: '/admin/properties',
      icon: Building2,
      title: 'Review Properties',
      desc: 'Moderate pending listings & partner inventory',
      color: 'text-amber-600 bg-amber-50 group-hover:bg-amber-100',
    },
    {
      to: '/admin/bookings',
      icon: CalendarCheck,
      title: 'All Bookings',
      desc: 'Inspect stays, date ranges, and GST slabs',
      color: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100',
    },
    {
      to: '/admin/users',
      icon: Users,
      title: 'Users & Roles',
      desc: 'Manage accounts and RBAC access permissions',
      color: 'text-sky-600 bg-sky-50 group-hover:bg-sky-100',
    },
    {
      to: '/',
      icon: ExternalLink,
      title: 'Live Search View',
      desc: 'Preview the guest booking and search marketplace',
      color: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Platform Operations
            </span>
            <span className="text-xs text-slate-400 font-medium">Asia/Kolkata (IST)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor real-time bookings, revenue, property approvals, and system-wide inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/properties"
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shadow-brand-500/20">
            <Building2 size={15} />
            <span>Review Properties</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="card p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {isLoading ? '—' : value}
              </p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid: Top Cities & Platform Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Cities by Bookings */}
        <div className="lg:col-span-6 card p-6 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MapPin size={18} className="text-brand-600" />
                  Top Cities by Bookings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Ranked by total confirmed reservation volume</p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-slate-400 text-sm py-8 text-center">Loading city analytics...</p>
            ) : data?.topCities?.length ? (
              <div className="space-y-3.5">
                {data.topCities.map((c, i) => {
                  const maxCount = data.topCities[0]?.count || 1
                  const pct = Math.max(12, Math.round((c.count / maxCount) * 100))
                  return (
                    <div key={c._id} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                              i === 0
                                ? 'bg-amber-100 text-amber-800 font-extrabold'
                                : i === 1
                                ? 'bg-slate-200 text-slate-700'
                                : i === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                            {i + 1}
                          </span>
                          <span className="capitalize font-semibold text-slate-800">{c._id}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-500 font-medium">{c.count} bookings</span>
                          <span className="font-bold text-slate-900">
                            ₹{c.revenue?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <MapPin size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No city bookings recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Quick Controls */}
        <div className="lg:col-span-6 card p-6 border border-slate-200/90 shadow-sm bg-white">
          <div className="mb-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-600" />
              Platform Controls & Moderation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to essential administrative tools</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {controls.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group card p-4 border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${item.color}`}>
                        <Icon size={18} />
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Latest Platform Bookings Table */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-sm bg-white">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Latest Platform Bookings</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time ledger of recent reservations across all partner hotels</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors">
            <span>View All Bookings</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Guest</th>
                <th className="py-3 px-5">Hotel / Destination</th>
                <th className="py-3 px-5">Stay Dates (IST)</th>
                <th className="py-3 px-5 text-right">Grand Total</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading recent platform transactions...
                  </td>
                </tr>
              )}

              {!isLoading && (!data?.recentBookings || data.recentBookings.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CalendarCheck size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No bookings placed yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Bookings created by guests will appear here live.</p>
                  </td>
                </tr>
              )}

              {data?.recentBookings?.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                        {b.guest?.name ? b.guest.name.charAt(0) : 'G'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">
                          {b.guest?.name || 'Guest User'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{b.guest?.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {b.property?.name || 'Hotel Property'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 capitalize">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{b.property?.city || 'India'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-xs text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{b.checkIn}</span>
                      <span className="text-slate-400">→</span>
                      <span>{b.checkOut}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">
                    ₹{b.grandTotal?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                      {b.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <Link
                      to={`/bookings/${b._id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
