import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import {
  CheckCircle,
  XCircle,
  Building2,
  ArrowLeft,
  MapPin,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'

const STATUS_COLORS = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function AdminProperties() {
  const [status, setStatus]  = useState('approved')
  const [page, setPage]      = useState(1)
  const limit                = 10
  const [rejectModal, setRM] = useState(null)
  const [reason, setReason]  = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', status, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/admin/properties', { params: { status, page, limit } })
      return data
    },
    keepPreviousData: true,
  })

  const handleTabChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const approve = async (id, isReApprove = false) => {
    try {
      await api.patch(`/admin/properties/${id}/approve`)
      toast.success(isReApprove ? 'Property restored & approved!' : 'Property approved and live on platform!')
      qc.invalidateQueries(['admin-properties'])
      qc.invalidateQueries(['admin-dashboard'])
      qc.invalidateQueries(['hotels'])
      qc.invalidateQueries(['cities'])
      qc.invalidateQueries(['property'])
    } catch {
      toast.error('Failed to update property status')
    }
  }

  const reject = async () => {
    if (!reason.trim()) return toast.error('Please enter a rejection reason')
    try {
      await api.patch(`/admin/properties/${rejectModal}/reject`, { reason })
      toast.success('Property status updated with note')
      qc.invalidateQueries(['admin-properties'])
      qc.invalidateQueries(['admin-dashboard'])
      qc.invalidateQueries(['hotels'])
      qc.invalidateQueries(['cities'])
      qc.invalidateQueries(['property'])
      setRM(null)
      setReason('')
    } catch {
      toast.error('Failed to reject property')
    }
  }

  const properties = data?.data || []
  const pagination = data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-4 transition-colors">
        <ArrowLeft size={14} /> Back to Admin Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Review Partner Properties</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Moderate hotel listings (10 per page) with real-time database updates
          </p>
        </div>

        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => handleTabChange(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                status === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing{' '}
          <strong className="text-slate-800">
            {pagination.total === 0 ? 0 : (page - 1) * limit + 1}–
            {Math.min(page * limit, pagination.total)}
          </strong>{' '}
          of <strong className="text-slate-800">{pagination.total}</strong> {status} properties (10 per page)
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          Page {page} of {Math.max(1, pagination.pages)}
        </span>
      </div>

      {isLoading && <p className="text-slate-400 py-12 text-center text-sm">Loading properties...</p>}

      {!isLoading && properties.length === 0 && (
        <div className="card p-12 text-center text-slate-400 border border-slate-200/90 bg-white">
          <Building2 size={40} className="mx-auto mb-2 text-slate-300" />
          <p className="font-semibold text-slate-700">No {status} properties found</p>
          <p className="text-xs text-slate-400 mt-0.5">
            There are currently no listings in the {status} queue on page {page}.
          </p>
        </div>
      )}

      {/* Properties List */}
      <div className="space-y-4">
        {properties.map((p) => (
          <div
            key={p._id}
            className="card p-5 flex flex-col md:flex-row gap-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <Building2 size={28} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 capitalize font-medium text-slate-700">
                      <MapPin size={12} className="text-brand-600" /> {p.city}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> Partner: {p.partner?.name || 'Hotel Partner'} ({p.partner?.email || 'partner@ajintara.com'})
                    </span>
                  </div>
                </div>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[p.status]}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
              <p className="text-xs text-slate-400 mt-1">{p.address}</p>

              {p.rejectionReason && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-1.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span><strong>Rejection Feedback:</strong> {p.rejectionReason}</span>
                </div>
              )}
            </div>

            {/* Real-time Moderation Actions */}
            <div className="flex md:flex-col gap-2 justify-center shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
              {p.status === 'pending' && (
                <>
                  <button
                    onClick={() => approve(p._id)}
                    className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-none">
                    <CheckCircle size={14} /> Approve Listing
                  </button>
                  <button
                    onClick={() => setRM(p._id)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                    <XCircle size={14} /> Reject with Note
                  </button>
                </>
              )}

              {p.status === 'approved' && (
                <button
                  onClick={() => setRM(p._id)}
                  className="btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                  <ShieldAlert size={14} /> Suspend / Revoke
                </button>
              )}

              {p.status === 'rejected' && (
                <button
                  onClick={() => approve(p._id, true)}
                  className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-none">
                  <RotateCcw size={14} /> Re-Approve Property
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls (10 per page) */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>

          <div className="flex items-center gap-1">
            {[...Array(pagination.pages)].map((_, i) => {
              const pNum = i + 1
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === pNum
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                  {pNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Rejection / Suspension Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full border border-slate-200 shadow-2xl bg-white">
            <h3 className="font-bold text-lg text-slate-900 mb-1">
              {status === 'approved' ? 'Suspend Property Listing' : 'Rejection Feedback Note'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {status === 'approved'
                ? 'Specify the reason for suspending or revoking this property. It will immediately be taken down from public guest search.'
                : 'Provide constructive feedback to the hotel partner explaining why this property cannot be approved at this time.'}
            </p>
            <textarea
              className="input mb-4 text-sm"
              rows={4}
              placeholder="e.g. Incomplete fire safety documentation or updated room pricing needed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRM(null); setReason('') }}
                className="btn-secondary flex-1 py-2.5 text-sm font-semibold">
                Cancel
              </button>
              <button
                onClick={reject}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
                Confirm {status === 'approved' ? 'Suspension' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
