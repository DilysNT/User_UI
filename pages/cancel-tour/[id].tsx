import "../../styles/globals.css";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from 'next/router';
import { ArrowLeft, AlertTriangle, Clock, DollarSign, FileText, HelpCircle, CheckCircle, Loader2, Star, Calendar, CreditCard, User, Phone, MapPin, Tag, Navigation, ChevronRight } from 'lucide-react';
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import Footer from "@/components/home/footer";

interface BookingData {
  id: string;
  tour_name: string;
  departure_date: string;
  total_price: number;
  payment_method: string;
  status: string;
}

interface CancellationPolicy {
  days_before: number;
  refund_percentage: number;
  description: string;
}


function CancelTourPage() {

  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintReason, setComplaintReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy[]>([]); // vẫn giữ để hiển thị
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundRate, setRefundRate] = useState(0);
  const [nonRefundableFees, setNonRefundableFees] = useState<number | null>(null);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [applicablePolicy, setApplicablePolicy] = useState<CancellationPolicy | null>(null); // giữ để highlight UI
  const [daysUntilDeparture, setDaysUntilDeparture] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data cho chính sách hủy
  const mockCancellationPolicy: CancellationPolicy[] = [
    { days_before: 7, refund_percentage: 100, description: "Hủy trước 7 ngày - hoàn 100%" },
    { days_before: 3, refund_percentage: 50, description: "Hủy trước 3-7 ngày - hoàn 50%" },
    { days_before: 0, refund_percentage: 0, description: "Hủy trong vòng 3 ngày - không hoàn tiền" }
  ];

  useEffect(() => {
    if (id) {
      fetchBookingData();
    }
  }, [id]);

  useEffect(() => {
    if (booking) {
      calculateRefund();
    }
  }, [booking]);

  const fetchBookingData = async () => {
    try {
      setPageLoading(true);
      setError(null);
      // Lấy token và user_id từ local/session storage
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : '';
      const user_id = typeof window !== 'undefined' ? (localStorage.getItem('user_id') || sessionStorage.getItem('user_id')) : '';
      if (!user_id) {
        throw new Error('Không tìm thấy user_id, vui lòng đăng nhập lại.');
      }
      // Gọi API lấy danh sách booking theo user_id từ BE (sửa lại endpoint cho đúng)
      const res = await fetch(`http://localhost:5000/api/bookings?user_id=${user_id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Không tìm thấy thông tin booking');
      }
      const data = await res.json();
      // Tìm booking theo id (so sánh kiểu string để tránh lỗi)
      const idStr = id?.toString();
      const found = Array.isArray(data) ? data.find((b) => b.id?.toString() === idStr) : null;
      if (!found) {
        throw new Error('Không tìm thấy thông tin booking');
      }

      // Lấy payment method từ API /api/payments theo booking_id
      let paymentMethod = '';
      try {
        const paymentRes = await fetch(`http://localhost:5000/api/payments?booking_id=${found.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          if (Array.isArray(paymentData.data) && paymentData.data.length > 0) {
            // Ưu tiên lấy payment_method của payment completed gần nhất
            const completed = paymentData.data.find((p) => p.status === 'completed');
            paymentMethod = completed?.payment_method || paymentData.data[0].payment_method || '';
          }
        }
      } catch (e) {
        // Nếu lỗi thì fallback về payment_method trong booking
        paymentMethod = found.payment_method || '';
      }
      if (!paymentMethod) paymentMethod = found.payment_method || '';

      const bookingData: BookingData = {
        id: found.id,
        tour_name: found.tour?.name || found.tour_name || 'Không có tên tour',
        departure_date: found.departureDate?.departure_date || found.departure_date,
        total_price: Number(found.total_price),
        payment_method: paymentMethod,
        status: found.status || ''
      };
      if (["cancelled", "completed"].includes((bookingData.status || '').toLowerCase())) {
        throw new Error("Booking này không thể hủy");
      }
      setBooking(bookingData);
    } catch (error: any) {
      console.error('Error fetching booking data:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải thông tin booking');
    } finally {
      setPageLoading(false);
    }
  };

  // FE chỉ còn tính ngày đến khởi hành, policy để hiển thị, không tự tính refund nữa
  const calculateRefund = () => {
    if (!booking) return;
    const departureDate = new Date(booking.departure_date);
    const currentDate = new Date();
    const diffTime = departureDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysUntilDeparture(diffDays);
    setCancellationPolicy(mockCancellationPolicy);
    let policy = mockCancellationPolicy.find(p => diffDays >= p.days_before);
    if (!policy) {
      policy = mockCancellationPolicy[mockCancellationPolicy.length - 1];
    }
    setApplicablePolicy(policy);
    // Cập nhật tỷ lệ hoàn tiền và số tiền hoàn lại cho UI
    setRefundRate(policy.refund_percentage);
    setRefundAmount(Math.round(booking.total_price * (policy.refund_percentage / 100)));
  };

  // Thực hiện PUT hủy tour thật sự
  const doCancelTour = async () => {
    if (!booking) return;
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : '';
      const user_id = typeof window !== 'undefined' ? (localStorage.getItem('user_id') || sessionStorage.getItem('user_id')) : '';
      const res = await fetch(`http://localhost:5000/api/cancel-booking/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reason: 'Khách muốn hủy tour', user_id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi hủy tour.');
      }
      setRefundAmount(data.refundAmount || 0);
      setRefundRate(data.refundRate || 0);
      setNonRefundableFees(data.nonRefundableFees ?? null);
      setRefundStatus(data.refundStatus || null);
      setPaymentError(data.paymentError || null);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setError(error.message || 'Có lỗi xảy ra khi hủy tour. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Khi bấm xác nhận hủy, show dialog cảnh báo
  const handleConfirmCancel = () => {
    setShowCancelDialog(true);
  };

  const handleCreateComplaint = async () => {
    if (!complaintReason.trim()) {
      setError('Vui lòng nhập lý do khiếu nại');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ticketId = `TK${Date.now()}`;
      
      // Show success message và redirect
      router.push(`/profile?tab=support&message=ticket_created&ticketId=${ticketId}`);
      
    } catch (error: any) {
      console.error('Error creating complaint:', error);
      setError('Có lỗi xảy ra khi tạo yêu cầu hỗ trợ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state ban đầu
  if (pageLoading) {
    return (
      <>
        <Head>
          <title>Đang tải... | Hủy tour</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang tải thông tin...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <>
        <Head>
          <title>Lỗi | Hủy tour</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  setError(null);
                  fetchBookingData();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (isSuccess) {
    // Xác định message và style dựa vào refundStatus và paymentError
    let title = '';
    let desc = '';
    let iconColor = '';
    let icon: React.ReactNode = null;
    let bgColor = '';
    if (refundStatus === 'completed' && !paymentError) {
      title = 'Hủy tour và hoàn tiền thành công!';
      desc = 'Yêu cầu hủy tour của bạn đã được xử lý và hoàn tiền thành công. Số tiền sẽ được hoàn lại qua ' + (booking?.payment_method || 'phương thức thanh toán ban đầu') + ' trong vòng 3-7 ngày làm việc.';
      iconColor = 'text-green-600';
      bgColor = 'bg-green-100';
      icon = <CheckCircle className={iconColor} size={32} />;
    } else if (refundStatus === 'manual_refund_required' || paymentError) {
      title = 'Hủy tour đã ghi nhận, chờ hoàn tiền';
      desc = 'Yêu cầu hủy tour đã được ghi nhận. Vui lòng chờ admin xử lý hoàn tiền.';
      if (paymentError) desc += `\nLý do: ${paymentError}`;
      iconColor = 'text-yellow-600';
      bgColor = 'bg-yellow-100';
      icon = <AlertTriangle className={iconColor} size={32} />;
    } else {
      title = 'Hủy tour thành công!';
      desc = 'Yêu cầu hủy tour của bạn đã được xử lý.';
      iconColor = 'text-green-600';
      bgColor = 'bg-green-100';
      icon = <CheckCircle className={iconColor} size={32} />;
    }
    return (
      <>
        <Head>
          <title>{title} | {booking?.tour_name}</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
            <div className={`${bgColor} rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center`}>
              {icon}
            </div>
            <h2 className="text-xl font-semibold mb-2 {iconColor}">{title}</h2>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{desc}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Về lịch sử đặt tour
            </button>
          </div>
        </div>
      </>
    );
  }

  // Main interface với thiết kế mới theo style TourDetail.tsx
  if (!booking) {
    return (
      <>
        <Head>
          <title>Không tìm thấy | Hủy tour</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="text-center p-8">
              <div className="bg-gray-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="text-gray-600" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy thông tin</h2>
              <p className="text-gray-600 mb-6">Booking không tồn tại hoặc đã bị xóa</p>
              <Button onClick={() => router.back()} className="w-full">
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{showComplaintForm ? 'Khiếu nại hủy tour' : 'Hủy tour'} | {booking.tour_name}</title>
        <meta name="description" content={`Hủy tour ${booking.tour_name} - Booking #${booking.id}`} />
      </Head>
      

      
      {/* Hero Section FE style: nền trắng, accent cam nhạt, font đen đậm */}
      <div className="bg-white py-10 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/profile?tab=bookings')}
              className="text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2 text-orange-500" />
              Quay lại
            </Button>
          </div>
          <div className="flex items-center gap-5">
            <div className="bg-orange-100 rounded-xl p-3 border border-orange-200">
              {showComplaintForm ? (
                <HelpCircle size={40} className="text-orange-500" />
              ) : (
                <AlertTriangle size={40} className="text-orange-500" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900">
                {showComplaintForm ? 'Gửi khiếu nại' : 'Hủy tour'}
              </h1>
              <p className="text-gray-700 text-base font-medium">Booking #{booking.id}</p>
              <div className="flex items-center gap-2 mt-1 text-gray-500 font-normal">
                <Clock size={16} className="text-orange-400" />
                <span>Thời gian xử lý: 1-2 giờ làm việc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {!showComplaintForm ? (
                <div className="space-y-6">
                  {/* Tour Info Card với design đẹp */}
                  <Card className="bg-white rounded-2xl shadow border border-gray-100">
                    <div className="p-5 border-b border-gray-100 bg-white rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Thông tin tour</h2>
                          <p className="text-gray-500 text-sm">Chi tiết booking cần hủy</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <Tag className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-gray-700 text-sm">Tên tour</div>
                              <div className="text-gray-900 font-medium">{booking.tour_name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <Calendar className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="text-gray-700 text-sm">Ngày khởi hành</div>
                              <div className="text-gray-900 font-medium">{formatDate(booking.departure_date)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <DollarSign className="w-5 h-5 text-yellow-400" />
                            <div>
                              <div className="text-gray-700 text-sm">Tổng tiền</div>
                              <div className="text-lg font-bold text-red-500">{formatCurrency(booking.total_price)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <CreditCard className="w-5 h-5 text-purple-400" />
                            <div>
                              <div className="text-gray-700 text-sm">Phương thức thanh toán</div>
                              <div className="text-gray-900 font-medium">{booking.payment_method}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cancellation Policy Card */}
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <div className="bg-orange-50 p-5 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-200 p-2 rounded-lg">
                          <Clock className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Chính sách hủy tour</h2>
                          <p className="text-gray-500">Còn <span className="font-bold text-orange-600">{daysUntilDeparture} ngày</span> đến ngày khởi hành</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {cancellationPolicy.map((policy, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border transition-all duration-300 ${
                              applicablePolicy?.days_before === policy.days_before
                                ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-100'
                                : 'border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {applicablePolicy?.days_before === policy.days_before && (
                                  <div className="bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                    ÁP DỤNG
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">{policy.description}</span>
                              </div>
                              <div className="text-right">
                                <div className={`text-xl font-bold ${
                                  applicablePolicy?.days_before === policy.days_before 
                                    ? 'text-orange-600' 
                                    : 'text-gray-700'
                                }`}>
                                  {policy.refund_percentage}%
                                </div>
                                <div className="text-xs text-gray-500 font-medium">hoàn tiền</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Refund Calculation Card */}
                  <Card className="bg-white border border-gray-100 shadow-sm">
                    <div className="bg-green-50 p-5 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-200 p-2 rounded-lg">
                          <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Tính toán hoàn tiền</h2>
                          <p className="text-gray-500">Chi tiết số tiền được hoàn lại</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Giá tour gốc</div>
                              <div className="text-lg font-bold text-gray-900">{formatCurrency(booking.total_price)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Tỷ lệ hoàn tiền</div>
                              <div className="text-lg font-bold text-blue-500">{refundRate}%</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-lg border border-green-100">
                          <div className="text-base text-green-700 font-semibold mb-1">Số tiền hoàn lại</div>
                          <div className={`text-3xl font-bold mb-2 ${refundAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(refundAmount)}
                          </div>
                          {refundAmount > 0 && (
                            <div className="mt-2">
                              <Progress value={refundRate} className="h-2 bg-green-100" />
                              <p className="text-green-700 font-medium mt-1 text-sm">
                                Hoàn {refundRate}% tổng giá trị tour
                              </p>
                            </div>
                          )}
                          {nonRefundableFees !== null && nonRefundableFees > 0 && (
                            <div className="mt-2 text-sm text-red-700">
                              Đã trừ phí không hoàn lại: <b>{formatCurrency(nonRefundableFees)}</b>
                            </div>
                          )}
                          {refundStatus === 'manual_refund_required' && (
                            <div className="mt-2 text-yellow-700 font-medium">
                              Cần hoàn tiền thủ công. Vui lòng liên hệ hỗ trợ.
                            </div>
                          )}
                          {paymentError && (
                            <div className="mt-2 text-red-700 font-medium">
                              Lỗi hoàn tiền: {paymentError}
                            </div>
                          )}
                        </div>
                        {refundAmount > 0 && refundStatus === 'completed' && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-5 h-5 text-blue-400" />
                              <span className="font-medium text-blue-900">Thông tin hoàn tiền</span>
                            </div>
                            <p className="text-blue-800 text-sm">
                              Số tiền sẽ được hoàn lại qua <strong>{booking.payment_method}</strong> trong vòng 3-7 ngày làm việc
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleConfirmCancel}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Xác nhận hủy tour
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowComplaintForm(true)}
                      className="flex-1 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Gửi khiếu nại
                    </Button>
                  </div>

                  {/* Dialog xác nhận hủy tour */}
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" /> Xác nhận hủy tour
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-2 text-base text-gray-700 whitespace-pre-line">
                        Bạn có chắc chắn muốn hủy tour này không?
                        {refundAmount > 0 ? (
                          <>
                            <br />Số tiền hoàn lại dự kiến: <b className="text-green-600">{formatCurrency(refundAmount)}</b>
                          </>
                        ) : (
                          <>
                            <br />Bạn sẽ <b className="text-red-600">không được hoàn tiền</b> do chính sách hủy.
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="px-6">Hủy</Button>
                        <Button onClick={() => { setShowCancelDialog(false); doCancelTour(); }} className="bg-red-600 text-white px-6">Đồng ý hủy tour</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {refundAmount === 0 && (
                    <Card className="border-2 border-red-200 bg-red-50 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-500 p-3 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-red-900 text-lg mb-2">Không được hoàn tiền</h3>
                            <p className="text-red-800">
                              {refundStatus === 'manual_refund_required'
                                ? 'Yêu cầu đã ghi nhận, cần hoàn tiền thủ công. Vui lòng liên hệ hỗ trợ.'
                                : 'Do hủy trong thời gian quy định, bạn sẽ không được hoàn lại tiền. Vui lòng liên hệ hỗ trợ nếu có trường hợp đặc biệt.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                /* Complaint Form */
                <Card className="overflow-hidden shadow-lg border-0">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 border-b">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gửi khiếu nại</h2>
                        <p className="text-gray-600">Mô tả vấn đề bạn gặp phải</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Lý do khiếu nại *
                      </label>
                      <textarea
                        value={complaintReason}
                        onChange={(e) => setComplaintReason(e.target.value)}
                        placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[150px] text-lg shadow-sm"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleCreateComplaint}
                        disabled={loading || !complaintReason.trim()}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          'Gửi khiếu nại'
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setShowComplaintForm(false)}
                        className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        Quay lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Support Info Card */}
                <Card className="bg-gray-50 border border-gray-100 shadow-none">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-base text-gray-900">Cần hỗ trợ?</h3>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-white rounded border border-blue-100">
                      <Phone className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-gray-700">Hotline</div>
                        <div className="text-blue-600 font-bold">1900 1234</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded border border-green-100">
                      <Clock className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-gray-700">Giờ làm việc</div>
                        <div className="text-green-700 text-sm">8:00 - 22:00 hàng ngày</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Process Info Card */}
                <Card className="bg-gray-50 border border-gray-100 shadow-none">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-base text-gray-900">Quy trình hủy tour</h3>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-200 rounded-full p-1 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">1. Gửi yêu cầu hủy</div>
                          <div className="text-gray-500 text-xs">Xác nhận thông tin booking</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-yellow-200 rounded-full p-1 mt-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">2. Xử lý yêu cầu</div>
                          <div className="text-gray-500 text-xs">Thời gian: 1-2 giờ làm việc</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-green-200 rounded-full p-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">3. Hoàn tiền</div>
                          <div className="text-gray-500 text-xs">Thời gian: 3-7 ngày làm việc</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

export default CancelTourPage;
