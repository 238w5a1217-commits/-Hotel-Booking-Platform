import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { ShieldOff, Shield } from 'lucide-react'

const ROLE_COLORS = {
  guest:   'bg-blue-100 text-blue-600',
  partner: 'bg-purple-100 text-purple-600',
  admin:   'bg-brand-100 text-brand-700',
}

export default function AdminUsers() {
  const [filters, setFilters] = useState({ role: '', search: '' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => { const { data } = await api.get('/admin/users', { params: { ...filters, limit: 30 } }); return data },
  })

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`)
      toast.success(isBlocked ? 'User unblocked' : 'User blocked successfully')
      qc.invalidateQueries(['admin-users'])
    } catch { toast.error('Failed to update user block status') }
  }

  const users = data?.data || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management & Moderation</h1>

      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <input className="input w-64 text-sm" placeholder="Search by name or email" value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})} />
        <select className="input w-auto text-sm" value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value})}>
          <option value="">All Roles</option>
          <option value="guest">Guest</option>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left p-3 font-medium text-gray-600">Name</th>
            <th className="text-left p-3 font-medium text-gray-600">Email</th>
            <th className="text-left p-3 font-medium text-gray-600">Role</th>
            <th className="text-left p-3 font-medium text-gray-600">Status</th>
            <th className="text-left p-3 font-medium text-gray-600">Joined</th>
            <th className="p-3">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading users...</td></tr>}
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3"><span className={`badge capitalize ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                <td className="p-3">
                  <span className={`badge ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="p-3">
                  <button onClick={() => toggleBlock(u._id, u.isBlocked)}
                    className={`flex items-center gap-1 text-sm font-medium ${u.isBlocked ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'}`}>
                    {u.isBlocked ? <><Shield size={14} /> Unblock</> : <><ShieldOff size={14} /> Block</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

