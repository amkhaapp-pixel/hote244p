import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Hotel,
  Save,
  CreditCard,
  Mail,
  Lock,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${active
        ? 'border-[#091426] text-[#091426] bg-slate-50'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
      }`}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
    {label}
  </button>
);

export default function SettingsManagement() {
  const { t, lang, changeLang } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // General Settings State
  const [general, setGeneral] = useState({
    propertyName: 'StayManager Enterprise',
    timezone: '(GMT+07:00) Bangkok, Hanoi, Jakarta',
    language: lang === 'lo' ? 'Lao (ພາສາລາວ)' : 'English (US)'
  });

  // Hotel Profile State
  const [profile, setProfile] = useState({
    address: 'ViengSawang, ViengPhouKha District, LuangNamtha Province...',
    email: 'amkhaapp@gmail.com',
    phone: '+856 20 99 1970 67'
  });

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('adminUser') || '{}');

  // Load saved settings on mount
  useEffect(() => {
    const savedGeneral = localStorage.getItem('hotel_settings_general');
    if (savedGeneral) {
      setGeneral(JSON.parse(savedGeneral));
    }
    const savedProfile = localStorage.getItem('hotel_settings_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = async (type) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      if (type === 'general') {
        localStorage.setItem('hotel_settings_general', JSON.stringify(general));
        const selectedLang = general.language.includes('Lao') ? 'lo' : 'en';
        changeLang(selectedLang);
      } else if (type === 'profile') {
        localStorage.setItem('hotel_settings_profile', JSON.stringify(profile));
      }

      toast.success(t('adminPanel.settings.saveSuccess'));
    } catch (error) {
      toast.error(t('adminPanel.settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#091426]">{t('adminPanel.settings.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('adminPanel.settings.subtitle')}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap border-b border-slate-100">
          <TabButton
            active={activeTab === 'general'}
            icon={Settings}
            label={t('adminPanel.settings.general')}
            onClick={() => setActiveTab('general')}
          />
          <TabButton
            active={activeTab === 'profile'}
            icon={Hotel}
            label={t('adminPanel.settings.hotelProfile')}
            onClick={() => setActiveTab('profile')}
          />
          <TabButton
            active={activeTab === 'notifications'}
            icon={Bell}
            label={t('adminPanel.settings.notifications')}
            onClick={() => setActiveTab('notifications')}
          />
          <TabButton
            active={activeTab === 'security'}
            icon={Shield}
            label={t('adminPanel.settings.security')}
            onClick={() => setActiveTab('security')}
          />
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="max-w-2xl space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.propertyName')}</label>
                  <input
                    type="text"
                    value={general.propertyName}
                    onChange={(e) => setGeneral({ ...general, propertyName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#091426] focus:ring-2 focus:ring-[#091426]/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.timezone')}</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#091426]"
                  >
                    <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                    <option>(GMT+00:00) London, Lisbon, Casablanca</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.defaultLanguage')}</label>
                  <select
                    value={general.language}
                    onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#091426]"
                  >
                    <option>English (US)</option>
                    <option>Lao (ພາສາລາວ)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('general')}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#091426] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? t('common.loading') : t('adminPanel.settings.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                <div className="h-24 w-24 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Hotel size={40} />
                </div>
                <div>
                  <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    {t('adminPanel.settings.changeLogo')}
                  </button>
                  <p className="mt-2 text-xs text-slate-400">{t('adminPanel.settings.logoHint')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.fullAddress')}</label>
                  <textarea
                    rows={3}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#091426]"
                    placeholder={t('adminPanel.settings.addressPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.contactEmail')}</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.contactPhone')}</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('profile')}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#091426] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? t('common.loading') : t('adminPanel.settings.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl space-y-8">
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-[#091426]">{t('adminPanel.settings.updatePassword')}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.contactEmail')}</label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email || ''}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.currentPassword')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('adminPanel.settings.newPassword')}</label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      placeholder={t('adminPanel.settings.passwordPlaceholder')}
                      className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-[#091426] mb-4">{t('adminPanel.settings.twoFactor')}</h4>
                <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{t('adminPanel.settings.mobileAuth')}</p>
                      <p className="text-xs text-slate-500">{t('adminPanel.settings.mobileAuthDesc')}</p>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-blue-600 hover:underline">{t('adminPanel.settings.enable')}</button>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#091426] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? t('common.loading') : t('adminPanel.settings.updateSecurity')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              {[
                { label: t('adminPanel.settings.newBookingAlerts'), desc: t('adminPanel.settings.newBookingAlertsDesc') },
                { label: t('adminPanel.settings.paymentSuccess'), desc: t('adminPanel.settings.paymentSuccessDesc') },
                { label: t('adminPanel.settings.checkInReminders'), desc: t('adminPanel.settings.checkInRemindersDesc') },
                { label: t('adminPanel.settings.systemUpdates'), desc: t('adminPanel.settings.systemUpdatesDesc') }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#091426] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
