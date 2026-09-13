import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import Landing from '../pages/Landing';
import ServiceDetail from '../pages/ServiceDetail';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminServices from '../pages/admin/AdminServices';
import AdminSlots from '../pages/admin/AdminSlots';
import AdminFormBuilder from '../pages/admin/AdminFormBuilder';
import AdminBookings from '../pages/admin/AdminBookings';
import BookingPage from '../pages/BookingPage';
import UserDashboard from '../pages/UserDashboard';

export default function AppRoutes() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/book/:serviceId" element={
            <ProtectedRoute><BookingPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="forms" element={<AdminFormBuilder />} />
          </Route>
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}