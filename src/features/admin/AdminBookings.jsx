import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { Calendar, Filter, ArrowLeft, CalendarCheck, MapPin } from 'lucide-react'

const STATUS_COLORS = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  completed: 'bg-sky-50 text-sky-700 border-sky-200',
}

export default function AdminBookings() {
  const [filters, setFilters] = useState({ status: '', from: '', to: '', page: 1 })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: async () => {
      const { data } = await api.get('/bookings', { params: { ...filters, limit: 20 } })
      return data
    },
  })

  const bookings   = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Platform Bookings & Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter, audit, and inspect guest reservations and transaction histories</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3 border border-slate-200/90 bg-white shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Filter size={14} className="text-brand-600" /> Filters:
        </div>

        <select
          className="input w-auto text-xs py-2 font-medium"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Statuses</option>
          {['confirmed', 'pending', 'cancelled', 'completed'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">From:</label>
          <input
            className="input w-auto text-xs py-2 font-mono"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">To:</label>
          <input
            className="input w-auto text-xs py-2 font-mono"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })}
          />
        </div>

        {(filters.status || filters.from || filters.to) && (
          <button
            onClick={() => setFilters({ status: '', from: '', to: '', page: 1 })}
            className="text-xs text-brand-600 hover:underline font-semibold ml-auto">
            Clear Filters
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Guest</th>
                <th className="py-3 px-5">Property</th>
                <th className="py-3 px-5">Room Type</th>
                <th className="py-3 px-5">Dates (IST)</th>
                <th className="py-3 px-5 text-right">Grand Total</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading bookings ledger...</td>
                </tr>
              )}

              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CalendarCheck size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No bookings match the filter criteria</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing or adjusting date filters.</p>
                  </td>
                </tr>
              )}

              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-slate-900 leading-tight">{b.guest?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{b.guest?.email}</p>
                  </td>

                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-slate-900 leading-tight">{b.property?.name}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 capitalize">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{b.property?.city}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-xs text-slate-700 font-medium">
                    {b.roomType?.name || 'Room'}
                  </td>

                  <td className="py-3.5 px-5 text-xs text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-mono">
                      <span>{b.checkIn}</span>
                      <span className="text-slate-400">→</span>
                      <span>{b.checkOut}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">
                    ₹{b.grandTotal?.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {b.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <Link
                      to={`/bookings/${b._id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                      Audit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters({ ...filters, page: i + 1 })}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                filters.page === i + 1
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
