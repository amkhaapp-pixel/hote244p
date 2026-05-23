import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, Calendar, MapPin, Mail, ArrowRight, Download, Loader2, MessageCircle, Phone, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import api from '../api/axios';
import { formatCalendarDate } from '../utils/dates';
import { clearBookingDraft, clearBookingSession } from '../utils/bookingDraft';

export default function Success() {
  const { t } = useTranslation();
  const location = useLocation();
  const { booking: stateBooking, bookingId: stateBookingId, roomName: stateRoomName, paymentTime: statePaymentTime } = location.state || {};

  const [booking, setBooking] = useState(stateBooking);
  const [roomName, setRoomName] = useState(stateRoomName);
  const [loading, setLoading] = useState(!stateBooking && !!stateBookingId);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [showContactAlert, setShowContactAlert] = useState(false);
  const bookingId = booking?.id || stateBookingId;
  const APPROVAL_TIMEOUT = 600; // 10 minutes in seconds

  useEffect(() => {
    if (booking?.room_id) {
      clearBookingDraft(booking.room_id);
      clearBookingSession();
    }
  }, [booking?.room_id]);

  useEffect(() => {
    if (!booking && bookingId) {
      const fetchBooking = async () => {
        try {
          const response = await api.get(`/booking/${bookingId}`);
          setBooking(response.data);
          if (!roomName) setRoomName(response.data.room_name);
        } catch (err) {
          console.error('Error fetching booking:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [booking, bookingId, roomName]);

  // Initialize countdown from payment time (from localStorage or state)
  useEffect(() => {
    if (!bookingId) return;

    // Try to get payment time from localStorage first
    const storedPaymentTime = localStorage.getItem(`paymentTime_${bookingId}`);
    let paymentTime = null;

    if (storedPaymentTime) {
      paymentTime = parseInt(storedPaymentTime, 10);
    } else if (statePaymentTime) {
      paymentTime = new Date(statePaymentTime).getTime();
    }

    if (paymentTime) {
      const now = Date.now();
      const elapsed = Math.floor((now - paymentTime) / 1000);
      const remaining = Math.max(0, APPROVAL_TIMEOUT - elapsed);
      setCountdown(remaining);
      if (remaining <= 0) {
        setShowContactAlert(true);
      }
    }
  }, [bookingId, statePaymentTime]);

  // Countdown timer for admin approval (10 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setShowContactAlert(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!bookingId && !loading) {
    return <div className="p-20 text-center">{t('success.noData')}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-20 flex items-center justify-center">
      <div className="max-w-2xl w-full px-4 text-center">

        {/* Success Icon Animation */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 text-amber-600 mb-8 animate-pulse">
           <Clock size={48} strokeWidth={3} />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">{t('success.title')}</h1>
        <p className="text-lg text-gray-500 mb-6 max-w-md mx-auto">
          {t('success.thankYou', { roomName })}
        </p>

        {/* Admin Approval Countdown */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
          <p className="text-sm text-blue-700 font-medium mb-2">
            {t('success.awaitingApproval') || 'Awaiting admin approval'}
          </p>
          {!showContactAlert ? (
            <div className="flex items-center justify-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <span className="text-2xl font-mono font-bold text-blue-700">
                {formatCountdown(countdown)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">
                {t('success.approvalTimeout') || 'Approval time exceeded'}
              </span>
            </div>
          )}
          <p className="text-xs text-blue-500 mt-2">
            {t('success.approvalNote') || 'Please wait while we verify your payment'}
          </p>
        </div>

        {/* Contact Alert - Show when countdown reaches 0 */}
        {showContactAlert && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
              <AlertTriangle size={20} />
              <h3 className="font-bold">{t('success.contactAdmin') || 'Please contact admin'}</h3>
            </div>
            <p className="text-sm text-amber-600 mb-4">
              {t('success.contactNote') || 'Your payment is still pending approval. Please contact us for assistance.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/8562099197067"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors w-full sm:w-auto justify-center"
              >
                <MessageCircle size={18} />
                {t('success.whatsapp') || 'WhatsApp'}
              </a>
              <a
                href="https://m.me/amkha.vilaytha"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center"
              >
                <Phone size={18} />
                {t('success.facebook') || 'Facebook Messenger'}
              </a>
            </div>
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 mb-10 text-left shadow-sm">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <div>
                 <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">{t('success.bookingId')}</p>
                 <p className="text-2xl font-mono font-bold text-gray-900">{bookingId}</p>
              </div>
              <button className="flex items-center gap-2 text-primary hover:text-blue-800 font-bold transition-colors text-sm opacity-50 cursor-not-allowed">
                 <Download size={18} />
                 {t('success.downloadReceipt')}
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-1" size={18} />
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">{t('success.dates')}</p>
                       <p className="text-gray-900 font-medium">
                        {formatCalendarDate(booking.check_in)} - {formatCalendarDate(booking.check_out)}
                       </p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={18} />
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">{t('success.location')}</p>
                       <p className="text-gray-900 font-medium">{t('success.locationText')}</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-1" size={18} />
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase">{t('success.status')}</p>
                       <p className="text-amber-600 font-bold">{t('success.pending')}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link
            to="/"
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
           >
              {t('success.returnHome')}
           </Link>
           <Link
            to="/rooms"
            className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
           >
              {t('success.exploreMore')}
              <ArrowRight size={18} />
           </Link>
        </div>

      </div>
    </div>
  );
}
