import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';

export default function MessageManagement() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    setMessages(stored);
    setLoading(false);
  }, []);

  const saveMessages = (updated) => {
    localStorage.setItem('contact_messages', JSON.stringify(updated));
    setMessages(updated);
  };

  const toggleRead = (id) => {
    const updated = messages.map((m) =>
      m.id === id ? { ...m, read: !m.read } : m
    );
    saveMessages(updated);
  };

  const deleteMessage = (id) => {
    const updated = messages.filter((m) => m.id !== id);
    saveMessages(updated);
  };

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex h-[28rem] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#091426]" />
        <p className="text-sm font-medium text-slate-500">
          {t('adminPanel.messages.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#091426]">
            {t('adminPanel.messages.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t('adminPanel.messages.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            {t('adminPanel.messages.unread')}: {unreadCount}
          </span>
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {t('adminPanel.messages.total')}: {messages.length}
          </span>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
        />
        <input
          type="search"
          placeholder={t('adminPanel.messages.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-primary/20 transition-shadow focus:ring-2 focus:ring-[#091426]"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Mail size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-500">
              {t('adminPanel.messages.noMessages')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 transition-colors hover:bg-slate-50/50 ${
                  !msg.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        msg.read ? 'bg-slate-300' : 'bg-blue-600'
                      }`}
                    >
                      {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#091426]">
                        {msg.name}
                      </p>
                      <p className="text-xs text-slate-500">{msg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={14} />
                    {new Date(msg.createdAt).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-white border border-slate-100 p-4 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      size={16}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => toggleRead(msg.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      msg.read
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {msg.read ? (
                      <>
                        <EyeOff size={14} />
                        {t('adminPanel.messages.markUnread')}
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        {t('adminPanel.messages.markRead')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    {t('adminPanel.messages.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
