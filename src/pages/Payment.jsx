import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, Wallet, Clock, ShieldCheck, CheckCircle2, Upload, ImageIcon, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n/LanguageProvider';
import { formatPrice } from '../utils/formatPrice';

export default function Payment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { booking: bookingFromState, roomName: roomNameFromState } = location.state || {};
  const fileInputRef = useRef(null);

  // Restore booking data from localStorage if page is refreshed
  const [booking, setBooking] = useState(() => {
    if (bookingFromState) {
      localStorage.setItem('payment_booking', JSON.stringify(bookingFromState));
      return bookingFromState;
    }
    const saved = localStorage.getItem('payment_booking');
    return saved ? JSON.parse(saved) : null;
  });

  const [roomName, setRoomName] = useState(() => {
    if (roomNameFromState) {
      localStorage.setItem('payment_roomName', roomNameFromState);
      return roomNameFromState;
    }
    return localStorage.getItem('payment_roomName') || '';
  });

  // Restore countdown timer from localStorage
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStartTime = localStorage.getItem('payment_start_time');
    if (savedStartTime) {
      const elapsed = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
      const remaining = 900 - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    // First time: save start time
    localStorage.setItem('payment_start_time', Date.now().toString());
    return 900; // 15 minutes in seconds
  });

  const [selectedMethod, setSelectedMethod] = useState('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [slipImage, setSlipImage] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('payment.invalidFileType') || 'Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('payment.fileTooLarge') || 'File size must be less than 10MB');
      return;
    }

    setSlipImage(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const handleRemoveSlip = () => {
    setSlipImage(null);
    setSlipPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSlipToCloudinary = async () => {
    if (!slipImage) return null;

    setUploadingSlip(true);
    const formData = new FormData();
    formData.append('slip', slipImage);

    try {
      const response = await api.post('/booking/upload-slip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (err) {
      console.error('Error uploading slip:', err);
      toast.error(t('payment.uploadFailed') || 'Failed to upload slip. Please try again.');
      return null;
    } finally {
      setUploadingSlip(false);
    }
  };

  const handlePayment = async () => {
    if (!slipImage) {
      toast.error(t('payment.pleaseUploadSlip') || 'Please upload your payment slip');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Upload slip to Cloudinary first
      const slipImageUrl = await uploadSlipToCloudinary();
      if (!slipImageUrl) {
        setIsProcessing(false);
        return;
      }

      // 2. Create payment record with slip image URL
      const payload = {
        bookingId: booking.id,
        method: selectedMethod.toUpperCase(),
        amount: booking.total_price,
        slipImageUrl: slipImageUrl
      };
      await api.post('/booking/payment', payload);

      // 3. Clear payment session data from localStorage
      localStorage.removeItem('payment_booking');
      localStorage.removeItem('payment_roomName');
      localStorage.removeItem('payment_start_time');

      // 4. Store payment time in localStorage for success page
      const paymentTime = Date.now();
      localStorage.setItem(`paymentTime_${booking.id}`, paymentTime.toString());

      // 5. Navigate to success page
      navigate('/success', { state: { booking, roomName, paymentTime: new Date(paymentTime).toISOString() } });
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error(t('payment.failed') || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking) {
    return <div className="p-20 text-center">{t('payment.noBooking')}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Countdown Header */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between mb-8">
           <div className="flex items-center gap-3 text-orange-700">
              <Clock size={20} />
              <span className="font-medium text-sm">{t('payment.roomHeld')}</span>
           </div>
           <span className="text-2xl font-mono font-bold text-orange-700">{formatTime(timeLeft)}</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
           {/* Summary Section */}
           <div className="p-8 border-b border-gray-100 bg-slate-50">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">{t('payment.totalAmount')}</p>
              <h1 className="text-4xl font-bold text-gray-900">{formatPrice(booking.total_price)}</h1>
           </div>

           {/* Payment Methods */}
           <div className="p-8 space-y-6">
              <h2 className="text-xl font-bold">{t('payment.selectMethod')}</h2>

              <div className="grid grid-cols-1 gap-4">
                 {/* BCEL ONE QR Code */}
                 <button
                  onClick={() => setSelectedMethod('qr')}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${selectedMethod === 'qr' ? 'border-primary bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
                          <QrCode size={24} />
                       </div>
                       <div className="text-left">
                          <p className="font-bold text-gray-900">{t('payment.bcelOne') || 'BCEL ONE'}</p>
                          <p className="text-xs text-gray-500">{t('payment.bcelOneDesc') || 'Scan with BCEL ONE mobile banking'}</p>
                       </div>
                    </div>
                    {selectedMethod === 'qr' && <CheckCircle2 className="text-primary" size={24} />}
                 </button>
              </div>

              {/* Action */}
              <div className="pt-6">
                 {selectedMethod === 'qr' && (
                    <div className="bg-gray-50 p-6 rounded-2xl flex flex-col items-center mb-6 animate-in fade-in zoom-in duration-300">
                       <p className="text-sm font-medium mb-4">{t('payment.scanBCEL') || 'Scan QR Code with BCEL ONE'}</p>
                       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          {/* BCEL ONE QR Code - Replace src with your actual QR Code URL */}
                          <img
                             src="https://res.cloudinary.com/dp3pkwg2f/image/upload/v1779356412/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20260430161118_118_18_o9mktj.jpg"
                             alt="BCEL ONE QR Code"
                             className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] object-contain rounded-lg"
                          />
                       </div>
                       <div className="mt-4 text-center">
                          <p className="text-sm font-semibold text-gray-700">{t('payment.accountName') || 'Account Name'}</p>
                          <p className="text-ms text-gray-500">AMKHA VILAITHA MR</p>
                       </div>
                       <p className="text-ms text-gray-400 mt-4 italic">{t('payment.uploadSlipHint') || 'Please upload your payment slip below after transfer'}</p>
                    </div>
                 )}

                 {/* Slip Upload Section */}
                 <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      {t('payment.uploadSlip') || 'Upload Payment Slip'} <span className="text-red-500">*</span>
                    </h3>

                    <div className="text-center">
                       <input
                         type="file"
                         ref={fileInputRef}
                         onChange={handleFileSelect}
                         accept="image/jpeg,image/jpg,image/png,image/webp"
                         className="hidden"
                       />
                       <div className="flex items-center gap-3 mb-4">
                           <button
                             onClick={() => fileInputRef.current?.click()}
                             className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors shrink-0 border border-gray-300"
                           >
                             {t('payment.chooseFile') || 'Choose File'}
                           </button>
                           <span className="text-sm text-gray-500 truncate">
                             {slipImage ? slipImage.name : (t('payment.noFileChosen') || 'No file chosen')}
                           </span>
                        </div>

                       {slipPreview && (
                          <div className="mt-4">
                             <p className="text-sm text-gray-700 mb-2 text-left">{t('payment.selectedImage') || 'Selected image:'}</p>
                             <div className="relative inline-block">
                                <img
                                  src={slipPreview}
                                  alt="Payment slip"
                                  className="max-h-[400px] object-contain rounded-xl border border-gray-200"
                                />
                                <button
                                  onClick={handleRemoveSlip}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                                >
                                   <X size={16} />
                                </button>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 <button
                  onClick={handlePayment}
                  disabled={isProcessing || uploadingSlip}
                  className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${isProcessing || uploadingSlip ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black shadow-black/10'}`}
                 >
                   {isProcessing || uploadingSlip ? (
                     <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        {uploadingSlip ? (t('payment.uploading') || 'Uploading...') : (t('payment.processing') || 'Processing...')}
                     </span>
                   ) : (
                     t('payment.confirm') || 'Confirm Payment'
                   )}
                 </button>
              </div>
           </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
           {t('payment.secureFooter')}
        </p>
      </div>
    </div>
  );
}
