import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { BarChart3, Building2, Users, CalendarCheck, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const { data } = await api.get('/admin/dashboard'); return data.data },
  })

  const cards = [
    { label: 'Confirmed Bookings', value: data?.totalBookings, icon: CalendarCheck, color: 'text-green-600 bg-green-50' },
    { label: 'Total Revenue', value: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
    { label: 'Cancellations', value: data?.totalCancellations, icon: BarChart3, color: 'text-red-500 bg-red-50' },
    { label: 'Registered Users', value: data?.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Live Hotels', value: data?.totalProperties, icon: Building2, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard & Operations</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold">{isLoading ? '—' : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-5">
          <h2 className="font-semibold mb-4">Top 5 Cities by Bookings</h2>
          {isLoading ? <p className="text-gray-400">Loading metrics...</p> : (
            <div className="space-y-3">
              {data?.topCities?.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-brand-600 font-bold w-5 text-sm">{i + 1}.</span>
                  <span className="capitalize font-medium flex-1">{c._id}</span>
                  <span className="text-sm text-gray-500">{c.count} bookings</span>
                  <span className="text-sm text-brand-600">₹{c.revenue?.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {!data?.topCities?.length && <p className="text-gray-400">No booking metrics recorded yet.</p>}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-4">Platform Controls</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/properties" className="card p-4 text-center hover:shadow-md transition-shadow border-yellow-100">
              <Building2 size={24} className="mx-auto mb-2 text-yellow-600" />
              <p className="font-medium text-sm">Review Properties</p>
            </Link>
            <Link to="/admin/bookings" className="card p-4 text-center hover:shadow-md transition-shadow">
              <CalendarCheck size={24} className="mx-auto mb-2 text-green-600" />
              <p className="font-medium text-sm">All Bookings</p>
            </Link>
            <Link to="/admin/users" className="card p-4 text-center hover:shadow-md transition-shadow">
              <Users size={24} className="mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-sm">Users & Roles</p>
            </Link>
            <Link to="/" className="card p-4 text-center hover:shadow-md transition-shadow">
              <BarChart3 size={24} className="mx-auto mb-2 text-purple-600" />
              <p className="font-medium text-sm">Live Search View</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="p-4 border-b font-semibold">Latest Platform Bookings</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left p-3 font-medium text-gray-600">Guest</th>
            <th className="text-left p-3 font-medium text-gray-600">Hotel</th>
            <th className="text-left p-3 font-medium text-gray-600">Dates</th>
            <th className="text-right p-3 font-medium text-gray-600">Grand Total</th>
            <th className="text-left p-3 font-medium text-gray-600">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {data?.recentBookings?.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="p-3">{b.guest?.name}</td>
                <td className="p-3">{b.property?.name}</td>
                <td className="p-3 text-gray-500">{b.checkIn} → {b.checkOut}</td>
                <td className="p-3 text-right font-medium">₹{b.grandTotal?.toLocaleString('en-IN')}</td>
                <td className="p-3"><span className={`badge ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

