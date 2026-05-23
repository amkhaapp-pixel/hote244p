import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import api from '../api/axios';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);
      const { token, user } = response.data;

      // Save token and user data
      localStorage.setItem('adminToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('adminUser', JSON.stringify(user));
      window.dispatchEvent(new Event('authchange'));

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        const { from, bookingData } = location.state || {};
        if (bookingData) {
          navigate('/booking', { state: bookingData });
        } else {
          navigate(from || '/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t('login.welcome')}</h1>
          <p className="text-gray-500 text-center mb-8">{t('login.signIn')}</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" required placeholder={t('login.email')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" required placeholder={t('login.password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t('login.loading') : t('login.signInBtn')} <ArrowRight size={18} />
            </button>
          </form>
          <p className="text-center text-gray-500 mt-6 text-sm">
            {t('login.noAccount')} <Link to="/register" state={location.state} className="text-primary font-semibold">{t('login.signUp')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
