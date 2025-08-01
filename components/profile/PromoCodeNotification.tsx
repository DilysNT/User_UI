import { useState, useEffect } from 'react';
import { X, Gift, Check, Copy } from 'lucide-react';

interface PromoCodeNotificationProps {
  show: boolean;
  promoCode: string;
  description: string;
  onClose: () => void;
}

export default function PromoCodeNotification({ 
  show, 
  promoCode, 
  description, 
  onClose 
}: PromoCodeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      // Reset copied state when hiding
      setIsCopied(false);
    }
  }, [show, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const copyToClipboard = async () => {
    try {
      // Kiểm tra xem navigator.clipboard có khả dụng không
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promoCode);
        setIsCopied(true);
        // Reset trạng thái sau 2 giây
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback cho các trường hợp không hỗ trợ clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = promoCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error('Không thể sao chép mã giảm giá:', err);
          alert('Không thể sao chép tự động. Mã giảm giá của bạn là: ' + promoCode);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Lỗi khi sao chép:', err);
      alert('Không thể sao chép tự động. Mã giảm giá của bạn là: ' + promoCode);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999] pointer-events-none">
      <div 
        className={`
          bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg shadow-2xl p-6 mx-4 max-w-md w-full
          transform transition-all duration-300 pointer-events-auto
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">🎉 Chúc mừng!</h3>
              <p className="text-sm opacity-90">Bạn nhận được mã giảm giá mới</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-xl tracking-wider">{promoCode}</div>
              <div className="text-sm opacity-90 mt-1">{description}</div>
            </div>
            <button
              onClick={copyToClipboard}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                isCopied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-green-600 hover:bg-gray-100'
              }`}
              disabled={isCopied}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Sao chép
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-sm opacity-90">
          <p>💡 Sử dụng mã này để giảm giá cho lần đặt tour tiếp theo của bạn!</p>
        </div>
      </div>
    </div>
  );
}
