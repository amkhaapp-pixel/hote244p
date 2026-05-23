import { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Loader2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Calendar,
  AlertCircle,
  ImageIcon,
  Eye,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';

const formatDateLocal = (dateStr) => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, monthIdx, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const { t } = useTranslation();
  const map = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${map[s] || map.pending}`}>
      {s === 'paid' && <CheckCircle2 size={12} />}
      {s === 'pending' && <Clock size={12} />}
      {s === 'cancelled' && <XCircle size={12} />}
      {t(`adminPanel.payments.${s}`) || s}
    </span>
  );
};

const StatusDropdown = ({ status, onChange, disabled }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'pending', label: t('adminPanel.payments.pending') || 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    { value: 'completed', label: t('adminPanel.payments.approve') || 'Approve', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Check },
    { value: 'failed', label: t('adminPanel.payments.reject') || 'Reject', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: X },
  ];

  const currentOption = options.find(o => o.value === status) || options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${currentOption.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-95'}`}
      >
        <CurrentIcon size={12} />
        {currentOption.label}
        <svg className={`w-3 h-3 ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-32 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-bold transition-colors hover:bg-slate-50 ${
                  option.value === status ? 'bg-slate-50 text-slate-900' : 'text-slate-600'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${option.color}`}>
                  <Icon size={10} />
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

function TrendPct({ value }) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return <span className="text-xs font-bold text-slate-400">—</span>;
  const up = n > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {up ? '+' : ''}{n}%
    </span>
  );
}

export default function PaymentManagement() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/stats')
      ]);
      setPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/payments/${id}/status`, { status });
      const statusMessages = {
        'completed': t('adminPanel.payments.approved') || 'Payment approved',
        'failed': t('adminPanel.payments.rejected') || 'Payment rejected',
        'pending': t('adminPanel.payments.pendingSet') || 'Payment set to pending'
      };
      toast.success(statusMessages[status] || 'Status updated');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t('adminPanel.payments.statusFailed') || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPayments = payments.filter(p =>
    p.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex h-[28rem] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#091426]" />
        <p className="text-sm font-medium text-slate-500">{t('adminPanel.payments.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#091426]">{t('adminPanel.payments.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('adminPanel.payments.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <Download size={18} />
            {t('adminPanel.payments.statements')}
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp size={22} />
            </div>
            <TrendPct value={stats?.revenueTodayTrendPct} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.revenueToday')}</p>
          <p className="text-2xl font-bold text-[#091426]">{formatPrice(stats?.revenueToday)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <CreditCard size={22} />
            </div>
            <TrendPct value={stats?.revenueMonthTrendPct} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.revenueMonth')}</p>
          <p className="text-2xl font-bold text-[#091426]">{formatPrice(stats?.revenueMonth)}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock size={22} />
            </div>
            <TrendPct value={stats?.bookingsTrendPct} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.bookingsTrend')}</p>
          <p className="text-2xl font-bold text-[#091426]">
            {stats?.bookingsToday ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-slate-50 p-2 text-slate-600">
              <Calendar size={22} />
            </div>
            <TrendPct value={stats?.occupancyTrendPct} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.occupancyTrend')}</p>
          <p className="text-2xl font-bold text-[#091426]">{stats?.occupancyRate}%</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('adminPanel.payments.searchPlaceholder')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#091426]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              <Filter size={18} className="inline mr-2" />
              {t('adminPanel.payments.status')}
            </button>
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              {t('adminPanel.payments.today')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.transactionId')}</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.guestRoom')}</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.date')}</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.amount')}</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.slip') || 'Slip'}</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.payments.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                      #{p.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[#091426]">{p.customer_name}</p>
                      <p className="text-xs text-slate-500">{p.room_name} x{p.room_count || 1}</p>
                      <p className="text-xs text-slate-400">{p.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDateLocal(p.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#091426]">{formatPrice(p.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {p.slip_image_url ? (
                      <button
                        onClick={() => setSelectedSlip(p.slip_image_url)}
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <ImageIcon size={16} />
                        <span>{t('adminPanel.payments.viewSlip') || 'View'}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">{t('adminPanel.payments.noSlip') || 'No slip'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {updatingId === p.id ? (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 size={12} className="animate-spin" />
                        {t('adminPanel.payments.updating') || 'Updating...'}
                      </div>
                    ) : (
                      <StatusDropdown 
                        status={p.status} 
                        onChange={(newStatus) => handleStatusChange(p.id, newStatus)}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={32} className="text-slate-300" />
                      {t('adminPanel.payments.noTransactions')}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Image Modal */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('adminPanel.payments.paymentSlip') || 'Payment Slip'}
              </h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50">
              <img
                src={selectedSlip}
                alt="Payment slip"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
