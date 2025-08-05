"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Clock, MapPin, Calendar, ChevronLeft, CheckCircle2, AlertCircle, CreditCard, Wallet, Smartphone, Banknote, Tag, Percent } from "lucide-react"
import Footer from "@/components/home/footer"

export default function Payment({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("vnpay")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<null | "success" | "error">(null)
  const [errorDialog, setErrorDialog] = useState<string | null>(null)
console.log('ádsadatoken', localStorage.getItem('authToken') || localStorage.getItem('token'));
  useEffect(() => {
    // Kiểm tra paymentData từ localStorage (từ Booking.tsx)
    
    const savedPaymentData = localStorage.getItem("paymentData");
    if (savedPaymentData) {
      try {
        const parsedData = JSON.parse(savedPaymentData);
        console.log('Payment data loaded:', parsedData);
        setPaymentData(parsedData);
        
        // Check if this is a retry với failed booking
        if (parsedData.retryBookingId) {
          console.log('🔄 This is a retry payment for booking:', parsedData.retryBookingId);
        }
        
        return;
      } catch (error) {
        console.warn('Failed to parse payment data:', error);
      }
    }
    
    // Nếu không có payment data, redirect về booking page
    alert('Không tìm thấy thông tin đặt tour. Vui lòng thực hiện đặt tour lại.');
    router.push(`/tour/${params.id}/booking`);
  }, [params.id, router]);

  const createBookingAfterPayment = async (paymentResult: any) => {
    try {
      console.log('🎯 Creating booking after successful payment...');
      
      const { pendingBooking, authToken, retryBookingId } = paymentData;
      
      // Chuẩn bị headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Check if this is a retry with existing failed booking
      if (retryBookingId) {
        console.log('🔄 Updating existing failed booking to confirmed:', retryBookingId);
        
        // Update existing booking from failed to confirmed
        const updatePayload = {
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_reference: paymentResult.orderId || paymentResult.transactionId,
          vnp_TransactionNo: paymentResult.vnp_TransactionNo,
          confirmed_at: new Date().toISOString()
        };
        
        const updateRes = await fetch(`http://localhost:5000/api/bookings/${retryBookingId}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(updatePayload)
        });
        
        if (!updateRes.ok) {
          const errorData = await updateRes.json();
          throw new Error(errorData.message || 'Không thể cập nhật booking');
        }
        
        const updatedBooking = await updateRes.json();
        console.log('✅ Updated booking from failed to confirmed:', updatedBooking);
        
        // Clear retry booking ID
        localStorage.removeItem("failedBookingId");
        
        return updatedBooking;
      } else {
        // Tạo booking mới với status confirmed
        const bookingPayload = {
          ...pendingBooking,
          status: 'confirmed', // Xác nhận vì đã thanh toán thành công
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_reference: paymentResult.orderId || paymentResult.transactionId,
          vnp_TransactionNo: paymentResult.vnp_TransactionNo
        };
        
        console.log('📦 Creating new confirmed booking:', bookingPayload);
        
        const bookingRes = await fetch('http://localhost:5000/api/bookings', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(bookingPayload)
        });
        
        if (!bookingRes.ok) {
          const errorData = await bookingRes.json();
          throw new Error(errorData.message || 'Không thể tạo booking sau thanh toán');
        }
        
        const newBooking = await bookingRes.json();
        console.log('✅ Created new confirmed booking:', newBooking);
        
        return newBooking;
      }
      
      // The following code is unreachable and should be removed because all branches above return early.
      // If you need to handle VAT calculation, move this logic into the branches above after booking creation.
      
    } catch (error) {
      console.error('❌ Failed to create booking after payment:', error);
      throw error;
    }
  };

  const handleCancelBooking = async () => {
    try {
      const { pendingBooking, authToken } = paymentData;
      
      // Chuẩn bị headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Tạo booking với status "cancelled" để track user behavior
      const cancelledBookingPayload = {
        ...pendingBooking,
        status: 'cancelled',
        payment_status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: 'User cancelled payment'
      };

      console.log('❌ Creating cancelled booking for tracking:', cancelledBookingPayload);
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(cancelledBookingPayload)
      });

      if (response.ok) {
        const cancelledBooking = await response.json();
        console.log('✅ Cancelled booking tracked:', cancelledBooking.id);
      }
      
      // Clear payment data và redirect
      localStorage.removeItem("paymentData");
      localStorage.removeItem("pendingPayment");
      localStorage.removeItem("failedBookingId");
      
      router.push('/');
    } catch (error) {
      console.error('Error tracking cancelled booking:', error);
      // Vẫn redirect ngay cả khi không track được
      localStorage.removeItem("paymentData");
      localStorage.removeItem("pendingPayment");
      localStorage.removeItem("failedBookingId");
      router.push('/');
    }
  };

  const handlePayment = async () => {
    if (!agreeToTerms) {
      alert("Vui lòng đồng ý với điều khoản thanh toán");
      return;
    }
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Tạo booking pending trước khi gọi payment
      const tourId = paymentData.tour.id;
      const totalAmount = paymentData.tour.total_price;
      const pendingBooking = paymentData.pendingBooking;
      // Gửi booking lên backend, bổ sung payment_method và user_id đúng
      let bookingPayload = { ...pendingBooking, status: 'pending', payment_status: 'pending', payment_method: paymentMethod };
      // Ưu tiên user_id từ localStorage nếu user đang đăng nhập
      let authUserId: string | null = null;
      let authToken: string | null = null;
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (token && typeof token === 'string') {
          authToken = token;
          // Giải mã JWT để lấy user id
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Decoded JWT payload:', payload);
            if (payload && payload.id) authUserId = payload.id;
          }
        }
      } catch {}
      if (authUserId) {
        bookingPayload = { ...bookingPayload, user_id: authUserId, user_type: 'AUTHENTICATED_USER' };
      } else {
        // Đảm bảo không gửi user_id cũ nếu là guest
        const { user_id, ...rest } = bookingPayload;
        bookingPayload = { ...rest, user_type: 'GUEST_USER' };
      }
      // Chuẩn bị headers, thêm Authorization nếu có token
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const bookingRes = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload)
      });
      if (!bookingRes.ok) {
        setIsProcessing(false);
        const errorData = await bookingRes.json().catch(() => ({}));
        if (errorData && errorData.message) {
          setErrorDialog(errorData.message);
        } else {
          setErrorDialog('Không thể tạo booking. Vui lòng thử lại.');
        }
        return;
      }
      const bookingData = await bookingRes.json();
      const bookingId = bookingData.id || bookingData.booking_id;
      if (!bookingId) {
        setIsProcessing(false);
        alert('Không lấy được booking_id từ backend.');
        return;
      }
      // 2. Gọi API thanh toán
      if (paymentMethod === "vnpay") {
        const response = await fetch(`http://localhost:5000/api/payments/vnpay/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            tourId: tourId,
            amount: totalAmount,
            orderInfo: `Thanh toan tour ${paymentData.tour.name}`,
            returnUrl: `${window.location.origin}/confirmation`,
            cancelUrl: `${window.location.origin}/confirmation`,
            payment_method: paymentMethod
          })
        });
        const result = await response.json();
        setIsProcessing(false);
        if (result.message && result.message.includes('Mã giảm giá không áp dụng')) {
          setErrorDialog(result.message);
          return;
        }
        if (result.paymentUrl) {
          localStorage.setItem("pendingPayment", JSON.stringify({
            ...paymentData,
            paymentMethod,
            amount: totalAmount,
            booking_id: bookingId
          }));
          window.location.href = result.paymentUrl;
        } else {
          router.push(`/payment-failed?tourId=${tourId}&method=VNPay&error=no_payment_url&status=failed`);
        }
      } else if (paymentMethod === "momo") {
        // Gửi bookingId lên endpoint MoMo để lấy payment_url
        const response = await fetch('http://localhost:5000/api/payments/momo/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId })
        });
        const result = await response.json();
        setIsProcessing(false);
        if (result.message && result.message.includes('Mã giảm giá không áp dụng')) {
          setErrorDialog(result.message);
          return;
        }
        const momoUrl = result.payment_url || result.payUrl || result.payurl;
        if (momoUrl) {
          localStorage.setItem("pendingPayment", JSON.stringify({
            ...paymentData,
            paymentMethod,
            amount: totalAmount,
            booking_id: bookingId
          }));
          window.location.href = momoUrl;
        } else {
          router.push(`/payment-failed?tourId=${tourId}&method=MoMo&error=no_payment_url&status=failed`);
        }
      } else {
        setIsProcessing(false);
        alert('Vui lòng chọn phương thức thanh toán VNPay hoặc MoMo.');
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('❌ Network error - Backend server may be down or unreachable');
        setErrorDialog('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else {
        setErrorDialog('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
      }
    }
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy thông tin đặt tour</h2>
            <p className="text-gray-600 mb-4">Vui lòng quay lại trang chi tiết tour và thực hiện đặt tour lại.</p>
            <Button
              onClick={() => router.push(`/tour/${params.id}`)}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Quay lại trang tour
            </Button>
          </CardContent>
        </Card>
      </div>
   )
}

  // Lấy thông tin từ paymentData
  if (!paymentData) return null;
  // Ưu tiên lấy thông tin từ tour data đã lưu
  const tour = paymentData.tour || {};
  const pendingBooking = paymentData.pendingBooking || {};
  const guests = pendingBooking.guests || [];

  // Lấy số ngày và số đêm từ departureDates hoặc tour
  let number_of_days = tour.number_of_days;
  let number_of_nights = tour.number_of_nights;
  // Nếu không có, thử lấy từ departureDates
  if ((!number_of_days || !number_of_nights) && tour.departureDates && Array.isArray(tour.departureDates)) {
    const selectedDate = tour.departureDates.find((d: any) => d.id === tour.departure_date_id || d.id === pendingBooking.departure_date_id);
    if (selectedDate) {
      number_of_days = selectedDate.number_of_days || number_of_days;
      number_of_nights = selectedDate.number_of_nights || number_of_nights;
    }
  }

  const departureDate = tour.departure_date_value
    ? new Date(tour.departure_date_value).toLocaleDateString("vi-VN")
    : "Chưa chọn";
  // Tính toán giá từ tour data với fallback
  const originalPrice = tour.original_price ? Number(tour.original_price) : 
                       (tour.price ? (Number(tour.price) * (tour.adults || 1) + Number(tour.price) * 0.7 * (tour.children || 0)) : 0);
  const discountAmount = tour.discount_amount ? Number(tour.discount_amount) : 0;
  const totalAmount = tour.total_price ? Number(tour.total_price) : (originalPrice - discountAmount);
  // Parse số ngày và số đêm từ tên tour nếu dữ liệu không có
  if ((!number_of_days || !number_of_nights) && tour.name) {
    const match = tour.name.match(/(\d+)N(\d+)Đ/i);
    if (match) {
      number_of_days = match[1];
      number_of_nights = match[2];
    }
  }
  // Debug log để kiểm tra dữ liệu giá
  console.log('Payment component pricing debug:', {
    paymentData,
    tour,
    pendingBooking,
    tourOriginalPrice: tour.original_price,
    tourTotalPrice: tour.total_price,
    tourDiscountAmount: tour.discount_amount,
    tourPrice: tour.price,
    tourAdults: tour.adults,
    tourChildren: tour.children,
    calculatedOriginalPrice: originalPrice,
    calculatedTotalAmount: totalAmount,
    calculatedDiscountAmount: discountAmount,
    number_of_days,
    number_of_nights
  });
  return (
    <>
      {/* Dialog hiển thị lỗi */}
      <Dialog open={!!errorDialog} onOpenChange={(open) => { if (!open) setErrorDialog(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" /> Lỗi thanh toán
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-base text-gray-700 whitespace-pre-line">{errorDialog}</div>
          <DialogFooter>
            <Button onClick={() => setErrorDialog(null)} className="bg-teal-500 text-white px-6">Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Nút quay lại trang booking */}
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <Button variant="ghost" className="flex items-center" onClick={() => router.push(`/tour/${params.id}/booking`)}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại trang đặt tour
          </Button>
        </div>
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Payment Form */}
        <div className="lg:col-span-2">
          {/* Payment Terms */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Điều khoản thanh toán</h2>
              {/* Chọn phương thức thanh toán */}
              <div className="mb-6">
                <Label className="block mb-2 text-base font-medium">Phương thức thanh toán</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  {/* VNPay */}
                  <div className={`flex items-center border rounded-lg px-4 py-3 cursor-pointer transition ${paymentMethod === 'vnpay' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white'}`}
                    onClick={() => setPaymentMethod('vnpay')}>
                    <RadioGroupItem value="vnpay" id="vnpay" className="mr-4" />
                    <img src="/vnpay.png" alt="VNPay" className="w-10 h-10 mr-4" />
                    <div>
                      <div className="font-semibold">VNPay</div>
                      <div className="text-sm text-gray-500">Thanh toán an toàn qua cổng VNPay</div>
                    </div>
                  </div>
                  {/* MoMo */}
                  <div className={`flex items-center border rounded-lg px-4 py-3 cursor-pointer transition ${paymentMethod === 'momo' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white'}`}
                    onClick={() => setPaymentMethod('momo')}>
                    <RadioGroupItem value="momo" id="momo" className="mr-4" />
                    <img src="/momo.png" alt="MoMo" className="w-10 h-10 mr-4" />
                    <div>
                      <div className="font-semibold">MoMo</div>
                      <div className="text-sm text-gray-500">Thanh toán qua ví điện tử Momo</div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Chính sách thanh toán</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                      <li>Khách có thể thanh toán qua VNPay, MoMo hoặc các phương thức khác (nếu có).</li>
                      <li>Sau khi thanh toán thành công, hệ thống gửi email xác nhận booking.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Chính sách hủy tour</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                      <li>Khách đăng nhập (user) hoặc đại lý (agency) chỉ được hủy booking của mình.</li>
                      <li>Khách vãng lai (guest) có thể hủy booking qua link và cancelToken.</li>
                      <li>Không thể hủy nếu tour đã khởi hành hoặc booking đã bị hủy.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Chính sách hoàn tiền</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                      <li>Hủy trước 7 ngày so với ngày khởi hành: hoàn 100% (trừ phí không hoàn lại).</li>
                      <li>Hủy trước 3-7 ngày: hoàn 50% (trừ phí không hoàn lại).</li>
                      <li>Hủy trong vòng 3 ngày: không hoàn tiền.</li>
                      <li>Nếu agency là người hủy: luôn hoàn 100%.</li>
                      <li>Các loại phí không hoàn lại: visa, đặt cọc, phí thanh toán, vé máy bay (nếu có).</li>
                      <li>Nếu đủ thông tin giao dịch, hệ thống sẽ hoàn tiền tự động qua VNPay/MoMo.</li>
                      <li>Nếu không đủ thông tin hoặc lỗi, hoàn tiền thủ công (CSKH liên hệ khách).</li>
                      <li>Khách sẽ nhận email thông báo trạng thái hoàn tiền (tự động hoặc thủ công).</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="mt-6 flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tôi đã đọc và đồng ý với các điều khoản thanh toán
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Bằng cách đánh dấu vào ô này, bạn đồng ý với các điều khoản thanh toán và chính sách hủy tour.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  onClick={handleCancelBooking}
                  variant="outline"
                  disabled={isProcessing}
                  className="px-6"
                >
                  Hủy đặt tour
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreeToTerms}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8"
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image 
                      src={tour.image || "/placeholder.svg"} 
                      alt={tour.name || tour.title || "Tour"} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{(tour.name || tour.title)?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có'}</h3>
                    {(tour.rating || tour.reviews) && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{tour.rating || "• đánh giá"}</span>
                        {tour.reviews && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{tour.reviews} đánh giá</span>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{tour.location || tour.destination || 'Việt Nam'}</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Ngày khởi hành:</span>
                    </div>
                    <span className="font-medium">{departureDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Thời gian:</span>
                    </div>
                    <span className="font-medium">{number_of_days || "--"} ngày {number_of_nights || "--"} đêm</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Người lớn:</span>
                    <div className="flex items-center">
                      <span className="font-medium">{pendingBooking.number_of_adults || tour.adults || 0} x</span>
                      <span className="ml-1">{(tour.price || 0).toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                  {(pendingBooking.number_of_children || tour.children) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trẻ em:</span>
                      <div className="flex items-center">
                        <span className="font-medium">{pendingBooking.number_of_children || tour.children} x</span>
                        <span className="ml-1">{((tour.price || 0) * 0.7).toLocaleString("vi-VN")}₫</span>
                      </div>
                    </div>
                  )}
                </div>
                <Separator className="my-4" />
                {/* Hiển thị giá trước và sau khi giảm */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Giá gốc:</span>
                    <span className={`font-medium ${discountAmount > 0 ? 'line-through text-gray-500' : ''}`}>
                      {originalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">Giảm giá:</span>
                        <span className="font-medium text-green-600">-{discountAmount.toLocaleString("vi-VN")}₫</span>
                      </div>
                      {tour.promo_description && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Mã giảm giá:</span>
                          <span className="text-xs font-medium text-green-600">{tour.promo_description}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Tổng thanh toán:</span>
                    <span className="text-red-500">{totalAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="text-xs text-green-600 text-right flex items-center justify-end gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Bạn đã tiết kiệm {discountAmount.toLocaleString("vi-VN")}₫</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        -{((discountAmount / originalPrice) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-gray-500">* Giá đã bao gồm thuế và phí dịch vụ</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  )
}
