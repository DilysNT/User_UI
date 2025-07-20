"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { CheckCircle2, MapPin, Calendar, Clock, Download, Home } from "lucide-react"
import QRCode from "react-qr-code";

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  const [showQR, setShowQR] = useState(false);
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")

  // Mock data dựa trên API response mà user cung cấp
  useEffect(() => {
    // Kiểm tra mã giảm giá từ URL params hoặc localStorage
    const appliedPromoCode = searchParams.get('promo') || localStorage.getItem('appliedPromoCode');
    
    // Xử lý tính toán giá theo mã giảm giá
    let mockData;
    
    if (appliedPromoCode === 'JULY2507') {
      // Mã JULY2507: Giảm cố định 500.000đ
      mockData = {
        "id": "387984fb-af7d-4a86-8b5b-469d2dddd262",
        "status": "confirmed",
        "original_price": "3500000.00",
        "discount_amount": "500000.00",
        "total_price": "3000000.00", // 3.500.000 - 500.000
        "promo_code": "JULY2507",
        "booking_date": "2025-07-19T09:11:52.000Z",
      };
    } else if (appliedPromoCode === 'SUMMER2025') {
      // Mã SUMMER2025: Giảm 10%
      mockData = {
        "id": "387984fb-af7d-4a86-8b5b-469d2dddd262", 
        "status": "confirmed",
        "original_price": "3500000.00",
        "discount_amount": "350000.00", // 10% của 3.500.000
        "total_price": "3150000.00", // 3.500.000 - 350.000
        "promo_code": "SUMMER2025",
        "booking_date": "2025-07-19T09:11:52.000Z",
      };
    } else {
      // Không có mã giảm giá
      mockData = {
        "id": "387984fb-af7d-4a86-8b5b-469d2dddd262",
        "status": "confirmed", 
        "original_price": "3500000.00",
        "discount_amount": "0.00",
        "total_price": "3500000.00",
        "booking_date": "2025-07-19T09:11:52.000Z",
      };
    }
    
    // Thêm thông tin tour, user, payment cho tất cả các trường hợp
    const commonData = {
      "tour": {
        "name": "Tour du lịch Đà Lạt 4N3Đ - Trải nghiệm ngàn hoa",
        "location": "Đà Lạt", 
        "departure_location": "Hồ Chí Minh",
        "images": [{"image_url": "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg", "is_main": true}]
      },
      "user": {
        "name": "Guest User",
        "email": "guest@tour.com"
      },
      "payment": {
        "payment_method": "VNPay",
        "status": "completed",
        "amount": mockData.total_price
      },
      "guests": [
        {
          "name": "NguyenVan A",
          "email": "nhom2@gmail.com", 
          "phone": "0123456789",
          "cccd": "089303002985"
        }
      ],
      "departureDate": {
        "departure_date": "2025-09-05",
        "end_date": "2025-09-06" 
      }
    };

    setBookingData({...mockData, ...commonData});
    setBookingNumber("387984fb-af7d-4a86-8b5b-469d2dddd262");
    setPaymentCompleted(true);
  }, []);

  if (!bookingData || !paymentCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin booking...</p>
        </div>
      </div>
    )
  }

  // Extract data từ API response
  const bookingInfo = bookingData || {};
  const paymentInfo = bookingData?.payment || {};
  const tourInfo = bookingData?.tour || {};
  const userInfo = bookingData?.user || {}; 
  const departureInfo = bookingData?.departureDate || null;
  const guestsInfo = bookingData?.guests || []; 
  
  const displayAmount = paymentInfo.amount ? Number(paymentInfo.amount) : 
                       (bookingInfo.total_price ? Number(bookingInfo.total_price) : 0);

  const primaryGuest = guestsInfo[0] || {};
  const contactName = primaryGuest.name || userInfo.name || "";
  const contactEmail = primaryGuest.email || userInfo.email || "";
  const contactPhone = primaryGuest.phone || "";

  // Lấy hình thức thanh toán
  const paymentMethod = paymentInfo.payment_method;

  console.log('🔍 Payment method debug:', {
    paymentInfo,
    paymentMethod,
    paymentStatus: paymentInfo.status,
    bookingStatus: bookingInfo.status
  });

  let tourImage = "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg";
  if (tourInfo?.images && tourInfo.images.length > 0) {
    const mainImage = tourInfo.images.find((img: any) => img.is_main);
    tourImage = mainImage?.image_url || tourInfo.images[0]?.image_url || "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg";
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header thành công */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h1 className="text-2xl font-bold text-gray-900">Đặt tour thành công!</h1>
              <p className="text-gray-600">
                Cảm ơn bạn đã đặt tour. Thông tin chi tiết đã được gửi về email của bạn.
              </p>
            </div>
            
            {/* Layout mã tour bên trái, button bên phải */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 px-4">
              <div className="bg-white rounded-lg p-4 flex-1 sm:flex-initial sm:min-w-0 sm:max-w-md">
                <p className="text-sm text-gray-500 mb-1">Mã đặt tour</p>
                <p className="text-sm sm:text-base font-bold text-teal-600 break-all">{bookingNumber}</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center w-full sm:w-auto whitespace-nowrap" 
                  onClick={() => setShowQR(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải vé điện tử
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal QR code vé điện tử */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full relative">
              <h2 className="text-lg font-semibold mb-4 text-center">Mã QR vé điện tử</h2>
              <div className="flex justify-center mb-4">
                <div id="qr-download-wrapper">
                  <QRCode
                    id="qr-download-canvas"
                    value={[
                      `Mã đặt tour: ${bookingNumber}`,
                      `Tour: ${tourInfo.name || ""}`,
                      `Địa điểm: ${tourInfo.location || ""}`,
                      departureInfo?.departure_date 
                        ? `Khởi hành: ${new Date(departureInfo.departure_date).toLocaleDateString("vi-VN")}` 
                        : "",
                      `Khách: ${contactName}`,
                      `SĐT: ${contactPhone}`,
                      `Tổng tiền: ${displayAmount.toLocaleString("vi-VN")}₫`,
                      paymentMethod ? `Thanh toán: ${paymentMethod}` : "",
                      `Trạng thái: ${paymentInfo.status || "completed"}`
                    ].filter(Boolean).join("\n")}
                    size={180}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4 text-center">
                Quét mã QR để kiểm tra thông tin vé tại quầy hoặc khi lên xe.
              </div>
              <div className="flex flex-col gap-2">
                <Button className="w-full" variant="outline" onClick={() => {
                  // Tải QR về máy
                  const svg = document.getElementById("qr-download-canvas");
                  if (!svg) return;
                  const serializer = new XMLSerializer();
                  const svgStr = serializer.serializeToString(svg);
                  const canvas = document.createElement("canvas");
                  const img = new window.Image();
                  img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx && ctx.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = pngFile;
                    downloadLink.download = `ve-dien-tu-${bookingNumber}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  };
                  img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgStr)));
                }}>
                  Tải mã về
                </Button>
                <Button className="w-full" onClick={() => setShowQR(false)}>Đóng</Button>
              </div>
            </div>
          </div>
        )}

        {/* Thông tin tour */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin tour</h2>
            <div className="flex gap-6">
              {/* Hình ảnh tour - compact size */}
              <div className="flex-shrink-0">
                <div className="w-48 h-32 relative rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={tourImage}
                    alt={tourInfo.name || "Tour image"}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              
              {/* Thông tin chi tiết */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">{tourInfo.name}</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{tourInfo.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Khởi hành: {departureInfo?.departure_date ? new Date(departureInfo.departure_date).toLocaleDateString("vi-VN") : ""}</span>
                </div>
                {departureInfo?.end_date && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Kết thúc: {new Date(departureInfo.end_date).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin thanh toán */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Chi tiết thanh toán</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Số người (người lớn)</span>
                <span className="font-medium">{guestsInfo.length || 1} người</span>
              </div>
              
              {/* Hiển thị giá gốc */}
              <div className="flex justify-between">
                <span className="text-gray-600">Giá tour gốc</span>
                <span className="font-medium">
                  {Number(bookingInfo.original_price || bookingInfo.total_price).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              
              {/* Hiển thị mã giảm giá nếu có */}
              {bookingInfo.promo_code && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">
                      ✅ Áp dụng mã giảm giá: {bookingInfo.promo_code}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {bookingInfo.promo_code === 'SUMMER2025' 
                      ? 'Giảm giá 10% cho tất cả các tour khởi hành trong tháng 7 và 8.'
                      : bookingInfo.promo_code === 'JULY2507'
                      ? 'Giảm giá cuối tháng cho các du khách vừa hết tiền lương'
                      : 'Mã giảm giá đã được áp dụng'}
                  </div>
                </div>
              )}
              
              {/* Hiển thị số tiền giảm nếu có */}
              {bookingInfo.discount_amount && Number(bookingInfo.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền giảm</span>
                  <span className="font-medium text-green-600">
                    -{Number(bookingInfo.discount_amount).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Giá tour sau giảm</span>
                <span className="font-medium">{displayAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phí VAT</span>
                <span className="font-medium">10%</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-gray-900">Tổng thanh toán</span>
                <span className="text-red-600">{displayAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Hình thức thanh toán</span>
                <span className="font-medium">{
                  paymentMethod ? (
                    paymentMethod.toLowerCase() === 'vnpay' ? 'VNPay' : 
                    paymentMethod.toLowerCase() === 'momo' ? 'MoMo' : 
                    paymentMethod.toLowerCase() === 'bank' ? 'Chuyển khoản ngân hàng' : 
                    paymentMethod
                  ) : 'Chưa xác định'
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái thanh toán</span>
                <span className={`font-medium ${
                  paymentInfo.status === "completed" || paymentInfo.status === "success" ? "text-green-600" :
                  paymentInfo.status === "pending" ? "text-yellow-600" :
                  paymentInfo.status === "failed" ? "text-red-600" : ""
                }`}>{
                  paymentInfo.status === "completed" || paymentInfo.status === "success" ? "Thành công" :
                  paymentInfo.status === "pending" ? "Đang xử lý" :
                  paymentInfo.status === "failed" ? "Thất bại" : 
                  paymentInfo.status || "Không xác định"
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái booking</span>
                <span className={`font-medium ${
                  bookingInfo.status === "confirmed" ? "text-green-600" :
                  bookingInfo.status === "pending" ? "text-yellow-600" :
                  bookingInfo.status === "cancelled" ? "text-red-600" : ""
                }`}>{
                  bookingInfo.status === "confirmed" ? "Đã xác nhận" :
                  bookingInfo.status === "pending" ? "Chờ xử lý" :
                  bookingInfo.status === "cancelled" ? "Đã hủy" :
                  bookingInfo.status || "Không xác định"
                }</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin liên hệ */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
            <div className="space-y-2">
              <div><span className="font-medium">Họ tên:</span> {contactName}</div>
              <div><span className="font-medium">Email:</span> {contactEmail}</div>
              <div><span className="font-medium">Điện thoại:</span> {contactPhone}</div>
            </div>
          </CardContent>
        </Card>

        {/* Lưu ý quan trọng */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-yellow-800 mb-4">Lưu ý quan trọng</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-yellow-800">
              <li>Vui lòng có mặt tại điểm tập trung trước giờ khởi hành 30 phút.</li>
              <li>Mang theo giấy tờ tùy thân (CMND/CCCD/Hộ chiếu) khi tham gia tour.</li>
              <li>Vé điện tử này là bằng chứng xác nhận đặt tour của bạn.</li>
              <li>Liên hệ số hotline <strong>1900 1234</strong> nếu cần hỗ trợ thêm thông tin.</li>
              <li>Trong trường hợp có thay đổi lịch trình, chúng tôi sẽ thông báo trước 24h.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/tour')}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
          <Button
            onClick={() => router.back()}
            className="bg-teal-500 hover:bg-teal-600 text-white"
          >
            Quay lại trang tour
          </Button>
        </div>
      </div>
    </div>
  )
}
