import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Building2 } from 'lucide-react'

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export default function AdminProperties() {
  const [status, setStatus]  = useState('pending')
  const [rejectModal, setRM] = useState(null)
  const [reason, setReason]  = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', status],
    queryFn: async () => { const { data } = await api.get('/admin/properties', { params: { status } }); return data },
  })

  const approve = async (id) => {
    try {
      await api.patch(`/admin/properties/${id}/approve`)
      toast.success('Property approved and live on platform!'); qc.invalidateQueries(['admin-properties'])
    } catch { toast.error('Failed to approve property') }
  }

  const reject = async () => {
    if (!reason.trim()) return toast.error('Please enter a rejection reason')
    try {
      await api.patch(`/admin/properties/${rejectModal}/reject`, { reason })
      toast.success('Property rejected with note'); qc.invalidateQueries(['admin-properties'])
      setRM(null); setReason('')
    } catch { toast.error('Failed to reject property') }
  }

  const properties = data?.data || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Partner Properties</h1>
        <div className="flex gap-2">
          {['pending','approved','rejected'].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${status === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-gray-400">Loading properties...</p>}
      {!isLoading && properties.length === 0 && (
        <div className="card p-12 text-center text-gray-400">No {status} properties found.</div>
      )}

      <div className="space-y-4">
        {properties.map((p) => (
          <div key={p._id} className="card p-5 flex gap-4">
            <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><Building2 size={26} /></div>}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{p.city} · Partner: {p.partner?.name} ({p.partner?.email})</p>
                </div>
                <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
              {p.rejectionReason && <p className="text-xs text-red-500 mt-1 font-medium">Rejection Reason: {p.rejectionReason}</p>}
            </div>
            {p.status === 'pending' && (
              <div className="flex flex-col gap-2 justify-center">
                <button onClick={() => approve(p._id)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium">
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => setRM(p._id)} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="font-semibold text-lg mb-3">Rejection Feedback</h3>
            <textarea className="input mb-4" rows={3} placeholder="Provide specific reason for rejection..."
              value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setRM(null); setReason('') }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={reject} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

