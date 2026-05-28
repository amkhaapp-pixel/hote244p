import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Loader2,
  Pencil,
  RefreshCw,
  Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatCalendarDate, nightsBetween, parseCalendarDate } from '../utils/dates';

const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const { t } = useTranslation();
  const map = {
    paid: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-900',
    cancelled: 'bg-red-100 text-red-800',
  };
  const labelMap = {
    paid: t('adminPanel.payments.approve') || 'Approve',
    pending: t('adminPanel.payments.pending') || 'Pending',
    cancelled: t('adminPanel.payments.reject') || 'Reject',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${map[s] || map.pending}`}>
      {labelMap[s] || s}
    </span>
  );
};

function initials(name) {
  if (!name) return '?';
  const p = String(name).trim().split(/\s+/);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
}

export default function BookingManagement() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roomType, setRoomType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/rooms'),
      ]);
      setBookings(Array.isArray(bRes.data) ? bRes.data : []);
      setRooms(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      load();
    } catch {
      toast.error(t('adminPanel.bookings.failedUpdate'));
    }
  };

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return bookings.filter((b) => {
      if (q) {
        const hay = [
          b.customer_name,
          b.customer_email,
          b.customer_phone,
          String(b.id),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter && (b.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (roomType && b.room_name !== roomType) return false;
      if (dateFrom) {
        const cin = parseCalendarDate(b.check_in);
        const from = parseCalendarDate(dateFrom);
        if (!cin || !from || cin < from) return false;
      }
      if (dateTo) {
        const cin = parseCalendarDate(b.check_in);
        const end = parseCalendarDate(dateTo);
        if (!cin || !end || cin > end) return false;
      }
      return true;
    });
  }, [bookings, searchTerm, statusFilter, roomType, dateFrom, dateTo]);

  const exportCsv = () => {
    const headers = [t('adminPanel.bookings.bookingId'), t('adminPanel.bookings.customerName'), 'Email', t('adminPanel.bookings.roomTypeLabel'), t('adminPanel.bookings.checkInOut'), t('adminPanel.bookings.checkInOut'), 'Total', t('adminPanel.bookings.status'), t('booking.specialRequests')];
    const rows = filteredBookings.map((b) => [
      b.id,
      b.customer_name,
      b.customer_email,
      b.room_name,
      b.check_in,
      b.check_out,
      b.total_price,
      b.status,
      b.special_requests || '',
    ]);
    const esc = (c) => `"${String(c ?? '').replace(/"/g, '""')}"`;
    const body = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#091426]" />
        <p className="text-sm text-slate-500">{t('adminPanel.bookings.loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#091426]">{t('adminPanel.bookings.title')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('adminPanel.bookings.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus size={20} strokeWidth={2.5} />
            {t('adminPanel.bookings.newBooking')}
          </Link>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t('adminPanel.bookings.exportCsv')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="w-full min-w-[200px]">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('adminPanel.bookings.search')}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder={t('adminPanel.bookings.searchPlaceholder')}
                className="w-full rounded-lg border border-slate-200 bg-[#f5f3f4] py-2 pl-10 pr-3 text-sm outline-none ring-[#091426]/20 placeholder:text-slate-400 focus:border-transparent focus:ring-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('adminPanel.bookings.dateRange')}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[140px] flex-1">
                <Calendar className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-[#091426]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <span className="text-slate-400">–</span>
              <div className="relative min-w-[140px] flex-1">
                <Calendar className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-sm outline-none focus:ring-1 focus:ring-[#091426]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="w-full min-w-[160px] sm:w-48">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('adminPanel.bookings.roomType')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#091426]"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">{t('adminPanel.bookings.allTypes')}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full min-w-[160px] sm:w-48">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('adminPanel.bookings.status')}
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#091426]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('adminPanel.bookings.allStatuses')}</option>
              <option value="paid">{t('adminPanel.bookings.paid')}</option>
              <option value="pending">{t('adminPanel.bookings.pending')}</option>
              <option value="cancelled">{t('adminPanel.bookings.cancelled')}</option>
            </select>
          </div>
          <button
            type="button"
            disabled
            title={t('adminPanel.bookings.comingSoon')}
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400"
          >
            <Filter size={18} />
            {t('adminPanel.bookings.moreFilters')}
          </button>
        </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f5f3f4]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.bookings.bookingId')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.bookings.customerName')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.bookings.roomTypeLabel')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.bookings.checkInOut')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.bookings.status')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('booking.specialRequests')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => {
                const nights = nightsBetween(booking.check_in, booking.check_out);
                const sub = booking.customer_email || booking.customer_phone || '';
                return (
                  <tr key={booking.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-5 font-medium text-[#091426]">{booking.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8e3fb] text-xs font-bold text-[#091426]">
                          {initials(booking.customer_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#091426]">{booking.customer_name}</p>
                          <p className="text-xs text-slate-500">{sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{booking.room_name} x{booking.room_count || 1}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-[#091426]">
                        {formatCalendarDate(booking.check_in)} – {formatCalendarDate(booking.check_out)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(booking.room_count || 1) > 1 && (
                          <span>{booking.room_count} {t('rooms.roomPlural')} · </span>
                        )}
                        {nights} {nights === 1 ? t('adminPanel.bookings.night') : t('adminPanel.bookings.nights')}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-5">
                      {booking.special_requests ? (
                        <p className="text-xs text-slate-600 max-w-xs line-clamp-2">{booking.special_requests}</p>
                      ) : (
                        <span className="text-xs text-slate-400 italic">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                    {t('adminPanel.bookings.noBookingsMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
