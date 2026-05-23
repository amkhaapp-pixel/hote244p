import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatDateLocal = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function SearchBar() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState(2);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms', { 
      state: { 
        checkIn: formatDateLocal(startDate), 
        checkOut: formatDateLocal(endDate),
        guests 
      } 
    });
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl max-w-5xl mx-auto -mt-16 relative z-30 border border-gray-100">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
        
        {/* Date Picker Input */}
        <div className="flex-1 w-full relative">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-2">Check-in - Check-out</label>
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <Calendar className="text-gray-400 mr-3" size={20} />
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              minDate={new Date()}
              placeholderText="Select your dates"
              className="bg-transparent border-none outline-none w-full text-gray-800 font-medium placeholder-gray-400"
              monthsShown={2}
            />
          </div>
        </div>

        {/* Guests Input */}
        <div className="w-full md:w-48 relative">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-2">Guests</label>
          <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <Users className="text-gray-400 mr-3" size={20} />
            <select 
              value={guests} 
              onChange={(e) => setGuests(Number(e.target.value))}
              className="bg-transparent border-none outline-none w-full text-gray-800 font-medium appearance-none"
            >
              {[1,2,3,4,5,6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="w-full md:w-auto mt-6 md:mt-0 md:pt-5">
          <button 
            type="submit" 
            className="w-full md:w-auto bg-accent hover:bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/30"
          >
            <Search size={20} />
            Search Rooms
          </button>
        </div>
        
      </form>
    </div>
  );
}
