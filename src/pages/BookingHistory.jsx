import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, ReceiptText, Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';
import api from '../api/axios';
import { formatCalendarDate } from '../utils/dates';

export default function BookingHistory() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  useEffect(() => {
    if (user?.email) {
      const fetchBookings = async () => {
        try {
          const response = await api.get(`/booking/my-bookings?email=${user.email}`);
          setBookings(response.data);
        } catch (err) {
          console.error('Error fetching bookings:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: <CheckCircle2 size={14} /> };
      case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-900', icon: <Clock size={14} /> };
      case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle size={14} /> };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: null };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return t('adminPanel.payments.approve') || 'Paid';
      case 'pending': return t('adminPanel.payments.pending') || 'Pending';
      case 'cancelled': return t('adminPanel.payments.reject') || 'Cancelled';
      default: return status;
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-3xl font-bold text-gray-900">{t('profile.bookingHistory')}</h1>
        <p className="text-gray-600 mt-2">
          {t('profile.loggedInAs')} <span className="font-semibold text-gray-900">{user.name}</span>
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <CalendarDays size={22} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('profile.recentBookings')}</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <p className="text-gray-700 font-bold text-lg mb-2">{t('profile.noBookingsTitle')}</p>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t('profile.noBookingsDesc')}</p>
                <Link
                  to="/rooms"
                  className="inline-flex items-center rounded-xl bg-primary px-8 py-3 text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
                >
                  {t('profile.exploreRooms')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const status = getStatusStyle(booking.status);
                  return (
                    <div key={booking.id} className="group border border-gray-100 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img 
                            src={booking.room_image || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80"} 
                            alt={booking.room_name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{booking.room_name}</h3>
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${status.bg} ${status.text}`}>
                                {status.icon}
                                {getStatusLabel(booking.status)}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Booking ID: {booking.id} • {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {booking.special_requests && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-xl">
                                <p className="text-xs font-semibold text-gray-700 mb-1">{t('booking.specialRequests')}</p>
                                <p className="text-sm text-gray-600">{booking.special_requests}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-xs text-gray-600">
                                <span className="block font-medium">
                                   {formatCalendarDate(booking.check_in)} - {formatCalendarDate(booking.check_out)}
                                </span>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-gray-400">Total Price</p>
                                <p className="font-bold text-gray-900">{formatPrice(booking.total_price)}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
