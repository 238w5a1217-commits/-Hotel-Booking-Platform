import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Hotel, User, Mail, Lock, Phone, UserCheck, Shield } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guest', phone: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      setAuth(data.data.user, data.data.token)
      toast.success('Account created successfully!')
      navigate(data.data.user.role === 'partner' ? '/partner' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="card p-8 w-full max-w-md border border-slate-200/90 shadow-xl bg-white">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Hotel size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
          <p className="text-sm text-slate-500 mt-1">Join Ajintara as a guest traveler or hotel partner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="text"
                placeholder="Rohan Sharma"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="email"
                placeholder="rohan@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="password"
                placeholder="At least 6 characters"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              I am joining as
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'guest' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  form.role === 'guest'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}>
                <User size={18} className={form.role === 'guest' ? 'text-brand-600' : 'text-slate-400'} />
                <div>
                  <span className="block text-xs">Guest</span>
                  <span className="text-[10px] text-slate-400 font-normal">Book Stays</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'partner' })}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  form.role === 'partner'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}>
                <Hotel size={18} className={form.role === 'partner' ? 'text-brand-600' : 'text-slate-400'} />
                <div>
                  <span className="block text-xs">Hotel Partner</span>
                  <span className="text-[10px] text-slate-400 font-normal">List Hotels</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold gap-2 shadow-brand-500/25 mt-2">
            <UserCheck size={16} />
            <span>{loading ? 'Creating Account...' : 'Register on Ajintara'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
