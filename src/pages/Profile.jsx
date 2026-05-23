import { useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, Mail, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    window.dispatchEvent(new Event('authchange'));
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t('profile.backToRooms') || 'Back'}</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{t('profile.accountInfo')}</h1>
          </div>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <User size={32} />
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-400">
                <User size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{t('profile.name')}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                <p className="text-lg font-bold text-gray-900">{user.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{t('profile.email')}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                <p className="text-lg font-bold text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-400">
                <Shield size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{t('profile.role')}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-lg font-bold text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-sm text-gray-400">
              Manage your personal information and security settings.
            </p>
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-3 text-red-500 font-bold hover:bg-red-50 px-8 py-4 rounded-2xl transition-all border border-red-100 hover:border-red-200 shadow-sm hover:shadow"
            >
              <LogOut size={20} />
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
