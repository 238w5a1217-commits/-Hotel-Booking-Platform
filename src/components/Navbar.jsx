import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Hotel, LogOut, LayoutDashboard, Menu, X, Compass, User, CalendarDays, Shield, Building } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const dashboardLink = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'partner'
    ? '/partner'
    : '/my-bookings'

  const dashboardLabel = user?.role === 'admin'
    ? 'Admin Console'
    : user?.role === 'partner'
    ? 'Partner Portal'
    : 'My Bookings'

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Brand Glow */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Hotel size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Ajintara
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/50">
                Stays
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive('/') ? 'text-brand-600 bg-brand-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
                      ? 'text-brand-600 bg-brand-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}>
                  <LayoutDashboard size={16} />
                  <span>{dashboardLabel}</span>
                </Link>

                {/* User Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[100px] truncate">{user?.name}</span>
                  <span className="text-slate-300">·</span>
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
            type="button"
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation">
            {open ? <X size={22} className="text-slate-900" /> : <Menu size={22} className="text-slate-900" />}
          </button>
        </div>

        {/* Mobile dropdown drawer */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 animate-fadeIn space-y-3">
            {token && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold capitalize bg-brand-100 text-brand-700">
                  {user?.role}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1 text-sm font-semibold">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive('/') ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:bg-slate-50'
                }`}>
                <Compass size={18} />
                <span>Explore Stays</span>
              </Link>

              {token ? (
                <>
                  <Link
                    to={dashboardLink}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-colors ${
                      location.pathname.startsWith(dashboardLink) ? 'text-brand-600 bg-brand-50' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <LayoutDashboard size={18} />
                    <span>{dashboardLabel}</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      <Link to="/admin/properties" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs pl-8">
                        <Building size={14} /> Review Properties
                      </Link>
                      <Link to="/admin/bookings" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs pl-8">
                        <CalendarDays size={14} /> All Bookings
                      </Link>
                      <Link to="/admin/users" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs pl-8">
                        <Shield size={14} /> User Accounts
                      </Link>
                    </>
                  )}

                  {user?.role === 'partner' && (
                    <Link to="/partner/properties/new" className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-xs pl-8">
                      + Add New Hotel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3.5 py-2.5 text-left font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-2">
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <Link to="/login" className="btn-secondary text-xs py-2.5 text-center">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary text-xs py-2.5 text-center">
                    Join Ajintara
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
