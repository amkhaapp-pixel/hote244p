import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Users, BedDouble, Maximize, Wifi, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight, X, Camera, DoorOpen } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';
import { saveBookingDraft, resolveBookingSelections, parseLocalDate } from '../utils/bookingDraft';

const formatDateLocal = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function RoomDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const initialSelections = () => resolveBookingSelections(id, location.state);

  const [dateRange, setDateRange] = useState(() => {
    const s = initialSelections();
    return [parseLocalDate(s.checkIn), parseLocalDate(s.checkOut)];
  });
  const [startDate, endDate] = dateRange;
  const [dateError, setDateError] = useState(false);
  const [guests, setGuests] = useState(() => initialSelections().guests);
  const [roomCount, setRoomCount] = useState(() => initialSelections().roomCount);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Restore selections when navigating back (e.g. room full on booking page)
  useEffect(() => {
    const s = resolveBookingSelections(id, location.state);
    if (s.checkIn && s.checkOut) {
      setDateRange([parseLocalDate(s.checkIn), parseLocalDate(s.checkOut)]);
      setDateError(false);
    }
    setGuests(s.guests);
    setRoomCount(s.roomCount);
  }, [id, location.key]);

  useEffect(() => {
    if (!id || !startDate || !endDate) return;
    saveBookingDraft(id, {
      checkIn: formatDateLocal(startDate),
      checkOut: formatDateLocal(endDate),
      guests,
      roomCount,
    });
  }, [id, startDate, endDate, guests, roomCount]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        setRoom(response.data);
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const maxRooms = room ? Math.max(1, parseInt(room.quantity, 10) || 5) : 5;
  const maxGuests = room ? roomCount * room.capacity : 10;

  useEffect(() => {
    if (room && guests > maxGuests) {
      setGuests(maxGuests);
    }
  }, [room, guests, maxGuests]);

  useEffect(() => {
    if (roomCount > maxRooms) {
      setRoomCount(maxRooms);
    }
  }, [maxRooms, roomCount]);

  useEffect(() => {
    if (guests > maxGuests) {
      setGuests(maxGuests);
    }
  }, [maxGuests, guests]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevImage = () => {
    if (!room?.images) return;
    setLightboxIndex((prev) => (prev === 0 ? room.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (!room?.images) return;
    setLightboxIndex((prev) => (prev === room.images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{
          width: '48px', height: '48px', border: '4px solid #e5e7eb',
          borderTopColor: '#1e3a5f', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-500">{t('rooms.noResults')}</p>
        <Link to="/rooms" className="text-primary hover:underline">{t('rooms.backToRooms')}</Link>
      </div>
    );
  }

  const images = room.images || [];
  const mainImage = images[0];
  const sideImages = images.slice(1, 4);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>
      {/* Lightbox Modal */}
      {lightboxOpen && images.length > 0 && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', backdropFilter: 'blur(8px)'
            }}
          >
            <X size={22} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                style={{
                  position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.15)',
                  border: 'none', borderRadius: '50%', width: '48px', height: '48px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', backdropFilter: 'blur(8px)'
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                style={{
                  position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.15)',
                  border: 'none', borderRadius: '50%', width: '48px', height: '48px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white', backdropFilter: 'blur(8px)'
                }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex]}
            alt={`${room.name} - ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain',
              borderRadius: '12px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
            }}
          />

          <div style={{
            position: 'absolute', bottom: '24px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            padding: '8px 20px', borderRadius: '20px',
            color: 'white', fontSize: '14px', fontWeight: '500'
          }}>
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Hero Section with Back Button */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 0' }}>
        <Link
          to="/rooms"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: '#6b7280', textDecoration: 'none', fontSize: '14px',
            fontWeight: '500', marginBottom: '16px', transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#1e3a5f'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <ArrowLeft size={18} />
          {t('rooms.backToRooms')}
        </Link>

        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '800', color: '#111827', marginBottom: '20px',
          letterSpacing: '-0.02em'
        }}>
          {room.name}
        </h1>
      </div>

      {/* Image Gallery */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 40px' }}>
        {images.length === 1 ? (
          /* Single Image Layout */
          <div
            onClick={() => openLightbox(0)}
            style={{
              borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
              height: '420px', position: 'relative'
            }}
          >
            <img
              src={mainImage}
              alt={room.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: '16px', right: '16px',
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              color: 'white', padding: '8px 16px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '500', display: 'flex',
              alignItems: 'center', gap: '6px'
            }}>
              <Camera size={16} /> Click to view
            </div>
          </div>
        ) : images.length === 2 ? (
          /* Two Images Layout */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: '420px', borderRadius: '16px', overflow: 'hidden' }}>
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
              >
                <img
                  src={img} alt={`${room.name} - ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Three+ Images Layout - Airbnb style */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '8px',
            height: '420px',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {/* Main large image */}
            <div
              onClick={() => openLightbox(0)}
              style={{ gridRow: '1 / 3', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
            >
              <img
                src={mainImage}
                alt={room.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </div>

            {/* Top right image */}
            <div
              onClick={() => openLightbox(1)}
              style={{ cursor: 'pointer', overflow: 'hidden' }}
            >
              <img
                src={sideImages[0] || mainImage}
                alt={`${room.name} - 2`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </div>

            {/* Bottom right - third image or show all photos button */}
            <div
              onClick={() => openLightbox(sideImages.length >= 2 ? 2 : 0)}
              style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
            >
              <img
                src={sideImages[1] || sideImages[0] || mainImage}
                alt={`${room.name} - 3`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
              {images.length > 3 && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '600', fontSize: '15px',
                  gap: '6px'
                }}>
                  <Camera size={18} />
                  +{images.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>

          {/* Desktop: 2 column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px' }} className="room-detail-grid">

            {/* Left: Room Info */}
            <div>
              {/* Quick Stats Bar */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '16px',
                padding: '20px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '32px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f0f4ff', padding: '10px 18px', borderRadius: '12px',
                  fontSize: '14px', color: '#1e3a5f', fontWeight: '500'
                }}>
                  <Users size={18} /> {t('rooms.guests', { count: room.capacity })}
                </div>
                {room.bedType && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f0f4ff', padding: '10px 18px', borderRadius: '12px',
                    fontSize: '14px', color: '#1e3a5f', fontWeight: '500'
                  }}>
                    <BedDouble size={18} /> {room.bedType}
                  </div>
                )}
                {room.size && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f0f4ff', padding: '10px 18px', borderRadius: '12px',
                    fontSize: '14px', color: '#1e3a5f', fontWeight: '500'
                  }}>
                    <Maximize size={18} /> {room.size}
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f0f4ff', padding: '10px 18px', borderRadius: '12px',
                  fontSize: '14px', color: '#1e3a5f', fontWeight: '500'
                }}>
                  <Wifi size={18} /> Free Wi-Fi
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: '22px', fontWeight: '700', color: '#111827',
                  marginBottom: '16px', letterSpacing: '-0.01em'
                }}>
                  {t('rooms.description')}
                </h2>
                <p style={{
                  color: '#4b5563', lineHeight: '1.8', fontSize: '15px'
                }}>
                  {room.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 style={{
                  fontSize: '22px', fontWeight: '700', color: '#111827',
                  marginBottom: '20px', letterSpacing: '-0.01em'
                }}>
                  {t('rooms.amenities')}
                </h2>
                {room.amenities && room.amenities.length > 0 ? (
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '12px'
                  }}>
                    {room.amenities.map((amenity, index) => (
                      <div key={index} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px', background: 'white',
                        borderRadius: '12px', border: '1px solid #e5e7eb',
                        fontSize: '14px', color: '#374151', fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#1e3a5f';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,95,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <ShieldCheck size={18} style={{ color: '#1e3a5f', flexShrink: 0 }} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>
                    {t('rooms.noAmenities')}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Booking Card (Sticky) */}
            <div>
              <div style={{
                position: 'sticky', top: '100px',
                background: 'white', borderRadius: '20px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                padding: '28px', overflow: 'hidden'
              }}>
                {/* Date Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: '700',
                    color: dateError ? '#ef4444' : '#6b7280',
                    textTransform: 'uppercase', marginBottom: '8px',
                    transition: 'color 0.3s ease'
                  }}>
                    {dateError ? 'Please select your stay dates' : 'Select Dates'}
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: dateError ? '#fef2f2' : '#f9fafb',
                    padding: '12px 16px', borderRadius: '12px',
                    border: `1.5px solid ${dateError ? '#ef4444' : '#e5e7eb'}`,
                    transition: 'all 0.3s ease',
                    boxShadow: dateError ? '0 0 0 4px rgba(239, 68, 68, 0.1)' : 'none'
                  }}>
                    <Calendar size={18} className={dateError ? "text-red-400" : "text-gray-400"} />
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                        if (update[0] && update[1]) setDateError(false);
                      }}
                      minDate={new Date()}
                      placeholderText="Select check-in - check-out"
                      className="bg-transparent border-none outline-none w-full text-sm font-medium text-gray-800"
                    />
                  </div>
                </div>

                {/* Room count */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: '700',
                    color: '#6b7280',
                    textTransform: 'uppercase', marginBottom: '8px'
                  }}>
                    {t('rooms.roomCount')}
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f9fafb',
                    padding: '10px 16px', borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DoorOpen size={18} className="text-gray-400" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {roomCount} {roomCount === 1 ? t('rooms.roomSingular') : t('rooms.roomPlural')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { if (roomCount <= 1) return; setRoomCount((prev) => Math.max(1, prev - 1)); }}
                        disabled={roomCount <= 1}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #e5e7eb', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: roomCount <= 1 ? 'not-allowed' : 'pointer',
                          color: roomCount <= 1 ? '#d1d5db' : '#374151',
                          fontSize: '18px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if (roomCount > 1) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >-</button>
                      <button
                        type="button"
                        onClick={() => { if (roomCount >= maxRooms) { toast(t('rooms.roomFullToast', { count: maxRooms })); return; } setRoomCount((prev) => Math.min(maxRooms, prev + 1)); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #e5e7eb', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: roomCount >= maxRooms ? 'not-allowed' : 'pointer',
                          color: roomCount >= maxRooms ? '#d1d5db' : '#374151',
                          fontSize: '18px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if (roomCount < maxRooms) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >+</button>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    {t('rooms.maxRooms', { count: maxRooms })}
                  </p>
                </div>

                {/* Guest Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block', fontSize: '12px', fontWeight: '700',
                    color: '#6b7280',
                    textTransform: 'uppercase', marginBottom: '8px'
                  }}>
                    {t('rooms.capacity')}
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f9fafb',
                    padding: '10px 16px', borderRadius: '12px',
                    border: '1.5px solid #e5e7eb',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={18} className="text-gray-400" />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                        {t('rooms.guestCount', { count: guests })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { if (guests <= 1) return; setGuests(prev => Math.max(1, prev - 1)); }}
                        disabled={guests <= 1}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #e5e7eb', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: guests <= 1 ? 'not-allowed' : 'pointer',
                          color: guests <= 1 ? '#d1d5db' : '#374151',
                          fontSize: '18px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if (guests > 1) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >-</button>
                      <button
                        type="button"
                        onClick={() => { if (guests >= maxGuests) { toast(t('rooms.maxGuestsToast', { count: maxGuests })); return; } setGuests(prev => Math.min(maxGuests, prev + 1)); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: '1px solid #e5e7eb', background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: guests >= maxGuests ? 'not-allowed' : 'pointer',
                          color: guests >= maxGuests ? '#d1d5db' : '#374151',
                          fontSize: '18px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { if (guests < maxGuests) e.currentTarget.style.background = '#f3f4f6'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Price Header */}
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('rooms.from')}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '36px', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em' }}>
                      {formatPrice(room.price)}
                    </span>
                    <span style={{ fontSize: '15px', color: '#6b7280', fontWeight: '400' }}>
                      {t('rooms.night')}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#f3f4f6', margin: '0 0 20px' }} />

                {/* Room Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                      <Users size={16} /> {t('rooms.capacity')}
                    </span>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                      {t('rooms.guests', { count: room.capacity })}
                    </span>
                  </div>
                  <div style={{ height: '1px', background: '#f3f4f6' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                      <Maximize size={16} /> {t('rooms.size')}
                    </span>
                    <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                      {room.size || 'Standard'}
                    </span>
                  </div>
                  {room.bedType && (
                    <>
                      <div style={{ height: '1px', background: '#f3f4f6' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                          <BedDouble size={16} /> Bed Type
                        </span>
                        <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                          {room.bedType}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Reserve Button */}
                {room.in_maintenance ? (
                  <div
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '16px',
                      background: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '14px',
                      fontWeight: '700',
                      fontSize: '15px',
                      textAlign: 'center',
                      border: '1px solid #fcd34d',
                    }}
                  >
                    Temporarily unavailable — under maintenance
                  </div>
                ) : (
                  <Link
                    to="/booking"
                    onClick={(e) => {
                      if (!startDate || !endDate) {
                        e.preventDefault();
                        setDateError(true);
                        toast.error(t('booking.noRoomSelected') || 'Please select your stay dates');
                        return;
                      }

                      const draft = {
                        checkIn: formatDateLocal(startDate),
                        checkOut: formatDateLocal(endDate),
                        guests,
                        roomCount,
                      };
                      saveBookingDraft(room.id, draft);

                      const user = localStorage.getItem('user');
                      if (!user) {
                        e.preventDefault();
                        toast.error(t('rooms.loginRequired'));
                        setTimeout(() => {
                          navigate('/login', {
                            state: {
                              from: `/rooms/${id}`,
                              bookingData: {
                                roomId: room.id,
                                price: room.price,
                                roomName: room.name,
                                roomImage: room.images?.[0],
                                ...draft,
                              }
                            }
                          });
                        }, 1000);
                        return;
                      }
                    }}
                    state={{
                      roomId: room.id,
                      price: room.price,
                      roomName: room.name,
                      roomImage: room.images?.[0],
                      checkIn: formatDateLocal(startDate),
                      checkOut: formatDateLocal(endDate),
                      guests: guests,
                      roomCount: roomCount,
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
                      color: 'white',
                      borderRadius: '14px',
                      fontWeight: '700',
                      fontSize: '16px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(30,58,95,0.3)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(30,58,95,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 14px rgba(30,58,95,0.3)';
                    }}
                  >
                    {t('rooms.reserve')}
                  </Link>
                )}

                <p style={{
                  textAlign: 'center', fontSize: '12px', color: '#9ca3af',
                  marginTop: '14px', fontWeight: '400'
                }}>
                  {t('rooms.noPaymentYet')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .room-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
