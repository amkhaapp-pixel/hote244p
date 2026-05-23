import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Users,
  Upload,
  Search,
  Filter,
  Wifi,
  Sparkles,
  Clock,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1631049307264-da0c9d7edb66?w=800&q=80';

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function bookingOccupiesRoomToday(b) {
  if ((b.status || '').toLowerCase() !== 'paid') return false;
  const t = todayISODate();
  const cin = String(b.check_in).slice(0, 10);
  const cout = String(b.check_out).slice(0, 10);
  return cin <= t && cout > t;
}

function roomInMaintenance(room) {
  return Boolean(room?.in_maintenance);
}

export default function RoomManagement() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    capacity: '',
    description: '',
    images: [],
    amenities: '',
    in_maintenance: false,
    quantity: '5',
  });

  const load = async () => {
    try {
      const [roomsRes, bookingsRes, statsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/admin/bookings'),
        api.get('/admin/stats'),
      ]);
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const occupiedRoomIds = useMemo(() => {
    const ids = new Set();
    for (const b of bookings) {
      if (bookingOccupiesRoomToday(b)) ids.add(b.room_id);
    }
    return ids;
  }, [bookings]);

  const occupiedCountLocal = useMemo(() => {
    let n = 0;
    for (const r of rooms) {
      if (roomInMaintenance(r)) continue;
      if (occupiedRoomIds.has(r.id)) n += 1;
    }
    return n;
  }, [rooms, occupiedRoomIds]);

  const filteredRooms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rooms.filter((r) => {
      if (q && !String(r.name).toLowerCase().includes(q)) return false;
      const maint = roomInMaintenance(r);
      const occ = occupiedRoomIds.has(r.id);
      if (statusFilter === 'available' && (occ || maint)) return false;
      if (statusFilter === 'occupied' && (!occ || maint)) return false;
      if (statusFilter === 'maintenance' && !maint) return false;
      return true;
    });
  }, [rooms, searchTerm, statusFilter, occupiedRoomIds]);

  const totalRooms = stats?.totalRooms ?? rooms.length;
  const maintenanceCount = stats?.maintenanceRooms ?? rooms.filter(roomInMaintenance).length;
  const occupiedCount = stats?.occupiedRooms ?? occupiedCountLocal;
  const availableCount =
    stats?.availableRooms ?? Math.max(0, totalRooms - maintenanceCount - occupiedCountLocal);
  const availPct =
    totalRooms > 0 ? Math.round((availableCount / totalRooms) * 100) : 0;

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        price: room.price,
        capacity: room.capacity,
        description: room.description,
        images: room.images || [],
        amenities: room.amenities?.join(', ') || '',
        in_maintenance: roomInMaintenance(room),
        quantity: room.quantity || '5',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        price: '',
        capacity: '',
        description: '',
        images: [],
        amenities: '',
        in_maintenance: false,
        quantity: '5',
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error(t('adminPanel.rooms.maxImages'));
      return;
    }

    setUploading(true);
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append('images', files[i]);
    }

    try {
      const response = await api.post('/admin/upload-images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...response.data.urls],
      }));
    } catch (err) {
      console.error(err);
      toast.error(t('adminPanel.rooms.uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error(t('adminPanel.rooms.pleaseUploadImage'));
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity, 10),
      quantity: parseInt(formData.quantity, 10) || 5,
      amenities: formData.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      in_maintenance: Boolean(formData.in_maintenance),
    };

    try {
      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom.id}`, payload);
      } else {
        await api.post('/admin/rooms', payload);
      }
      setIsModalOpen(false);
      load();
    } catch {
      toast.error(t('adminPanel.rooms.saveError'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('adminPanel.rooms.deleteConfirm'))) {
      try {
        await api.delete(`/admin/rooms/${id}`);
        load();
      } catch {
        toast.error(t('adminPanel.rooms.deleteError'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#091426]" />
        <p className="text-sm text-slate-500">{t('adminPanel.rooms.loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#091426]">{t('adminPanel.rooms.title')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('adminPanel.rooms.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Filter size={18} />
            {t('adminPanel.rooms.filter')}
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#091426] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus size={20} strokeWidth={2.5} />
            {t('adminPanel.rooms.addRoom')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Sparkles size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminPanel.rooms.totalRooms')}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalRooms}</div>
          <p className="mt-1 text-xs font-medium text-emerald-600">{t('adminPanel.rooms.liveInventory')}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminPanel.rooms.available')}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{availableCount}</div>
          <p className="mt-1 text-xs font-medium text-slate-500">{availPct}{t('adminPanel.rooms.ofInventory')}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Clock size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminPanel.rooms.occupied')}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{occupiedCount}</div>
          <p className="mt-1 text-xs font-medium text-slate-500">{t('adminPanel.rooms.realTimeStatus')}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-red-50 p-2 text-red-700">
              <Wrench size={22} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('adminPanel.rooms.maintenance')}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{maintenanceCount}</div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {maintenanceCount > 0 ? t('adminPanel.rooms.markedOutOfService') : t('adminPanel.rooms.noneInMaintenance')}
          </p>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder={t('adminPanel.rooms.searchPlaceholder')}
          className="w-full rounded-full border border-slate-200 bg-[#f5f3f4] py-2 pl-10 pr-4 text-sm outline-none ring-[#091426]/20 focus:border-transparent focus:ring-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('adminPanel.rooms.availability')}
          </label>
          <select
            className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#091426]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('adminPanel.rooms.allRooms')}</option>
            <option value="available">{t('adminPanel.rooms.available')}</option>
            <option value="occupied">{t('adminPanel.rooms.occupied')}</option>
            <option value="maintenance">{t('adminPanel.rooms.maintenanceLabel')}</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 2xl:grid-cols-3">
        {filteredRooms.map((room) => {
          const maint = roomInMaintenance(room);
          const occupied = !maint && occupiedRoomIds.has(room.id);
          const img = room.images?.[0] || PLACEHOLDER_IMG;
          const amenities = Array.isArray(room.amenities) ? room.amenities : [];
          const meta1 = `${room.capacity} ${room.capacity === 1 ? t('adminPanel.rooms.guestSingular') || 'guest' : t('adminPanel.rooms.guestPlural') || 'guests'}`;
          const meta2 = amenities[0] || '—';
          const meta3 =
            amenities[1] ||
            (amenities.length > 2 ? `+${amenities.length - 2} more` : '—');
          return (
            <div
              key={room.id}
              className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={img}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {maint ? (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-800 shadow-sm">
                    <Wrench size={12} className="shrink-0" />
                    {t('adminPanel.rooms.maintenance')}
                  </div>
                ) : occupied ? (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm">
                    <Clock size={12} className="shrink-0" />
                    {t('adminPanel.rooms.occupied')}
                  </div>
                ) : (
                  <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    {t('adminPanel.rooms.available')}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(room)}
                    className="rounded-full bg-white/90 p-2 text-slate-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-white hover:text-[#091426]"
                    title={t('adminPanel.rooms.edit')}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(room.id)}
                    className="rounded-full bg-white/90 p-2 text-red-600 shadow-lg backdrop-blur-sm transition-colors hover:bg-red-50"
                    title={t('adminPanel.rooms.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{room.name}</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">Inventory: {room.quantity || 5} {room.quantity === 1 ? 'room' : 'rooms'}</p>
                  </div>
                  <span className="shrink-0 text-lg font-bold text-[#091426]">
                    {formatPrice(room.price)}
                    <span className="text-xs font-normal text-slate-400">{t('adminPanel.rooms.perNight')}</span>
                  </span>
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-slate-600">{room.description || '—'}</p>
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-50 pt-4 text-slate-500 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span className="text-xs font-medium">{meta1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi size={18} />
                    <span className="text-xs font-medium">{meta2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} />
                    <span className="text-xs font-medium">{meta3}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">{t('adminPanel.rooms.noRoomsMatch')}</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-[#091426]">
                {editingRoom ? t('adminPanel.rooms.editRoom') : t('adminPanel.rooms.addRoomTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(90vh-4rem)] space-y-5 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t('adminPanel.rooms.roomName')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#091426]/20 focus:ring-2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t('adminPanel.rooms.price')}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#091426]/20"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {t('adminPanel.rooms.capacity')}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#091426]/20"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Room Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#091426]/20"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.rooms.description')}
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#091426]/20"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <ImageIcon size={14} />
                  {t('adminPanel.rooms.images')} ({formData.images.length}/5)
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {formData.images.map((url, index) => (
                    <div key={`${index}-${url}`} className="group/img relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-100">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-md bg-red-500 p-1 text-white opacity-0 shadow transition-opacity group-hover/img:opacity-100"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 rounded bg-[#091426] px-2 py-0.5 text-[10px] font-bold text-white">
                          {t('adminPanel.rooms.main')}
                        </span>
                      )}
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-[#091426]/40 hover:bg-slate-50"
                    >
                      {uploading ? (
                        <Loader2 className="animate-spin" size={22} />
                      ) : (
                        <>
                          <Upload size={20} />
                          <span className="text-[10px] font-medium">{t('adminPanel.rooms.addPhoto')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="mt-2 text-xs text-slate-400">{t('adminPanel.rooms.imagesHint')}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('adminPanel.rooms.amenities')}
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#091426]/20"
                  placeholder={t('adminPanel.rooms.amenitiesPlaceholder')}
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#091426] focus:ring-[#091426]"
                  checked={formData.in_maintenance}
                  onChange={(e) => setFormData({ ...formData, in_maintenance: e.target.checked })}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{t('adminPanel.rooms.outOfService')}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t('adminPanel.rooms.outOfServiceHint')}
                  </span>
                </span>
              </label>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                >
                  {t('adminPanel.rooms.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-[2] rounded-lg bg-[#091426] py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? t('adminPanel.rooms.uploading') : editingRoom ? t('adminPanel.rooms.saveChanges') : t('adminPanel.rooms.createRoom')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
