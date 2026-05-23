import { Wifi, Dumbbell, Coffee, Car, Waves, UtensilsCrossed, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';

const facilities = [
  { icon: Wifi, key: 'wifi' },
  //{ icon: Dumbbell, key: 'fitness' },
  { icon: Coffee, key: 'cafe' },
  { icon: Car, key: 'parking' },
  //{ icon: Waves, key: 'pool' },
  { icon: UtensilsCrossed, key: 'restaurant' },
  //{ icon: Sparkles, key: 'spa' },
  { icon: Clock, key: 'reception' },
  { icon: ShieldCheck, key: 'security' },
];

export default function Facilities() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('facilities.title')}</h1>
          <p className="text-gray-600 max-w-2xl">
            {t('facilities.subtitle')}
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`facilities.items.${f.key}.title`)}</h3>
              <p className="text-gray-600">{t(`facilities.items.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
