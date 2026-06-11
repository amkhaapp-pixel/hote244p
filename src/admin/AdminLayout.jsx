import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Hotel,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Bell,
  CircleHelp,
  Menu,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import { clearAuthSession } from '../utils/auth';

const SIDEBAR_W = 'w-[280px]';
const SIDEBAR_W_COLLAPSED = 'w-[72px]';

const SidebarLink = ({ to, icon: Icon, label, active, onClick, collapsed }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`px-6 py-3 flex items-center gap-3 transition-all duration-200 ${active
      ? 'bg-blue-600/10 text-white border-l-4 border-emerald-400'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'
      } ${collapsed ? 'justify-center px-3' : ''}`}
    title={collapsed ? label : undefined}
  >
    <Icon size={22} strokeWidth={active ? 2 : 1.75} className="shrink-0" />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
  </Link>
);

export default function AdminLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('adminUser') || '{}');
  const token = localStorage.getItem('adminToken');
  const [propertyName, setPropertyName] = useState('StayManager');

  useEffect(() => {
    const savedGeneral = localStorage.getItem('hotel_settings_general');
    if (savedGeneral) {
      const data = JSON.parse(savedGeneral);
      if (data.propertyName) setPropertyName(data.propertyName);
    }
  }, [location.pathname]); // Update name when navigating

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [token, user.role, navigate]);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex h-screen bg-[#fbf8fa] text-slate-900 antialiased overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${isSidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W} flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-6 py-8 flex items-center justify-between shrink-0 relative">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-600">
              <Hotel className="text-white" size={22} />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="text-xl font-bold tracking-tight text-white">{propertyName}</h1>
              <p className="text-xs font-medium text-slate-500">Enterprise Admin</p>
            </div>
          </div>
          <button className="text-slate-400 lg:hidden" onClick={closeSidebar}>
            <X size={24} />
          </button>
          {/* Collapse toggle button - desktop only */}
          <button
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors shadow-lg border border-slate-600"
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-4 overflow-y-auto custom-scrollbar">
          <SidebarLink
            to="/admin/dashboard"
            icon={LayoutDashboard}
            label={t('adminPanel.layout.dashboard')}
            active={isActive('/admin/dashboard') || location.pathname === '/admin'}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/bookings"
            icon={CalendarDays}
            label={t('adminPanel.layout.bookings')}
            active={isActive('/admin/bookings')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/rooms"
            icon={Hotel}
            label={t('adminPanel.layout.rooms')}
            active={isActive('/admin/rooms')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/payments"
            icon={CreditCard}
            label={t('adminPanel.layout.payments')}
            active={isActive('/admin/payments')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/customers"
            icon={Users}
            label={t('adminPanel.layout.customers')}
            active={isActive('/admin/customers')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/messages"
            icon={Mail}
            label={t('adminPanel.layout.messages')}
            active={isActive('/admin/messages')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
          <SidebarLink
            to="/admin/settings"
            icon={Settings}
            label={t('adminPanel.layout.settings')}
            active={isActive('/admin/settings')}
            onClick={closeSidebar}
            collapsed={isSidebarCollapsed}
          />
        </nav>

        <div className="p-4 shrink-0 border-t border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded px-6 py-3 text-left text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white ${isSidebarCollapsed ? 'justify-center px-3' : ''}`}
            title={isSidebarCollapsed ? t('adminPanel.layout.logout') : undefined}
          >
            <LogOut size={22} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">{t('adminPanel.layout.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-sm z-20">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="text-slate-600 lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <div className="relative w-full max-w-md hidden md:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={2}
              />
              <input
                type="search"
                placeholder={t('adminPanel.layout.search')}
                className="w-full rounded-full border border-slate-200 bg-[#f5f3f4] py-2 pl-10 pr-4 text-sm outline-none ring-primary/20 transition-shadow focus:ring-2 focus:ring-[#091426]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-50">
                <Bell size={20} />
              </button>
              <button className="hidden sm:block rounded-full p-2 text-slate-500 hover:bg-slate-50">
                <CircleHelp size={20} />
              </button>
            </div>
            <div className="mx-1 md:mx-2 h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 font-medium">{t('adminPanel.layout.manager')}</p>
              </div>
              <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
