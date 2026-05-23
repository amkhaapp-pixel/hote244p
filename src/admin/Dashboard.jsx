import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  Wallet,
  DoorOpen,
  TrendingUp,
  TrendingDown,
  Loader2,
  PlusCircle,
  CalendarCheck,
  Sparkles,
  MoreVertical,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';
import { formatCalendarDate } from '../utils/dates';

const initials = (name) => {
  if (!name) return '?';
  const p = String(name).trim().split(/\s+/);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
};

const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const { t } = useTranslation();
  const map = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };
  const labelMap = {
    paid: t('adminPanel.payments.approve') || 'Approve',
    pending: t('adminPanel.payments.pending') || 'Pending',
    cancelled: t('adminPanel.payments.reject') || 'Reject',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${map[s] || map.pending}`}
    >
      {labelMap[s] || s}
    </span>
  );
};

const CHART_HEIGHTS = ['h-32', 'h-40', 'h-24', 'h-48', 'h-56', 'h-64', 'h-40', 'h-36'];

function TrendPct({ value }) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return <span className="text-xs font-bold text-slate-400">—</span>;
  }
  if (n === 0) {
    return <span className="text-xs font-bold text-slate-500">0%</span>;
  }
  const up = n > 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-600' : 'text-red-600'}`}
    >
      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {up ? '+' : ''}
      {n}%
    </span>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/bookings'),
        ]);
        setStats(statsRes.data);
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data.slice(0, 6) : []);
      } catch (err) {
        console.error(err);
        setStats({
          bookingsToday: 0,
          revenueToday: 0,
          revenueMonth: 0,
          occupancyRate: 0,
          activeBookings: 0,
          bookingsTrendPct: 0,
          revenueTodayTrendPct: 0,
          revenueMonthTrendPct: 0,
          occupancyTrendPct: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[28rem] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#091426]" />
        <p className="text-sm font-medium text-slate-500">{t('adminPanel.dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="mb-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[#091426]">{t('adminPanel.dashboard.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('adminPanel.dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Calendar size={22} />
            </div>
            <TrendPct value={stats.bookingsTrendPct} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('adminPanel.dashboard.bookingsToday')}
          </p>
          <p className="text-3xl font-bold tracking-tight text-[#091426]">{stats.bookingsToday ?? 0}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CreditCard size={22} />
            </div>
            <TrendPct value={stats.revenueTodayTrendPct} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('adminPanel.dashboard.revenueToday')}
          </p>
          <p className="text-3xl font-bold tracking-tight text-[#091426]">{formatPrice(stats.revenueToday)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Wallet size={22} />
            </div>
            <TrendPct value={stats.revenueMonthTrendPct} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('adminPanel.dashboard.revenueMonth')}
          </p>
          <p className="text-3xl font-bold tracking-tight text-[#091426]">{formatPrice(stats.revenueMonth)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <DoorOpen size={22} />
            </div>
            <TrendPct value={stats.occupancyTrendPct} />
          </div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('adminPanel.dashboard.occupancyRate')}
          </p>
          <p className="text-3xl font-bold tracking-tight text-[#091426]">
            {stats.occupancyRate != null ? `${stats.occupancyRate}%` : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-[#091426]">{t('adminPanel.dashboard.revenueTrends')}</h3>
              <p className="text-sm text-slate-600">{t('adminPanel.dashboard.revenueTrendsDesc')}</p>
            </div>
            <select className="rounded-lg border border-slate-200 text-sm outline-none ring-[#091426]/20 focus:border-[#091426] focus:ring-2">
              <option>{t('adminPanel.dashboard.last30Days')}</option>
              <option>{t('adminPanel.dashboard.last7Days')}</option>
              <option>{t('adminPanel.dashboard.lastMonth')}</option>
            </select>
          </div>
          <div className="flex h-64 items-end justify-between gap-2">
            {CHART_HEIGHTS.map((h, i) => {
              const shades = [
                'bg-blue-50 hover:bg-blue-100',
                'bg-blue-100 hover:bg-blue-200',
                'bg-blue-200 hover:bg-blue-300',
                'bg-blue-300 hover:bg-blue-400',
                'bg-blue-400 hover:bg-blue-500',
                'bg-[#091426] hover:opacity-90',
                'bg-blue-400 hover:bg-blue-500',
                'bg-blue-200 hover:bg-blue-300',
              ];
              return (
                <div
                  key={i}
                  className={`group relative w-full cursor-pointer rounded-t transition-colors ${h} ${shades[i]}`}
                />
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>{t('adminPanel.dashboard.week1')}</span>
            <span>{t('adminPanel.dashboard.week2')}</span>
            <span>{t('adminPanel.dashboard.week3')}</span>
            <span>{t('adminPanel.dashboard.week4')}</span>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-[#091426]">{t('adminPanel.dashboard.quickActions')}</h3>
          <div className="flex flex-1 flex-col space-y-4">
            <Link
              to="/admin/bookings"
              className="group flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <PlusCircle size={22} />
                </span>
                <span className="text-sm font-semibold text-slate-700">{t('adminPanel.dashboard.newBooking')}</span>
              </div>
              <ChevronRight className="text-slate-300 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
            <Link
              to="/admin/bookings"
              className="group flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <CalendarCheck size={22} />
                </span>
                <span className="text-sm font-semibold text-slate-700">{t('adminPanel.dashboard.checkInGuest')}</span>
              </div>
              <ChevronRight className="text-slate-300 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
            <Link
              to="/admin/rooms"
              className="group flex w-full items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Sparkles size={22} />
                </span>
                <span className="text-sm font-semibold text-slate-700">{t('adminPanel.dashboard.serviceRequest')}</span>
              </div>
              <ChevronRight className="text-slate-300 transition-transform group-hover:translate-x-1" size={20} />
            </Link>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{t('adminPanel.dashboard.systemStatus')}</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">{t('adminPanel.dashboard.allSystemsOperational')}</p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-8 py-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-[#091426]">{t('adminPanel.dashboard.latestBookings')}</h3>
            <p className="text-sm text-slate-600">{t('adminPanel.dashboard.latestBookingsDesc')}</p>
          </div>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            {t('adminPanel.dashboard.viewAll')} <ExternalLink size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                {[t('adminPanel.dashboard.guestName'), t('adminPanel.dashboard.room'), t('adminPanel.dashboard.checkIn'), t('adminPanel.dashboard.checkOut'), t('adminPanel.dashboard.amount'), t('adminPanel.dashboard.status'), t('adminPanel.dashboard.action')].map(
                  (h, idx) => (
                    <th
                      key={h}
                      className={`px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                        idx === 6 ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-sm text-slate-500">
                    {t('adminPanel.dashboard.noBookings')}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#091426] text-xs font-bold text-white">
                          {initials(b.customer_name)}
                        </div>
                        <span className="text-sm font-medium text-[#091426]">{b.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-600">{b.room_name}</td>
                    <td className="px-8 py-4 text-sm text-slate-600">
                      {b.check_in ? formatCalendarDate(b.check_in) : '—'}
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-600">
                      {b.check_out ? formatCalendarDate(b.check_out) : '—'}
                    </td>
                    <td className="px-8 py-4 text-sm font-medium text-[#091426]">
                      {formatPrice(b.total_price)}
                    </td>
                    <td className="px-8 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Link
                        to="/admin/bookings"
                        className="inline-flex text-slate-400 transition-colors hover:text-[#091426]"
                        aria-label="More"
                      >
                        <MoreVertical size={20} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
