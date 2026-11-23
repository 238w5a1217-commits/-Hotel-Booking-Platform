import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, PlusCircle, Building2, MapPin, FileText, Star, Sparkles, Image, Info } from 'lucide-react'

export default function AddProperty() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', city: '', address: '', description: '',
    starRating: 3, amenities: '', images: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        images:    form.images.split(',').map((s) => s.trim()).filter(Boolean),
      }
      await api.post('/properties', payload)
      toast.success('Property submitted! It is now pending admin approval.')
      navigate('/partner')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/partner')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 font-medium text-sm transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="card p-8 border border-slate-200/90 shadow-lg bg-white">
        <div className="mb-6 pb-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">List a New Property</h1>
            <p className="text-xs text-slate-500 mt-0.5">Submit your hotel details for verification by the Ajintara team.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 size={13} className="text-slate-400" /> Property Name
              </label>
              <input className="input" placeholder="e.g. The Grand Palace Resort" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" /> City
              </label>
              <input className="input" placeholder="e.g. Goa, Mumbai, Hyderabad" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" /> Full Street Address
            </label>
            <input className="input" placeholder="e.g. Calangute Beach Road, North Goa 403516" required value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Property Overview / Description
            </label>
            <textarea className="input" rows={4} placeholder="Describe the hotel ambiance, location proximity, and special highlights..." required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Star size={13} className="text-slate-400" /> Star Classification
            </label>
            <select className="input" value={form.starRating} onChange={(e) => setForm({...form, starRating: +e.target.value})}>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} Star Luxury Hotel</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-slate-400" /> Key Amenities (comma-separated)
            </label>
            <input className="input" placeholder="WiFi, Swimming Pool, AC, Complimentary Breakfast, Spa" value={form.amenities}
              onChange={(e) => setForm({...form, amenities: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Image size={13} className="text-slate-400" /> Image URLs (comma-separated)
            </label>
            <textarea className="input" rows={2} placeholder="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
              value={form.images} onChange={(e) => setForm({...form, images: e.target.value})} />
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              New properties undergo administrative review to ensure listing quality. Once approved by an Admin, your property and its room inventory become immediately bookable by guests.
            </span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-brand-500/20">
            <PlusCircle size={18} /> {loading ? 'Submitting for Review...' : 'Submit Property for Approval'}
          </button>
        </form>
      </div>
    </div>
  )
}
