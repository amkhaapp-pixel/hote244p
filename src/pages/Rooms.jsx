import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import RoomCard from '../components/room/RoomCard';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';

export default function Rooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/rooms');
        const list = Array.isArray(response.data) ? response.data : [];
        setRooms(list.filter((r) => !r.in_maintenance));
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms
    .filter(room =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return a.id - b.id;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('rooms.title')}</h1>
          <p className="text-gray-600 max-w-2xl">
            {t('rooms.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('rooms.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-gray-700"
            >
              <option value="default">{t('rooms.sortBy')}</option>
              <option value="price-low">{t('rooms.priceLow')}</option>
              <option value="price-high">{t('rooms.priceHigh')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="text-center py-20 text-gray-500">{t('rooms.loading')}</div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-medium mb-2">{t('rooms.noResults')}</p>
            <p>{t('rooms.tryAdjust')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
