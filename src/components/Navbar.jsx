import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Hotel, LogOut, LayoutDashboard, Menu, X, Compass, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardLink = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'partner'
    ? '/partner'
    : '/my-bookings'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Brand Glow */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Hotel size={22} />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Ajintara
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/50">
                Stays
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/') ? 'text-brand-600 bg-brand-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}>
              <Compass size={16} />
              <span>Explore Stays</span>
            </Link>

            {token ? (
              <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
                <Link
                  to={dashboardLink}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    location.pathname.startsWith(dashboardLink)
                      ? 'text-brand-600 bg-brand-50/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>

                {/* User Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[100px] truncate">{user?.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="capitalize font-medium text-brand-600">{user?.role}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-slate-200">
                <Link to="/login" className="btn-secondary text-xs px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">
                  Join Ajintara
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden py-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Explore Stays
            </Link>
            {token ? (
              <>
                <Link
                  to={dashboardLink}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Dashboard ({user?.role})
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setOpen(false)
                  }}
                  className="px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-xs flex-1 text-center">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-xs flex-1 text-center">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
