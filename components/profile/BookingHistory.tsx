import { Star, Eye } from "lucide-react";
import React, { useState, useEffect } from 'react';

function getStatusText(status) {
  const normalizedStatus = (status || '').trim().toLowerCase();
  
  switch (normalizedStatus) {
    case "confirmed": return "Đã xác nhận";
    case "completed": return "Hoàn thành";
    case "cancelled": return "Đã hủy";
    case "pending": return "Chờ xác nhận";
    case "": 
    case "null":
    case "undefined":
      return "Chưa xác định";
    default: 
      return status || "Chưa xác định";
  }
}

function getStatusColor(status) {
  const normalizedStatus = (status || '').trim().toLowerCase();
  
  switch (normalizedStatus) {
    case "confirmed": 
      return "text-green-700 bg-green-100 border-green-200";
    case "completed": 
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "cancelled": 
      return "text-red-700 bg-red-100 border-red-200";
    case "pending": 
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    case "":
    case "null":
    case "undefined":
    default:
      return "text-gray-700 bg-gray-100 border-gray-200";
  }
}

export default function BookingHistory({ bookings, onReview, onViewDetails, onCancelBooking, onCancelClick }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCancelClick = (booking) => {
    // Sử dụng callback từ parent component thay vì router
    if (onCancelClick) {
      onCancelClick(booking);
    } else {
      // Fallback: redirect trực tiếp nếu không có callback
      window.open(`/cancel-tour/${booking.id}`, '_blank');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Lịch sử đặt tour</h2>

      <div className="space-y-6">
        {bookings.length === 0 && (
          <div className="text-gray-400 text-center py-16">
            <div className="text-lg">Bạn chưa có lịch sử đặt tour nào.</div>
          </div>
        )}
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-gray-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex-1 space-y-3">
              <div className="font-semibold text-lg text-gray-900">
                {booking.tour?.name
                  || booking.tour_name
                  || (booking.tour_id ? `Tour #${booking.tour_id}` : null)
                  || booking.promotion?.description
                  || 'Chưa có thông tin tour'}
              </div>
              <div className="text-base text-gray-600 flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Ngày đi: {booking.departure_date}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Trạng thái:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-3 lg:ml-6">
              <button 
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-5 py-3 rounded-xl text-sm font-medium border-2 border-blue-200 transition-all duration-200 hover:border-blue-300 min-w-[120px] justify-center"
                onClick={() => onViewDetails && onViewDetails(booking)}
              >
                <Eye size={18} />
                Chi tiết
              </button>
              
              {/* Nút hủy tour - chỉ hiện với booking chưa hủy, chưa hoàn thành, và ngày khởi hành >= hôm nay */}
              {(() => {
                const status = (booking.status || '').toLowerCase();
                let canCancel = false;
                if (status === 'confirmed' && booking.departure_date) {
                  const today = new Date();
                  const dep = new Date(booking.departure_date);
                  dep.setHours(0,0,0,0);
                  today.setHours(0,0,0,0);
                  canCancel = dep >= today;
                }
                return canCancel ? (
                  <button 
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl text-sm font-medium border-2 border-red-200 transition-all duration-200 hover:border-red-300 min-w-[120px] justify-center"
                    onClick={() => handleCancelClick(booking)}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy tour
                  </button>
                ) : null;
              })()}
              
              {booking.review ? (
                <div className="flex flex-col items-end max-w-[240px] lg:ml-4">
                  <div className="flex items-center mb-2">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-6 h-6 ${i <= booking.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 italic text-right break-words leading-relaxed">{booking.review.comment}</div>
                </div>
              ) : (
                ((booking.status || '').toLowerCase() === 'completed') && (
                  <button className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md min-w-[120px]" onClick={() => onReview('new', booking)}>
                    Đánh giá
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 