"use client"

import { useState, useEffect } from "react"
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

export default function Payment({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("vnpay")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<null | "success" | "error">(null)

  useEffect(() => {
    // Lấy bookingId từ params.id
    const bookingId = params.id;
    if (!bookingId) return;
    
    // Kiểm tra localStorage trước để lấy thông tin tour đã lưu từ Booking
    const savedBookingData = localStorage.getItem("bookingData");
    if (savedBookingData) {
      try {
        const parsedData = JSON.parse(savedBookingData);
        // Sử dụng dữ liệu từ localStorage nếu có
        setBookingData(parsedData);
        return;
      } catch (error) {
        console.warn('Failed to parse saved booking data:', error);
      }
    }
    
    // Nếu không có localStorage, fetch từ API
    fetch(`http://localhost:5000/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => setBookingData(data))
      .catch(() => setBookingData(null));
  }, [params.id]);

  const handlePayment = () => {
    if (!agreeToTerms) {
      alert("Vui lòng đồng ý với điều khoản thanh toán")
      return
    }
    setIsProcessing(true)
    const bookingId = params.id;
    if (!bookingId) {
      alert('Không tìm thấy thông tin booking!');
      setIsProcessing(false);
      return;
    }
    if (paymentMethod === "vnpay") {
      fetch(`http://localhost:5000/api/payments/vnpay/create-payment?bookingId=${bookingId}`)
        .then(res => res.json())
        .then(result => {
          setIsProcessing(false);
          if (result.paymentUrl) {
            // Thay vì redirect trực tiếp, backend sẽ redirect về FE với các query param cần thiết
            window.location.href = result.paymentUrl;
          } else {
            // Nếu không nhận được link thanh toán, chuyển hướng về payment-failed với params
            router.push(`/payment-failed?orderId=${bookingId}&method=VNPay&error=no_payment_url&status=failed`);
          }
        })
        .catch((err) => {
          setIsProcessing(false);
          // Nếu lỗi, chuyển hướng về payment-failed với params
          router.push(`/payment-failed?orderId=${bookingId}&method=VNPay&error=exception&status=failed`);
        });
    } else if (paymentMethod === "momo") {
      // Kiểm tra tourId trước khi gửi request
      const tourId = tour.id;
      if (!tourId) {
        setIsProcessing(false);
        alert('Không tìm thấy tour');
        return;
      }
      // Sử dụng booking data đã có
      const bookingInfo = booking || bookingData;
      // Sửa: truyền bookingId vào body
      fetch('http://localhost:5001/api/momo/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, tourId })
      })
        .then(res => res.json())
        .then(result => {
          setIsProcessing(false);
          if (result.payUrl) {
            // Lưu thông tin booking, tour, payment_method, tổng giá vào localStorage
            localStorage.setItem("bookingData", JSON.stringify({
              tour: tour,
              booking: bookingInfo,
              payment_method: paymentMethod,
              total_price: totalAmount,
              contact: guests && guests[0] ? {
                name: guests[0].name,
                email: guests[0].email,
                phone: guests[0].phone,
                cccd: guests[0].cccd
              } : null
            }));
            window.location.href = result.payUrl;
          } else {
            alert('Không nhận được link thanh toán!');
          }
        })
        .catch(() => {
          setIsProcessing(false);
          alert('Tạo thanh toán thất bại!');
        });
    } else {
      setIsProcessing(false);
      alert('Phương thức thanh toán này chưa được hỗ trợ. Vui lòng chọn Momo hoặc VNPay để thanh toán.');
    }
  }

  if (!bookingData) {
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

  // Lấy thông tin từ booking trả về từ API hoặc localStorage
  if (!bookingData) return null;
  
  // Ưu tiên lấy thông tin từ tour data đã lưu (từ TourDetail -> Booking -> Payment)
  const tour = bookingData.tour || {};
  const booking = bookingData.booking || bookingData;
  const departureDateObj = booking.departureDate || {};
  const guests = booking.guests || [];
  
  // Debug log để kiểm tra dữ liệu
  console.log('Payment component data:', {
    bookingData,
    tour,
    booking,
    image: tour.image,
    location: tour.location,
    destination: tour.destination
  });
  
  const departureDate = departureDateObj.departure_date
    ? new Date(departureDateObj.departure_date).toLocaleDateString("vi-VN")
    : "Chưa chọn";
  
  // Tính toán giá trước và sau khi giảm - ưu tiên từ booking data
  const originalPrice = booking.original_price ? Number(booking.original_price) : 0;
  const discountAmount = booking.discount_amount ? Number(booking.discount_amount) : 0;
  const totalAmount = booking.total_price ? Number(booking.total_price) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2" onClick={() => router.back()} disabled={isProcessing}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">Thanh toán</h1>
        </div>

        {paymentStatus === "success" ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đặt tour. Chúng tôi đang chuyển hướng bạn đến trang xác nhận...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Phương thức thanh toán</h2>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    <div className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="vnpay" id="vnpay" />
                      <div className="relative h-8 w-12">
                        <Image src="/vnpay.png" alt="VNPay" fill className="object-contain" />
                      </div>
                      <div>
                        <div className="font-medium">VNPay</div>
                        <div className="text-sm text-gray-500">Thanh toán an toàn qua cổng VNPay</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="zalopay" id="zalopay" />
                      <div className="relative h-8 w-12">
                        <Image src="/zalopay.png" alt="ZaloPay" fill className="object-contain" />
                      </div>
                      <div>
                        <div className="font-medium">ZaloPay</div>
                        <div className="text-sm text-gray-500">Thanh toán qua ví điện tử ZaloPay</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="momo" id="momo" />
                      <div className="relative h-8 w-12">
                        <Image src="/momo.png" alt="Momo" fill className="object-contain" />
                      </div>
                      <div>
                        <div className="font-medium">Momo</div>
                        <div className="text-sm text-gray-500">Thanh toán qua ví điện tử Momo</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="bank" id="bank" />
                      <div className="relative h-8 w-12">
                        <Image src="/bank.png" alt="Ngân hàng" fill className="object-contain" />
                      </div>
                      <div>
                        <div className="font-medium">Chuyển khoản ngân hàng</div>
                        <div className="text-sm text-gray-500">Thanh toán qua tài khoản ngân hàng</div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Terms */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Điều khoản thanh toán</h2>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Chính sách thanh toán</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                          <li>Thanh toán đầy đủ 100% giá trị tour khi đặt tour trước 7 ngày so với ngày khởi hành.</li>
                          <li>
                            Đối với booking đặt tour trong vòng 7 ngày so với ngày khởi hành, Quý khách vui lòng thanh
                            toán 100% giá trị tour ngay khi đặt tour.
                          </li>
                          <li>Thanh toán bằng VNĐ thông qua chuyển khoản hoặc thanh toán trực tuyến.</li>
                          <li>Sau khi thanh toán, hệ thống sẽ tự động gửi email xác nhận đặt tour thành công.</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Chính sách hủy tour</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                          <li>Hủy tour trước 15 ngày so với ngày khởi hành: Hoàn 100% tiền tour.</li>
                          <li>Hủy tour từ 8-14 ngày so với ngày khởi hành: Phí hủy 30% tiền tour.</li>
                          <li>Hủy tour từ 5-7 ngày so với ngày khởi hành: Phí hủy 50% tiền tour.</li>
                          <li>Hủy tour từ 3-4 ngày so với ngày khởi hành: Phí hủy 70% tiền tour.</li>
                          <li>Hủy tour trong vòng 48h so với ngày khởi hành: Phí hủy 100% tiền tour.</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>Chính sách hoàn tiền</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                          <li>
                            Việc hoàn tiền sẽ được thực hiện trong vòng 7-15 ngày làm việc kể từ ngày Travel Tour xác
                            nhận yêu cầu hủy tour của Quý khách.
                          </li>
                          <li>Tiền hoàn sẽ được chuyển vào tài khoản ngân hàng mà Quý khách đã thanh toán ban đầu.</li>
                          <li>Trường hợp tour bị hủy bởi công ty du lịch: Hoàn 100% tiền tour.</li>
                          <li>
                            Trường hợp bất khả kháng (thiên tai, dịch bệnh, chiến tranh...): Công ty sẽ đề xuất phương
                            án giải quyết phù hợp.
                          </li>
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
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreeToTerms}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8"
                >
                  {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </Button>
              </div>
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
                        <h3 className="font-medium">{tour.name || tour.title}</h3>
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
                        <span className="font-medium">{departureDateObj.number_of_days || "--"} ngày {departureDateObj.number_of_nights || "--"} đêm</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Người lớn:</span>
                        <div className="flex items-center">
                          <span className="font-medium">{booking.number_of_adults || tour.adults || 0} x</span>
                          <span className="ml-1">{(tour.price || 0).toLocaleString("vi-VN")}₫</span>
                        </div>
                      </div>
                      {(booking.number_of_children || tour.children) > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Trẻ em:</span>
                          <div className="flex items-center">
                            <span className="font-medium">{booking.number_of_children || tour.children} x</span>
                            <span className="ml-1">{((tour.price || 0) * 0.7).toLocaleString("vi-VN")}₫</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Hiển thị giá trước và sau khi giảm */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tạm tính:</span>
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
                          {booking.promo_code && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Mã giảm giá:</span>
                              <span className="text-xs font-medium text-green-600">{booking.promo_code}</span>
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
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 Travel Tour. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
