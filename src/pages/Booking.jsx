import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, Info, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';
import { formatCalendarDate, nightsBetween } from '../utils/dates';
import {
  saveBookingDraft,
  saveBookingSession,
  resolveBookingSession,
} from '../utils/bookingDraft';

const formatDateLocal = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function defaultFormData(savedForm) {
  if (savedForm) return savedForm;
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return {
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    requests: '',
  };
}

export default function Booking() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(() => resolveBookingSession(location.state));
  const { roomId, price, roomName, roomImage, checkIn, checkOut, guests, roomCount } = session;
  const rooms = Math.max(1, Number(roomCount) || 1);

  const [formData, setFormData] = useState(() =>
    defaultFormData(resolveBookingSession(location.state).formData)
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.roomId) {
      setSession((prev) => ({ ...prev, ...location.state }));
    }
  }, [location.state]);

  useEffect(() => {
    if (!roomId) return;
    const payload = {
      roomId,
      price,
      roomName,
      roomImage,
      checkIn,
      checkOut,
      guests,
      roomCount,
      formData,
    };
    saveBookingSession(payload);
    if (checkIn && checkOut) {
      saveBookingDraft(roomId, { checkIn, checkOut, guests, roomCount });
    }
  }, [roomId, price, roomName, roomImage, checkIn, checkOut, guests, roomCount, formData]);

  const handleBack = () => {
    if (!roomId) {
      navigate('/rooms');
      return;
    }
    navigate(`/rooms/${roomId}`, {
      state: { checkIn, checkOut, guests, roomCount },
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = t('booking.firstName') + ' ' + t('common.error');
    if (!formData.lastName) newErrors.lastName = t('booking.lastName') + ' ' + t('common.error');
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = t('booking.email') + ' ' + t('common.error');
    }
    if (!formData.phone) newErrors.phone = t('booking.phone') + ' ' + t('common.error');
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setIsSubmitting(true);
      try {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          roomId: roomId,
          checkIn: checkIn || formatDateLocal(new Date()),
          checkOut: checkOut || formatDateLocal(new Date(Date.now() + 86400000)),
          roomCount: rooms,
        };
        const response = await api.post('/booking', payload);

        navigate('/payment', { state: { booking: response.data, roomName } });
      } catch (err) {
        console.error('Error creating booking:', err);
        const backendMessage = err.response?.data?.message;

        if (backendMessage === 'Room is already booked for these dates') {
          toast.error(t('booking.alreadyBooked'));
        } else if (backendMessage === 'Not enough rooms available') {
          toast.error(t('booking.notEnoughRooms'));
        } else if (backendMessage === 'This room is temporarily unavailable for maintenance') {
          toast.error(t('booking.maintenance'));
        } else {
          toast.error(backendMessage || t('common.error'));
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!localStorage.getItem('user')) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: '/booking', bookingData: resolveBookingSession(location.state) }}
      />
    );
  }

  if (!roomId) {
    return (
      <div className="p-20 text-center">
        {t('booking.noRoomSelected')}{' '}
        <a href="/" className="text-primary underline">
          {t('booking.home')}
        </a>
        .
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.max(1, nightsBetween(checkIn, checkOut)) : 1;
  const totalPrice = Number(price) * nights * rooms;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} />
          {t('booking.back')}
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('booking.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  1
                </div>
                <span>{t('booking.stepInfo')}</span>
              </div>
              <div className="h-px bg-gray-300 w-12" />
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">2</div>
                <span>{t('booking.stepPayment')}</span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6"
            >
              <h2 className="text-xl font-bold border-b pb-4">{t('booking.guestInfo')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('booking.firstName')}
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    placeholder={t('booking.firstName')}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('booking.lastName')}
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    placeholder={t('booking.lastName')}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.email')}</label>
                  <input
                    type="email"
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.phone')}</label>
                  <input
                    type="tel"
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                    placeholder="08X-XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('booking.specialRequests')}
                </label>
                <textarea
                  rows="3"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={t('booking.requestPlaceholder')}
                  value={formData.requests}
                  onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-700">
                <Info size={20} className="shrink-0" />
                <p>{t('booking.privacy')}</p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('booking.back')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 text-white py-4 rounded-xl font-bold transition-all shadow-lg text-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-800 shadow-blue-900/20'}`}
                >
                  {isSubmitting ? t('booking.creating') : t('booking.continuePayment')}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-6">{t('booking.summary')}</h2>

              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={
                        roomImage ||
                        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80'
                      }
                      alt="Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{roomName}</h4>
                    <p className="text-sm text-gray-500">
                      {rooms} {rooms === 1 ? t('rooms.roomSingular') : t('rooms.roomPlural')}
                      {' \u00b7 '}
                      {nights} {nights > 1 ? t('adminPanel.bookings.nights') : t('adminPanel.bookings.night')}
                      {' \u00b7 '}
                      {t('rooms.guestCount', { count: guests || 1 })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-4 border-b border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('booking.checkIn')}</span>
                    <span className="font-medium text-gray-900">
                      {checkIn ? formatCalendarDate(checkIn) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('booking.checkOut')}</span>
                    <span className="font-medium text-gray-900">
                      {checkOut ? formatCalendarDate(checkOut) : '-'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('booking.basePrice')}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('booking.roomCountLabel')}</span>
                    <span className="font-medium text-gray-900">
                      {rooms} {rooms === 1 ? t('rooms.roomSingular') : t('rooms.roomPlural')}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-gray-900 mt-4 pt-4 border-t border-gray-100">
                    <span>{t('booking.total')}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-green-600 font-medium mt-6 bg-green-50 p-2 rounded-lg">
                  <ShieldCheck size={14} />
                  <span>{t('booking.secure')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

