import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Hotel, Mail, Lock, LogIn, KeyRound, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.data.user, data.data.token)
      toast.success(`Welcome back, ${data.data.user.name}!`)
      const role = data.data.user.role
      navigate(role === 'admin' ? '/admin' : role === 'partner' ? '/partner' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickAccount = (email, password) => {
    setForm({ email, password })
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="card p-8 w-full max-w-md border border-slate-200/90 shadow-xl bg-white">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <Hotel size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to Ajintara</h2>
          <p className="text-sm text-slate-500 mt-1">Access your bookings, hotel properties, or dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                className="input pl-10"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold gap-2 shadow-brand-500/25">
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>

        {/* 1-Click Demo Accounts with Lucide Icons */}
        <div className="mt-8 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            <KeyRound size={14} className="text-brand-600" />
            <span>1-Click Test Login Accounts</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillQuickAccount('guest@ajintara.com', 'Guest@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors">
              <span className="font-semibold text-slate-800 block">Guest</span>
              <span className="text-[10px] text-slate-400">Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('partner@ajintara.com', 'Partner@123')}
              className="p-2 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200/60 text-left transition-colors">
              <span className="font-semibold text-brand-700 block">Partner</span>
              <span className="text-[10px] text-brand-500">Hotels</span>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('admin@ajintara.com', 'Admin@123')}
              className="p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60 text-left transition-colors">
              <span className="font-semibold text-purple-700 block">Admin</span>
              <span className="text-[10px] text-purple-500">Approvals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
