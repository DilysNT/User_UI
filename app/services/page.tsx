import Link from "next/link"
import { ArrowLeft, Search, Calendar, Shield, CreditCard, Headphones, Star, Users, Map, Clock } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về trang chủ
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Dịch vụ của chúng tôi</h1>
          <p className="text-xl opacity-90">
            Giải pháp toàn diện cho mọi nhu cầu du lịch của bạn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Core Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dịch vụ chính</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tìm kiếm tour thông minh</h3>
              <p className="text-gray-700 mb-4">
                Hệ thống tìm kiếm tiên tiến với bộ lọc đa dạng: điểm đến, ngày khởi hành, khoảng giá, loại tour, đánh giá.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tìm kiếm theo từ khóa</li>
                <li>• Lọc theo ngân sách</li>
                <li>• Sắp xếp theo độ phổ biến</li>
                <li>• Gợi ý tour phù hợp</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đặt tour dễ dàng</h3>
              <p className="text-gray-700 mb-4">
                Quy trình đặt tour đơn giản, nhanh chóng chỉ với vài bước cơ bản.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chọn tour và số lượng khách</li>
                <li>• Điền thông tin cá nhân</li>
                <li>• Thanh toán an toàn</li>
                <li>• Nhận xác nhận ngay lập tức</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Thanh toán an toàn</h3>
              <p className="text-gray-700 mb-4">
                Đa dạng phương thức thanh toán với bảo mật tối đa.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ví điện tử (MoMo, ZaloPay)</li>
                <li>• Chuyển khoản ngân hàng</li>
                <li>• Thẻ tín dụng/ghi nợ</li>
                <li>• Mã hóa SSL 256-bit</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quản lý booking</h3>
              <p className="text-gray-700 mb-4">
                Theo dõi và quản lý các chuyến đi của bạn một cách dễ dàng.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lịch sử đặt tour</li>
                <li>• Trạng thái thanh toán</li>
                <li>• Hủy tour trực tuyến</li>
                <li>• Tải voucher PDF</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hỗ trợ 24/7</h3>
              <p className="text-gray-700 mb-4">
                Đội ngũ chăm sóc khách hàng chuyên nghiệp luôn sẵn sàng hỗ trợ.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hotline 24/7</li>
                <li>• Chat trực tuyến</li>
                <li>• Email hỗ trợ</li>
                <li>• Hệ thống ticket</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đánh giá & Review</h3>
              <p className="text-gray-700 mb-4">
                Hệ thống đánh giá minh bạch giúp bạn chọn tour phù hợp.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Đánh giá từ khách thực</li>
                <li>• Hình ảnh thực tế</li>
                <li>• Phản hồi từ đại lý</li>
                <li>• Xếp hạng chất lượng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* For Travel Agencies */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Dành cho Đại lý Du lịch</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tính năng quản lý tour</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Đăng và quản lý thông tin tour chi tiết</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Cập nhật lịch trình và giá cả linh hoạt</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Quản lý số lượng chỗ còn trống</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Thiết lập chính sách hủy tour</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quản lý đặt chỗ</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Nhận thông báo đặt tour real-time</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Xác nhận và quản lý booking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Báo cáo doanh thu chi tiết</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Tạo và quản lý mã giảm giá</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Special Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tính năng đặc biệt</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tour cho nhóm</h4>
              <p className="text-sm text-gray-600">
                Đặt tour cho nhóm lớn với giá ưu đãi đặc biệt
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tour tùy chỉnh</h4>
              <p className="text-sm text-gray-600">
                Thiết kế tour riêng theo yêu cầu cá nhân
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Đặt last minute</h4>
              <p className="text-sm text-gray-600">
                Tour giá rẻ cho những chuyến đi phút chót
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tour VIP</h4>
              <p className="text-sm text-gray-600">
                Dịch vụ cao cấp với hướng dẫn viên riêng
              </p>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quy trình đặt tour</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tìm kiếm</h4>
              <p className="text-sm text-gray-600">
                Tìm tour phù hợp với nhu cầu và ngân sách
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Đặt chỗ</h4>
              <p className="text-sm text-gray-600">
                Điền thông tin và xác nhận đặt tour
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Thanh toán</h4>
              <p className="text-sm text-gray-600">
                Chọn phương thức và hoàn tất thanh toán
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Khởi hành</h4>
              <p className="text-sm text-gray-600">
                Nhận voucher và bắt đầu hành trình
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Sẵn sàng khám phá dịch vụ của chúng tôi?</h2>
          <p className="text-lg opacity-90 mb-6">
            Trải nghiệm ngay hôm nay và cảm nhận sự khác biệt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/search" 
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Bắt đầu tìm tour
            </Link>
            <Link 
              href="/support" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Tư vấn miễn phí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
