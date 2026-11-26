import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { ShieldOff, Shield, ArrowLeft, Search, Filter, Users, UserCheck } from 'lucide-react'

const ROLE_COLORS = {
  guest:   'bg-sky-50 text-sky-700 border-sky-200',
  partner: 'bg-purple-50 text-purple-700 border-purple-200',
  admin:   'bg-brand-50 text-brand-700 border-brand-200',
}

export default function AdminUsers() {
  const [filters, setFilters] = useState({ role: '', search: '' })
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { ...filters, limit: 30 } })
      return data
    },
  })

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`)
      toast.success(isBlocked ? 'User unblocked successfully' : 'User blocked successfully')
      qc.invalidateQueries(['admin-users'])
      qc.invalidateQueries(['admin-dashboard'])
    } catch {
      toast.error('Failed to update user block status')
    }
  }

  const users = data?.data || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Accounts & RBAC Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage guest, hotel partner, and administrator access permissions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3 border border-slate-200/90 bg-white shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            className="input pl-9.5 text-xs py-2"
            placeholder="Search accounts by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <select
          className="input w-auto text-xs py-2 font-medium"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles (Guests, Partners, Admins)</option>
          <option value="guest">Guest</option>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden border border-slate-200/90 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Role</th>
                <th className="py-3 px-5 text-center">Account Status</th>
                <th className="py-3 px-5">Joined Date</th>
                <th className="py-3 px-5 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">Loading user accounts...</td>
                </tr>
              )}

              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try refining your search keyword or role filter.</p>
                  </td>
                </tr>
              )}

              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                        {u.name ? u.name.charAt(0) : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">{u.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-center">
                    {u.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldOff size={11} /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <UserCheck size={11} /> Active
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          u.isBlocked
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}>
                        {u.isBlocked ? 'Unblock User' : 'Block User'}
                      </button>
                    )}
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
