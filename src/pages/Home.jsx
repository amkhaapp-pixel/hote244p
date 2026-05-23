import { useState, useEffect } from 'react';
import SearchBar from '../components/booking/SearchBar';
import RoomCard from '../components/room/RoomCard';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';

export default function Home() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="https://res.cloudinary.com/dp3pkwg2f/image/upload/v1777907197/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20260504225733_130_18_x19t3n.jpg"
          alt="Hotel exterior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">{t('home.heroTitle')}</h1>
          <p className="text-xl md:text-2xl font-light mb-10 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </section>

      <div className="px-4">
        <SearchBar />
      </div>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featuredRooms')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('home.featuredDesc')}</p>
        </div>

        {loading ? (
          <div className="text-center py-10">{t('home.loading')}</div>
        ) : (
          <div className="flex flex-col gap-8">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
