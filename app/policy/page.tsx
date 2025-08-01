import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PolicyPage() {
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            CHÍNH SÁCH SỬ DỤNG
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              Chào mừng bạn đến với Hệ thống Website Đặt Tour Du Lịch của chúng tôi!
            </p>
            
            <p className="mb-8">
              Bằng việc truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và chính sách dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ. Các chính sách này áp dụng cho mọi người dùng, bao gồm Khách du lịch (User), Đại lý du lịch (Agency) và Quản trị viên (Admin).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              1. Chính sách Bảo mật Thông tin
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Thu thập thông tin:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ khi đăng ký tài khoản.</li>
              <li>• Thông tin thanh toán: Được xử lý thông qua các cổng thanh toán bảo mật (MoMo, ZaloPay).</li>
              <li>• Thông tin sử dụng: Lịch sử tìm kiếm, đặt tour, đánh giá để cải thiện trải nghiệm.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Sử dụng thông tin:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Xử lý đơn đặt tour và cung cấp dịch vụ khách hàng.</li>
              <li>• Gửi thông báo về trạng thái booking và thông tin khuyến mãi (nếu đồng ý).</li>
              <li>• Phân tích và cải thiện chất lượng dịch vụ.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Bảo vệ thông tin:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Mã hóa dữ liệu nhạy cảm trong cơ sở dữ liệu.</li>
              <li>• Sử dụng JWT tokens để bảo vệ phiên đăng nhập.</li>
              <li>• Không chia sẻ thông tin cá nhân với bên thứ ba trừ khi có yêu cầu pháp lý.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              2. Chính sách Đặt Tour
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Quy trình đặt tour:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Tìm kiếm và chọn tour phù hợp.</li>
              <li>• Điền thông tin khách hàng và người tham gia.</li>
              <li>• Chọn phương thức thanh toán và hoàn tất đặt tour.</li>
              <li>• Nhận email xác nhận và theo dõi trạng thái booking.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Xác nhận booking:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Booking được xác nhận ngay khi thanh toán thành công.</li>
              <li>• Thông tin chi tiết sẽ được gửi qua email đăng ký.</li>
              <li>• Có thể theo dõi trạng thái trong phần "Lịch sử đặt tour".</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              3. Chính sách Hủy Tour và Hoàn tiền
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Thời hạn hủy tour:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Hủy trước 7 ngày: Hoàn 100% số tiền đã thanh toán.</li>
              <li>• Hủy trước 3-7 ngày: Hoàn 50% số tiền đã thanh toán.</li>
              <li>• Hủy trong vòng 3 ngày: Không hoàn tiền.</li>
              <li>• Chính sách có thể khác nhau tùy theo từng tour cụ thể.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Quy trình hoàn tiền:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Hoàn tiền tự động qua cổng thanh toán đã sử dụng.</li>
              <li>• Thời gian xử lý: 3-7 ngày làm việc.</li>
              <li>• Thông báo qua email khi hoàn tiền thành công.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              4. Chính sách Thanh toán
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Phương thức thanh toán:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Ví điện tử: MoMo, ZaloPay</li>
              <li>• Chuyển khoản ngân hàng</li>
              <li>• Thẻ tín dụng/thẻ ghi nợ (qua cổng thanh toán)</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Bảo mật thanh toán:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Sử dụng giao thức SSL để mã hóa thông tin.</li>
              <li>• Không lưu trữ thông tin thẻ tín dụng trên hệ thống.</li>
              <li>• Xác thực giao dịch qua OTP và xác thực 2 lớp.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              5. Chính sách Đánh giá và Nhận xét
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Quy định đánh giá:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Chỉ khách hàng đã hoàn thành tour mới có thể đánh giá.</li>
              <li>• Đánh giá phải trung thực, khách quan và có tính xây dựng.</li>
              <li>• Không được sử dụng ngôn từ thô tục, xúc phạm.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Kiểm duyệt nội dung:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Tất cả đánh giá sẽ được kiểm duyệt trước khi hiển thị.</li>
              <li>• Quyền xóa các đánh giá vi phạm quy định.</li>
              <li>• Đại lý có thể phản hồi đánh giá một cách chuyên nghiệp.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              6. Chính sách Khuyến mãi và Mã giảm giá
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Áp dụng mã giảm giá:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Mỗi mã chỉ sử dụng được một lần cho mỗi tài khoản.</li>
              <li>• Có thể có điều kiện về giá trị đơn hàng tối thiểu.</li>
              <li>• Không áp dụng đồng thời nhiều mã giảm giá.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Thời hạn khuyến mãi:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Mỗi chương trình có thời hạn cụ thể.</li>
              <li>• Không hoàn tiền phần giảm giá khi hủy tour.</li>
              <li>• Quyền thay đổi điều kiện khuyến mãi mà không báo trước.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              7. Chính sách Hỗ trợ Khách hàng
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Kênh hỗ trợ:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Email hỗ trợ: support@traveltour.com</li>
              <li>• Hotline: 1900-xxxx (24/7)</li>
              <li>• Chat trực tuyến trên website</li>
              <li>• Hệ thống ticket hỗ trợ</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Thời gian phản hồi:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Email: Trong vòng 24 giờ làm việc</li>
              <li>• Chat/Hotline: Ngay lập tức</li>
              <li>• Khiếu nại: Tối đa 3 ngày làm việc</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              8. Quy định về Nội dung
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Nội dung bị cấm:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Thông tin sai lệch, gây hiểu lầm</li>
              <li>• Nội dung phân biệt chủng tộc, tôn giáo</li>
              <li>• Quảng cáo dịch vụ cạnh tranh</li>
              <li>• Vi phạm bản quyền, sở hữu trí tuệ</li>
            </ul>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý quan trọng:</strong> Chính sách này có thể được cập nhật định kỳ. Phiên bản mới nhất sẽ được thông báo qua email và hiển thị trên website. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các thay đổi.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mt-4">
              <p className="text-sm text-green-800">
                <strong>Liên hệ:</strong> Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ với chúng tôi qua các kênh hỗ trợ khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
