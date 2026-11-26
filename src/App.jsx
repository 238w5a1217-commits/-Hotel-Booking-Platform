import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts & Guards (eagerly loaded for instant shell)
import Navbar       from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

// Lazy-loaded feature routes for sub-second initial bundle load
const SearchPage       = lazy(() => import('./features/search/SearchPage'))
const LoginPage        = lazy(() => import('./features/auth/LoginPage'))
const RegisterPage     = lazy(() => import('./features/auth/RegisterPage'))
const HotelPage        = lazy(() => import('./features/properties/HotelPage'))
const BookingFlow      = lazy(() => import('./features/bookings/BookingFlow'))
const MyBookings       = lazy(() => import('./features/bookings/MyBookings'))
const BookingDetail    = lazy(() => import('./features/bookings/BookingDetail'))
const PartnerDashboard = lazy(() => import('./features/partner/PartnerDashboard'))
const AddProperty      = lazy(() => import('./features/partner/AddProperty'))
const ManageInventory  = lazy(() => import('./features/inventory/ManageInventory'))
const AdminDashboard   = lazy(() => import('./features/admin/AdminDashboard'))
const AdminProperties  = lazy(() => import('./features/admin/AdminProperties'))
const AdminBookings    = lazy(() => import('./features/admin/AdminBookings'))
const AdminUsers       = lazy(() => import('./features/admin/AdminUsers'))

function RouteFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Ajintara...</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/"           element={<SearchPage />} />
            <Route path="/login"      element={<LoginPage />} />
            <Route path="/register"   element={<RegisterPage />} />
            <Route path="/hotels/:id" element={<HotelPage />} />

            {/* Authenticated Routes (All Roles: Guest, Partner, Admin) */}
            <Route element={<PrivateRoute />}>
              <Route path="/bookings/:id" element={<BookingDetail />} />
            </Route>

            {/* Guest Protected Routes */}
            <Route element={<PrivateRoute role="guest" />}>
              <Route path="/book/:roomTypeId" element={<BookingFlow />} />
              <Route path="/my-bookings"      element={<MyBookings />} />
            </Route>

            {/* Partner Protected Routes */}
            <Route element={<PrivateRoute role="partner" />}>
              <Route path="/partner"                        element={<PartnerDashboard />} />
              <Route path="/partner/properties/new"        element={<AddProperty />} />
              <Route path="/partner/inventory/:propertyId" element={<ManageInventory />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<PrivateRoute role="admin" />}>
              <Route path="/admin"            element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/bookings"   element={<AdminBookings />} />
              <Route path="/admin/users"      element={<AdminUsers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
