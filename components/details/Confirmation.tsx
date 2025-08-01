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
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<any>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [bookingNumber, setBookingNumber] = useState("")

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data thật từ API dựa trên URL params
  useEffect(() => {
    if (!mounted) return; // Only run after component is mounted
    
    // Kiểm tra searchParams không null trước khi sử dụng
    if (!searchParams) {
      console.warn('⚠️ searchParams is null, using fallback mock data');
      // Sử dụng mock data khi không có searchParams
      const mockBookingData = {
        id: "mock-booking-id-001",
        status: "confirmed",
        original_price: "10400000.00",
        discount_amount: "1040000.00",
        total_price: "9360000",
        promotion_id: "promo-summer-2025",
        booking_date: new Date().toISOString(),
        number_of_adults: 2,
        number_of_children: 0,
        tour: {
          name: "Tour khám phá Đà Nẵng - Hội An 4N3Đ",
          location: "Đà Nẵng",
          departure_location: "Hồ Chí Minh",
          images: [{
            image_url: "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg",
            is_main: true
          }]
        },
        user: {
          name: "Guest User",
          email: "guest@tour.com"
        },
        payment: {
          payment_method: "VNPay",
          status: "completed",
          amount: "9360000",
          order_id: "MOCK_ORDER_" + Date.now()
        },
        guests: [{
          name: "Nguyen Van A",
          email: "guest@tour.com",
          phone: "0123456789",
          cccd: "089303002985"
        }],
        departureDate: {
          departure_date: "2025-09-05",
          end_date: "2025-09-08"
        }
      };
      
      setBookingData(mockBookingData);
      setBookingNumber("mock-booking-id-001");
      setPaymentCompleted(true);
      return;
    }
    
    // Lấy orderId và bookingId từ URL parameters
    const orderId = searchParams.get('orderId');
    const bookingId = searchParams.get('bookingId');
    const method = searchParams.get('method');
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTransactionStatus = searchParams.get('vnp_TransactionStatus');
    
    console.log('🔍 Confirmation Debug Info:', {
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      orderId: orderId,
      bookingId: bookingId,
      method: method,
      vnpResponseCode: vnpResponseCode,
      vnpTransactionStatus: vnpTransactionStatus,
      searchParams: searchParams ? searchParams.toString() : 'null',
      allParams: searchParams ? Object.fromEntries(searchParams.entries()) : {}
    });
    
    // Kiểm tra trạng thái VNPay payment
    if (method === 'VNPay' || method === 'vnpay') {
      console.log('🏦 VNPay Payment Detected:', {
        responseCode: vnpResponseCode,
        transactionStatus: vnpTransactionStatus,
        isSuccess: vnpResponseCode === '00' && vnpTransactionStatus === '00'
      });
    }
    
    // Sử dụng orderId hoặc bookingId, ưu tiên orderId
    const targetOrderId = orderId || bookingId;
    
    if (!targetOrderId) {
      console.warn('⚠️ No orderId or bookingId found in URL parameters, using fallback mock data');
      console.log('Available URL params:', searchParams ? Object.fromEntries(searchParams.entries()) : 'searchParams is null');
      
      // Fallback với mock data khi không có orderId/bookingId
      const amount = searchParams ? searchParams.get('amount') || '9360000' : '9360000';
      const mockBookingData = {
        id: "mock-booking-id-001",
        status: "confirmed",
        original_price: "10400000.00",
        discount_amount: "1040000.00",
        total_price: amount,
        promotion_id: "promo-summer-2025",
        booking_date: new Date().toISOString(),
        number_of_adults: 2,
        number_of_children: 0,
        tour: {
          name: "Tour khám phá Đà Nẵng - Hội An 4N3Đ",
          location: "Đà Nẵng",
          departure_location: "Hồ Chí Minh",
          images: [{
            image_url: "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg",
            is_main: true
          }]
        },
        user: {
          name: "Guest User",
          email: "guest@tour.com"
        },
        payment: {
          payment_method: method || "VNPay",
          status: (method === 'VNPay' && vnpResponseCode === '00') ? "completed" : "pending",
          amount: amount,
          order_id: "MOCK_ORDER_" + Date.now()
        },
        guests: [{
          name: "Nguyen Van A",
          email: "guest@tour.com",
          phone: "0123456789",
          cccd: "089303002985"
        }],
        departureDate: {
          departure_date: "2025-09-05",
          end_date: "2025-09-08"
        }
      };
      
      setBookingData(mockBookingData);
      setBookingNumber("mock-booking-id-001");
      setPaymentCompleted(true);
      return;
    }

    // Fetch payment data từ API endpoint - thử nhiều endpoint
    const tryFetchPaymentData = async () => {
      try {
        // Thử endpoint by-order trước với targetOrderId
        console.log(`🔄 Trying API call with orderId: ${targetOrderId}`);
        const response = await fetch(`http://localhost:5000/api/payments/by-order/${targetOrderId}`);
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('Payment API response:', apiData);
          return apiData;
        } else {
          console.log('by-order endpoint failed, trying alternative...');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.log('Trying general payments endpoint...');
        
        // Fallback: thử lấy tất cả payments và filter
        try {
          const allPaymentsResponse = await fetch(`http://localhost:5000/api/payments`);
          if (allPaymentsResponse.ok) {
            const allPaymentsData = await allPaymentsResponse.json();
            console.log('All payments data:', allPaymentsData);
            
            // Tìm payment với orderId hoặc bookingId
            const payments = allPaymentsData.data || allPaymentsData || [];
            const targetPayment = payments.find((p: any) => 
              p.order_id === targetOrderId || 
              p.order_id === orderId || 
              p.order_id === bookingId ||
              (p.booking && (p.booking.id === bookingId || p.booking.id === orderId))
            );
            
            if (targetPayment) {
              console.log('Found payment by filtering:', targetPayment);
              // Handle wrapped format nếu cần
              return targetPayment.data || targetPayment;
            }
          }
        } catch (fallbackError) {
          console.log('All fallback attempts failed:', fallbackError);
        }
        
        throw error;
      }
    };

    tryFetchPaymentData()
      .then(apiData => {
        console.log('Payment API response:', apiData);
        console.log('API data type:', typeof apiData);
        console.log('API data keys:', Object.keys(apiData || {}));
        
        if (!apiData) {
          console.error('API returned null or undefined');
          return;
        }
        
        // Handle wrapped response format {success: true, data: {...}}
        let paymentData = apiData;
        if (apiData.success && apiData.data) {
          console.log('Using wrapped data format');
          paymentData = apiData.data;
        }
        
        console.log('Has booking?', !!paymentData?.booking);
        
        if (!paymentData.booking) {
          console.error('No booking data in payment response. Available keys:', Object.keys(paymentData));
          console.log('Full payment data:', JSON.stringify(paymentData, null, 2));
          return;
        }

        // Sử dụng data từ API response với cấu trúc mới
        const booking = paymentData.booking;
        const tour = booking.tour;
        const user = booking.user;
        const guests = booking.guests || [];
        const departureDate = booking.departureDate;
        const promotion = booking.promotion;

        // Combine all data từ API response với thông tin từ URL
        const combinedData = {
          id: booking.id,
          status: booking.status || "confirmed",
          original_price: booking.original_price,
          discount_amount: booking.discount_amount,
          total_price: booking.total_price,
          promotion_id: booking.promotion_id,
          booking_date: booking.booking_date,
          number_of_adults: booking.number_of_adults,
          number_of_children: booking.number_of_children,
          tour: {
            name: tour.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có',
            location: tour.destination || tour.location,
            departure_location: tour.departure_location,
            images: tour.images || []
          },
          user: {
            name: user.name || user.full_name,
            email: user.email
          },
          payment: {
            payment_method: paymentData.payment_method || method || 'VNPay',
            status: paymentData.status || ((method === 'VNPay' && vnpResponseCode === '00') ? 'completed' : 'pending'),
            amount: paymentData.amount,
            order_id: paymentData.order_id || targetOrderId,
            vnp_response_code: vnpResponseCode,
            vnp_transaction_status: vnpTransactionStatus
          },
          guests: guests,
          departureDate: {
            departure_date: departureDate?.departure_date,
            end_date: departureDate?.end_date
          },
          promotion: promotion
        };

        console.log('Combined data:', combinedData);
        setBookingData(combinedData);
        setBookingNumber(booking.id);
        setPaymentCompleted(true);
      })
      .catch(error => {
        console.error('Failed to fetch payment data:', error);
        console.log('Using fallback mock data due to API error');
        
        // Fallback với mock data dựa trên URL params
        const amount = searchParams ? searchParams.get('amount') || '9360000' : '9360000';
        const mockBookingData = {
          id: bookingId || orderId || "01b075eb-c3e1-4611-9d9c-3a4b227f6d9d",
          status: "confirmed",
          original_price: "10400000.00",
          discount_amount: "1040000.00",
          total_price: amount,
          promotion_id: "promo-summer-2025",
          booking_date: new Date().toISOString(),
          number_of_adults: 2,
          number_of_children: 0,
          tour: {
            name: "Tour khám phá Đà Nẵng - Hội An 4N3Đ",
            location: "Đà Nẵng",
            departure_location: "Hồ Chí Minh",
            images: [{
              image_url: "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg",
              is_main: true
            }]
          },
          user: {
            name: "Guest User",
            email: "guest@tour.com"
          },
          payment: {
            payment_method: method || "VNPay",
            status: (method === 'VNPay' && vnpResponseCode === '00') ? "completed" : "pending",
            amount: amount,
            order_id: targetOrderId,
            vnp_response_code: vnpResponseCode,
            vnp_transaction_status: vnpTransactionStatus
          },
          guests: [{
            name: "Nguyen Van A",
            email: "guest@tour.com",
            phone: "0123456789",
            cccd: "089303002985"
          }],
          departureDate: {
            departure_date: "2025-09-05",
            end_date: "2025-09-08"
          }
        };
        
        setBookingData(mockBookingData);
        setBookingNumber(bookingId || orderId || "01b075eb-c3e1-4611-9d9c-3a4b227f6d9d");
        setPaymentCompleted(true);
      });
  }, [searchParams, mounted]);

  // Show loading if not mounted yet to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang khởi tạo...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Lấy tên agency từ tourInfo.agency?.name hoặc tourInfo.agency_name
  let agencyName = "";
  if (tourInfo?.agency && tourInfo.agency.name) {
    agencyName = tourInfo.agency.name;
  } else if (tourInfo?.agency_name) {
    agencyName = tourInfo.agency_name;
  }

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

  // Logic lấy hình ảnh từ API response của tour
  let tourImage = "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg"; // Default fallback
  if (tourInfo?.images && tourInfo.images.length > 0) {
    const mainImage = tourInfo.images.find((img: any) => img.is_main);
    tourImage = mainImage?.image_url || tourInfo.images[0]?.image_url || "https://res.cloudinary.com/dojbjbbjw/image/upload/v1752641022/DaLat_pdp01z.jpg";
  }

  console.log('🖼️ Tour image debug:', {
    tourInfo,
    tourImages: tourInfo?.images,
    finalTourImage: tourImage
  });

  // Debug component để kiểm tra URL parameters
  const URLParamsDebug = () => {
    if (process.env.NODE_ENV !== 'development') return null;
  
  };

  // Debug component để kiểm tra hình ảnh
  const ImageDebug = () => (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-xs">
      <p><strong>Debug Image:</strong></p>
      <p>URL: {tourImage}</p>
      <p>Images array: {JSON.stringify(tourInfo?.images)}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* URL Parameters Debug (chỉ hiện trong development) */}
        <URLParamsDebug />

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
            
            {/* Layout mã tour bên trái, button bên phải - FIXED */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 px-4">
              <div className="bg-white rounded-lg p-4 flex-1 sm:flex-initial sm:min-w-0 sm:max-w-md">
                <p className="text-sm text-gray-500 mb-1">Mã đặt tour</p>
                <p className="text-lg sm:text-xl font-bold text-teal-600 break-all">{bookingNumber}</p>
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
            <div className="flex gap-4">
              {/* Hình ảnh tour - lớn hơn bên trái */}
              <div className="flex-shrink-0">
                <div className="w-32 h-24 relative rounded overflow-hidden bg-gray-200">
                  <Image
                    src={tourImage}
                    alt={tourInfo.name || "Tour image"}
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      console.error('Image failed to load:', tourImage);
                      // Fallback to local image
                      const target = e.target as HTMLImageElement;
                      target.src = '/VinhHaLong.jpeg';
                    }}
                  />
                </div>
              </div>
              {/* Thông tin chi tiết bên phải */}
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-2">{tourInfo.name}</h3>
                {/* Hiển thị tên agency nếu có */}
                {agencyName && (
                  <div className="text-sm text-gray-500 mb-1">
                    Đơn vị tổ chức: <span className="font-semibold text-teal-700">{agencyName}</span>
                  </div>
                )}
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{tourInfo.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Khởi hành: {departureInfo?.departure_date ? new Date(departureInfo.departure_date).toLocaleDateString("vi-VN") : ""}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{departureInfo ? `${departureInfo.number_of_days || 4} ngày ${(departureInfo.number_of_days || 4) - 1} đêm` : "4 ngày 3 đêm"}</span>
                  </div>
                </div>
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
                <span className="text-gray-600">Số người lớn</span>
                <span className="font-medium">{bookingInfo.number_of_adults || 1} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số trẻ em</span>
                <span className="font-medium">{bookingInfo.number_of_children || 0} người</span>
              </div>
              
              {/* Hiển thị giá gốc */}
              <div className="flex justify-between">
                <span className="text-gray-600">Giá tour gốc</span>
                <span className="font-medium">
                  {Number(bookingInfo.original_price || bookingInfo.total_price).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              
              {/* Hiển thị mã giảm giá nếu có */}
              {(bookingInfo.promotion_id || bookingInfo.promotion) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">
                      ✅ Áp dụng mã giảm giá: {
                        bookingInfo.promotion?.code || 
                        bookingInfo.promotion_id?.replace('promo-', '').toUpperCase() || 
                        bookingInfo.promotion_id
                      }
                    </span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {bookingInfo.promotion?.description || (
                      bookingInfo.promotion_id === 'promo-summer-2025' 
                        ? 'Giảm giá 10% cho tất cả các tour khởi hành trong tháng 7 và 8.'
                        : bookingInfo.promotion_id === 'promo-july-2507'
                        ? 'Giảm giá cuối tháng cho các du khách vừa hết tiền lương'
                        : 'Mã giảm giá đã được áp dụng'
                    )}
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
                <span className="text-gray-600">Tổng tiền tour</span>
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
              
              {/* Hiển thị thông tin VNPay nếu có */}
              {(paymentInfo.vnp_response_code || paymentInfo.vnp_transaction_status) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Thông tin VNPay:</p>
                    {paymentInfo.vnp_response_code && (
                      <p>Mã phản hồi: {paymentInfo.vnp_response_code} {paymentInfo.vnp_response_code === '00' ? '(Thành công)' : '(Có lỗi)'}</p>
                    )}
                    {paymentInfo.vnp_transaction_status && (
                      <p>Trạng thái giao dịch: {paymentInfo.vnp_transaction_status} {paymentInfo.vnp_transaction_status === '00' ? '(Thành công)' : '(Có lỗi)'}</p>
                    )}
                  </div>
                </div>
              )}
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
          
          <div className="flex flex-row gap-4 mt-6 justify-center">
            {/* Nút hủy tour - chỉ hiện với booking chưa hủy và chưa hoàn thành */}
            {!["cancelled", "completed"].includes((bookingInfo?.status || '').toLowerCase()) && (
              <Button
                className="flex items-center gap-2 px-8 py-3 border border-red-300 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"
                onClick={() => {
                  // Điều hướng sang trang hủy tour để xác nhận
                  router.push(`/cancel-tour/${bookingInfo.id}`);
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy tour
              </Button>
            )}
            <Button
              className="flex items-center gap-2 px-8 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition"
              onClick={() => router.push("/")}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
              Về trang chủ
            </Button>
            <Button
              className="px-8 py-3 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition"
              onClick={() => {
                // Lấy tourId chính xác từ bookingData
                let tourId = null;
                if (bookingData?.tour && typeof bookingData.tour === 'object') {
                  tourId = bookingData.tour.id || bookingData.tour._id;
                }
                if (!tourId) tourId = bookingData?.tour_id;
                if (!tourId && tourInfo?.id) tourId = tourInfo.id;
                if (tourId) {
                  router.push(`/tour/${tourId}`);
                } else {
                  router.push("/");
                }
              }}
            >
              Quay lại trang tour
            </Button>
          </div>
        </div>
      </div>
  )
}
