"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmationPage from "@/components/details/Confirmation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isCreatingBooking, setIsCreatingBooking] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createBookingFromPayment = async () => {
      let pendingBooking;
      let authToken;
      let paymentMethod;
      try {
        let pendingPaymentData = localStorage.getItem("paymentData") || 
                                localStorage.getItem("pendingPayment") ||
                                localStorage.getItem("pendingBookingData");
        if (!pendingPaymentData) {
          setError('Không tìm thấy thông tin thanh toán. Vui lòng thử lại.');
          setIsCreatingBooking(false);
          return;
        }
        let paymentData;
        try {
          paymentData = JSON.parse(pendingPaymentData);
        } catch (e) {
          setError('Dữ liệu thanh toán bị lỗi. Vui lòng thử lại.');
          setIsCreatingBooking(false);
          return;
        }
        if (paymentData && paymentData.pendingBooking) {
          pendingBooking = paymentData.pendingBooking;
          authToken = paymentData.authToken;
          paymentMethod = paymentData.paymentMethod || "vnpay";
        } else {
          setError('Không tìm thấy thông tin booking. Vui lòng thử lại.');
          setIsCreatingBooking(false);
          return;
        }

        // Lấy thông tin từ URL
        const bookingIdFromUrl = searchParams.get("bookingId") || searchParams.get("orderId");
        if (bookingIdFromUrl) {
          setBookingId(bookingIdFromUrl);
          setIsCreatingBooking(false);
          return;
        }

        // Nếu không có bookingId từ BE, tạo booking mới
        const headers = {
          'Content-Type': 'application/json',
        };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const bookingPayload = {
          ...pendingBooking,
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: paymentMethod,
        };
        const bookingRes = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers,
          body: JSON.stringify(bookingPayload),
        });
        if (!bookingRes.ok) {
          const errorData = await bookingRes.json();
          setError(errorData.message || 'Không thể tạo booking sau thanh toán');
          setIsCreatingBooking(false);
          return;
        }
        const bookingResult = await bookingRes.json();
        const newBookingId = bookingResult.data?.id || bookingResult.id;
        setBookingId(newBookingId);
        setIsCreatingBooking(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        setIsCreatingBooking(false);
      }
    };
    createBookingFromPayment();
  }, [searchParams]);

  // Các return JSX phải nằm ở đây, ngoài useEffect
  if (isCreatingBooking) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600">Đang tạo booking cho bạn...</p>
          </div>
        </div>
        <DebugURLParams />
      </>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Đặt tour thất bại</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Thanh toán đã thành công nhưng không thể tạo booking. Vui lòng liên hệ hỗ trợ.
          </p>
        </div>
      </div>
    );
  }
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin booking</p>
        </div>
      </div>
    );
  }
  return <BookingConfirmationPage params={{ id: bookingId }} />;
}

// Debug component hiển thị URL params
const DebugURLParams = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const searchParams = useSearchParams();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded max-w-md overflow-auto z-50">
      <h4 className="font-bold mb-2">Payment Callback Params:</h4>
      <ul className="space-y-1">
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {decodeURIComponent(value)}
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-gray-500">
        <div className="font-bold">Payment Type:</div>
        <div>
          {searchParams.get("vnp_ResponseCode") ? "VNPay" : 
           searchParams.get("resultCode") ? "MoMo" : "Unknown"}
        </div>
      </div>
    </div>
  );
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin booking...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 