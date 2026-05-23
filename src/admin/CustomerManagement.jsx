import { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Loader2,
  Users,
  UserPlus,
  MoreVertical,
  Download,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';

const initials = (name) => {
  if (!name) return '?';
  const p = String(name).trim().split(/\s+/);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
};

export default function CustomerManagement() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/admin/customers');
        setCustomers(response.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[28rem] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#091426]" />
        <p className="text-sm font-medium text-slate-500">{t('adminPanel.customers.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#091426]">{t('adminPanel.customers.title')}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('adminPanel.customers.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <Download size={18} />
            {t('adminPanel.customers.export')}
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-[#091426] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            <UserPlus size={18} />
            {t('adminPanel.customers.addCustomer')}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.totalCustomers')}</p>
          <p className="text-2xl font-bold text-[#091426]">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Calendar size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.activeBookings')}</p>
          <p className="text-2xl font-bold text-[#091426]">
            {customers.reduce((acc, c) => acc + (c.booking_count > 0 ? 1 : 0), 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <User size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.newThisMonth')}</p>
          <p className="text-2xl font-bold text-[#091426]">
            {customers.filter(c => {
              const date = new Date(c.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('adminPanel.customers.searchPlaceholder')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm outline-none ring-[#091426]/20 transition-all focus:border-[#091426] focus:ring-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
          <Filter size={18} />
          {t('adminPanel.customers.filters')}
        </button>
      </div>

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.customer')}</th>
                <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.contactInfo')}</th>
                <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.totalBookings')}</th>
                <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{t('adminPanel.customers.joinDate')}</th>
                <th className="px-8 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">{t('adminPanel.customers.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm text-slate-500 italic">
                    {t('adminPanel.customers.noCustomers')}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#091426] text-sm font-bold text-white shadow-sm">
                          {initials(customer.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#091426]">{customer.name}</p>
                          <p className="text-[11px] font-medium text-slate-400">User ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          <span>{customer.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {customer.booking_count} {t('adminPanel.customers.bookings')}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-600">
                      {new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="text-slate-400 transition-colors hover:text-[#091426]">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
