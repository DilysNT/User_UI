import Link from "next/link"
import { ArrowLeft, Phone, Mail, MessageCircle, Clock, HelpCircle, FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function SupportPage() {
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
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Trung tâm hỗ trợ</h1>
          <p className="text-xl opacity-90">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Contact Methods */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Liên hệ với chúng tôi</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hotline 24/7</h3>
              <p className="text-gray-700 mb-4">
                Gọi ngay để được hỗ trợ trực tiếp
              </p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-blue-600">1900-xxxx</p>
                <p className="text-sm text-gray-600">Miễn phí từ 8:00 - 22:00</p>
                <p className="text-sm text-gray-600">Phí cước mạng từ 22:00 - 8:00</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Email hỗ trợ</h3>
              <p className="text-gray-700 mb-4">
                Gửi email và nhận phản hồi trong 24h
              </p>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-green-600">support@traveltour.com</p>
                <p className="text-sm text-gray-600">Phản hồi trong 2-24 giờ</p>
                <p className="text-sm text-gray-600">Bao gồm cả cuối tuần</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chat trực tuyến</h3>
              <p className="text-gray-700 mb-4">
                Trò chuyện ngay với tư vấn viên
              </p>
              <div className="space-y-2">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Bắt đầu chat
                </button>
                <p className="text-sm text-gray-600">Trực tuyến 24/7</p>
                <p className="text-sm text-gray-600">Phản hồi ngay lập tức</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Câu hỏi thường gặp</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Đặt tour & Thanh toán
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Làm sao để đặt tour?</h4>
                  <p className="text-sm text-gray-600">
                    Tìm kiếm tour → Chọn tour phù hợp → Điền thông tin → Thanh toán → Nhận xác nhận
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Có những phương thức thanh toán nào?</h4>
                  <p className="text-sm text-gray-600">
                    MoMo, ZaloPay, chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Khi nào booking được xác nhận?</h4>
                  <p className="text-sm text-gray-600">
                    Ngay sau khi thanh toán thành công, bạn sẽ nhận email xác nhận
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Hủy tour & Hoàn tiền
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Chính sách hủy tour như thế nào?</h4>
                  <p className="text-sm text-gray-600">
                    Hủy trước 7 ngày: 100% | 3-7 ngày: 50% | Dưới 3 ngày: 0%
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Làm sao để hủy tour?</h4>
                  <p className="text-sm text-gray-600">
                    Vào "Lịch sử đặt tour" → Chọn tour cần hủy → Nhấn "Hủy tour"
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-1">Bao lâu sẽ nhận được tiền hoàn?</h4>
                  <p className="text-sm text-gray-600">
                    3-7 ngày làm việc qua phương thức thanh toán đã sử dụng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Các vấn đề hỗ trợ</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Quản lý booking</h4>
              <p className="text-sm text-gray-600">
                Xem, sửa đổi hoặc hủy đặt chỗ của bạn
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Xác nhận thanh toán</h4>
              <p className="text-sm text-gray-600">
                Kiểm tra trạng thái và xác nhận giao dịch
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng</h4>
              <p className="text-sm text-gray-600">
                Cách sử dụng website và các tính năng
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Khiếu nại</h4>
              <p className="text-sm text-gray-600">
                Gửi khiếu nại về chất lượng dịch vụ
              </p>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Giờ hoạt động</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Hotline</h4>
              <p className="text-sm text-gray-600">24/7 - Cả tuần</p>
              <p className="text-sm text-gray-600">Bao gồm ngày lễ</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Email support</h4>
              <p className="text-sm text-gray-600">24/7 - Cả tuần</p>
              <p className="text-sm text-gray-600">Phản hồi trong 24h</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Live Chat</h4>
              <p className="text-sm text-gray-600">6:00 - 24:00</p>
              <p className="text-sm text-gray-600">Thứ 2 - Chủ nhật</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Gửi yêu cầu hỗ trợ</h2>
          
          <form className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập email"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại hỗ trợ
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Chọn loại hỗ trợ</option>
                  <option>Đặt tour</option>
                  <option>Thanh toán</option>
                  <option>Hủy tour</option>
                  <option>Khiếu nại</option>
                  <option>Khác</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả vấn đề *
              </label>
              <textarea 
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              ></textarea>
            </div>

            <div className="text-center">
              <button 
                type="submit"
                className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Gửi yêu cầu hỗ trợ
              </button>
            </div>
          </form>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Hỗ trợ khẩn cấp</h2>
          <p className="text-lg opacity-90 mb-6">
            Trong trường hợp khẩn cấp trong chuyến đi, liên hệ ngay:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
              <p className="font-semibold">Hotline khẩn cấp</p>
              <p className="text-xl">1900-911-911</p>
            </div>
            <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
              <p className="font-semibold">Email khẩn cấp</p>
              <p className="text-xl">emergency@traveltour.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
