import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './i18n/LanguageProvider';
import Layout from './components/layout/Layout';
import AdminRoute from './components/auth/AdminRoute';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Success from './pages/Success';
import Facilities from './pages/Facilities';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import BookingManagement from './admin/BookingManagement';
import RoomManagement from './admin/RoomManagement';
import CustomerManagement from './admin/CustomerManagement';
import PaymentManagement from './admin/PaymentManagement';
import SettingsManagement from './admin/SettingsManagement';
import MessageManagement from './admin/MessageManagement';

export default function App() {
  return (
    <LanguageProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="rooms/:id" element={<RoomDetail />} />
            <Route path="booking" element={<Booking />} />
            <Route path="payment" element={<Payment />} />
            <Route path="success" element={<Success />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="my-bookings" element={<BookingHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes - /admin/login redirects to unified /login */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="settings" element={<SettingsManagement />} />
            <Route path="messages" element={<MessageManagement />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
