import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-700',
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Bookings Filter & Audit</h1>

      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <select className="input w-auto text-sm" value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}>
          <option value="">All Statuses</option>
          {['confirmed','pending','cancelled','completed'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <input className="input w-auto text-sm" type="date" placeholder="From" value={filters.from}
          onChange={(e) => setFilters({...filters, from: e.target.value, page: 1})} />
        <input className="input w-auto text-sm" type="date" placeholder="To" value={filters.to}
          onChange={(e) => setFilters({...filters, to: e.target.value, page: 1})} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left p-3 font-medium text-gray-600">Guest</th>
            <th className="text-left p-3 font-medium text-gray-600">Property</th>
            <th className="text-left p-3 font-medium text-gray-600">Room Type</th>
            <th className="text-left p-3 font-medium text-gray-600">Dates</th>
            <th className="text-right p-3 font-medium text-gray-600">Grand Total</th>
            <th className="text-left p-3 font-medium text-gray-600">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading bookings...</td></tr>}
            {!isLoading && bookings.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No bookings match the filters.</td></tr>}
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="p-3">{b.guest?.name}<br /><span className="text-gray-400 text-xs">{b.guest?.email}</span></td>
                <td className="p-3 capitalize">{b.property?.name}<br /><span className="text-gray-400 text-xs">{b.property?.city}</span></td>
                <td className="p-3">{b.roomType?.name}</td>
                <td className="p-3 text-gray-500">{b.checkIn}<br />→ {b.checkOut}</td>
                <td className="p-3 text-right font-medium">₹{b.grandTotal?.toLocaleString('en-IN')}</td>
                <td className="p-3"><span className={`badge ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setFilters({...filters, page: i+1})}
              className={`px-3 py-1.5 rounded-lg text-sm ${filters.page === i+1 ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

