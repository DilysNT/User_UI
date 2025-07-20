import { Star } from "lucide-react";

function getStatusText(status) {
  switch ((status || '').toLowerCase()) {
    case "confirmed": return "Đã xác nhận";
    case "completed": return "Hoàn thành";
    case "cancelled": return "Đã hủy";
    default: return status || "Chưa xác định";
  }
}

export default function BookingHistory({ bookings, onReview }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch sử đặt tour</h2>
      <div className="space-y-4">
        {bookings.length === 0 && (
          <div className="text-gray-400 text-center py-12">Bạn chưa có lịch sử đặt tour nào.</div>
        )}
        {bookings.map((booking) => (
          <div key={booking.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="font-medium">{booking.tour_name}</div>
              <div className="text-sm text-gray-500">Ngày đi: {booking.departure_date}</div>
              <div className="text-sm text-gray-500">Trạng thái: {getStatusText(booking.status)}</div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-2">
              {booking.review ? (
                <div className="flex flex-col items-end max-w-[220px] ml-auto">
                  <div className="flex items-center mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= booking.review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 italic text-right break-words">{booking.review.comment}</div>
                </div>
              ) : (
                (["confirmed", "completed"].includes((booking.status || '').toLowerCase())) && (
                  <button className="bg-teal-500 text-white px-3 py-1 rounded" onClick={() => onReview('new', booking)}>
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