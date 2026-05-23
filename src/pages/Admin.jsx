import { Building2, CalendarCheck2, DollarSign, Users } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';

const stats = [
  { key: 'todayBookings', icon: CalendarCheck2, value: '48' },
  { key: 'occupiedRooms', icon: Building2, value: '92%' },
  { key: 'todayRevenue', icon: DollarSign, value: 'THB 186,400' },
  { key: 'newCustomers', icon: Users, value: '17' },
];

export default function Admin() {
  const { t } = useTranslation();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        <p className="text-gray-600 mt-2">{t('admin.subtitle')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ key, icon: Icon, value }) => (
          <article key={key} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{t(`admin.${key}`)}</span>
              <Icon size={18} className="text-primary" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </article>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity">
            {t('admin.manageBookings')}
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            {t('admin.manageRooms')}
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            {t('admin.viewReports')}
          </button>
        </div>
      </div>
    </section>
  );
}
