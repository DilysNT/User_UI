"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useEffect, Suspense } from "react";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const createFailedBooking = async () => {
      try {
        // Lấy pending payment data
        const pendingPaymentData = localStorage.getItem("pendingPayment");
        if (!pendingPaymentData) {
          console.log('No pending payment data found');
          return;
        }

        const paymentData = JSON.parse(pendingPaymentData);
        
        // Log thông tin lỗi để debug
        const errorInfo = {
          orderId: searchParams.get("orderId"),
          method: searchParams.get("method"),
          error: searchParams.get("error"),
          status: searchParams.get("status"),
          responseCode: searchParams.get("vnp_ResponseCode"),
          resultCode: searchParams.get("resultCode")
        };
        
        console.log('❌ Payment failed:', errorInfo);
        
        // Tạo booking với status "failed" để track user behavior
        const failedBookingPayload = {
          ...paymentData.pendingBooking,
          status: 'failed', // Track failed attempt
          payment_status: 'failed',
          payment_method: searchParams.get("method") || 'unknown',
          payment_reference: searchParams.get("orderId") || null,
          failure_reason: errorInfo.error || `Payment failed - Code: ${errorInfo.responseCode || errorInfo.resultCode}`,
          failed_at: new Date().toISOString()
        };

        // Gọi API tạo booking với status failed
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(paymentData.authToken && { 'Authorization': `Bearer ${paymentData.authToken}` })
          },
          body: JSON.stringify(failedBookingPayload)
        });

        if (response.ok) {
          const failedBooking = await response.json();
          console.log('✅ Failed booking tracked:', failedBooking.id);
          
          // Lưu failed booking ID để có thể retry với cùng booking
          localStorage.setItem("failedBookingId", failedBooking.id.toString());
        } else {
          console.error('Failed to create failed booking:', response.statusText);
        }
        
        // Clear pending payment sau khi đã track
        localStorage.removeItem("pendingPayment");
        
      } catch (error) {
        console.error('Error creating failed booking:', error);
        // Clear data even if failed to create booking
        localStorage.removeItem("pendingPayment");
      }
    };

    createFailedBooking();
  }, [searchParams]);
  
  const handleRetry = () => {
    // Lấy thông tin payment để retry
    const paymentData = localStorage.getItem("paymentData");
    const failedBookingId = localStorage.getItem("failedBookingId");
    
    if (paymentData) {
      try {
        const parsed = JSON.parse(paymentData);
        
        // Thêm failed booking ID vào payment data để retry
        if (failedBookingId) {
          parsed.retryBookingId = failedBookingId;
          localStorage.setItem("paymentData", JSON.stringify(parsed));
        }
        
        router.push(`/tour/${parsed.tour.id}/payment`);
      } catch (error) {
        console.error('Error parsing payment data for retry:', error);
        router.push("/confirmation");
      }
    } else {
      router.push("/confirmation");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Thanh toán thất bại!</h2>
          <p className="text-gray-600 mb-4">
            Thanh toán không thành công. Booking đã được ghi nhận với trạng thái "Thất bại".
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Bạn có thể thử lại thanh toán hoặc chọn phương thức khác.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              Thử lại thanh toán
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
} 