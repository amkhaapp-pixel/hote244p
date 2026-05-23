import { Users, Wifi, BedDouble, Maximize } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

export default function RoomCard({ room }) {
  const location = useLocation();
  const { checkIn, checkOut, guests } = location.state || {};
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <div className="md:w-2/5 h-64 md:h-auto relative overflow-hidden">
        <img 
          src={room.images[0]} 
          alt={room.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {room.availableCount < 3 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            Only {room.availableCount} left!
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-6 md:w-3/5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{room.name}</h3>
          </div>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{room.description}</p>
          
          {/* Amenities Grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2"><Users size={16} className="text-primary" /> Up to {room.capacity} Guests</div>
            <div className="flex items-center gap-2"><BedDouble size={16} className="text-primary" /> {room.bedType}</div>
            <div className="flex items-center gap-2"><Maximize size={16} className="text-primary" /> {room.size}</div>
            <div className="flex items-center gap-2"><Wifi size={16} className="text-primary" /> Free Wi-Fi</div>
          </div>
        </div>
        
        {/* Footer: Price & Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-gray-100 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Price per night</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(room.price)}</span>
            </div>
          </div>
          <Link 
            to={`/rooms/${room.id}`}
            state={{ checkIn, checkOut, guests }}
            className="w-full sm:w-auto bg-primary hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-medium transition-colors text-center shadow-md shadow-blue-900/20"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
