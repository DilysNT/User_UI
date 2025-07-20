import { useEffect } from 'react';

interface CommissionNotificationProps {
  bookingId: string | null;
  agencyId: string | null;
  onCommissionCalculated?: (result: any) => void;
}

export default function CommissionNotification({ 
  bookingId, 
  agencyId, 
  onCommissionCalculated 
}: CommissionNotificationProps) {
  
  useEffect(() => {
    if (!bookingId || !agencyId) return;
    
    const calculateCommission = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/commissions/calculate/${bookingId}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` 
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Log thành công (có thể thay bằng notification system khác)
          console.log(`Commission calculated: ${result.agency_amount?.toLocaleString("vi-VN")}₫ for booking ${bookingId}`);
          
          onCommissionCalculated?.(result);
        } else {
          console.warn('Commission calculation failed:', response.status);
        }
      } catch (error) {
        console.warn('Commission calculation error:', error);
      }
    };
    
    // Delay một chút để đảm bảo booking đã được tạo xong
    const timer = setTimeout(calculateCommission, 2000);
    return () => clearTimeout(timer);
  }, [bookingId, agencyId, onCommissionCalculated]);
  
  return null; // Component này không render gì
}
