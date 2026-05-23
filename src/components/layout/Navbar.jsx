import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, Menu, Shield, User, LogOut, CalendarDays } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageProvider';

export default function Navbar() {
  const { t, lang, toggleLang } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const userRaw = localStorage.getItem('user');
    return userRaw ? JSON.parse(userRaw) : null;
  });
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const syncUser = () => {
      const userRaw = localStorage.getItem('user');
      setUser(userRaw ? JSON.parse(userRaw) : null);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('authchange', syncUser);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('authchange', syncUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authchange'));
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">GrandHotel</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors">{t('nav.home')}</Link>
            <Link to="/rooms" className="text-gray-600 hover:text-primary font-medium transition-colors">{t('nav.rooms')}</Link>
            <Link to="/facilities" className="text-gray-600 hover:text-primary font-medium transition-colors">{t('nav.facilities')}</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary font-medium transition-colors">{t('nav.contact')}</Link>

          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="text-gray-500 hover:text-gray-700 hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              title={lang === 'en' ? 'Switch to Lao' : 'Switch to English'}
            >
              <Globe size={18} />
              <span className="text-xs font-medium">{lang.toUpperCase()}</span>
            </button>
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <User size={18} />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{t('profile.loggedIn')}</p>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white shadow-lg p-2">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group/profile"
                    >
                      <p className="text-sm font-bold text-gray-900 group-hover/profile:text-primary transition-colors">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </Link>

                    <div className="py-2">
                      <Link
                        to="/my-bookings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <CalendarDays size={16} />
                        <span>{t('profile.bookingHistory')}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Shield size={16} />
                          <span>{t('profile.goToAdmin')}</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>{t('profile.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
                <User size={18} />
                <span className="text-sm font-medium hidden sm:block">{t('nav.signIn')}</span>
              </Link>
            )}
            <button className="md:hidden text-gray-500">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
