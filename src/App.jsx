import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts & Guards
import Navbar       from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

// Features
import LoginPage        from './features/auth/LoginPage'
import RegisterPage     from './features/auth/RegisterPage'
import SearchPage       from './features/search/SearchPage'
import HotelPage        from './features/properties/HotelPage'
import BookingFlow      from './features/bookings/BookingFlow'
import MyBookings       from './features/bookings/MyBookings'
import BookingDetail    from './features/bookings/BookingDetail'
import PartnerDashboard from './features/partner/PartnerDashboard'
import AddProperty      from './features/partner/AddProperty'
import ManageInventory  from './features/inventory/ManageInventory'
import AdminDashboard   from './features/admin/AdminDashboard'
import AdminProperties  from './features/admin/AdminProperties'
import AdminBookings    from './features/admin/AdminBookings'
import AdminUsers       from './features/admin/AdminUsers'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen">
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
      </main>
    </BrowserRouter>
  )
}

