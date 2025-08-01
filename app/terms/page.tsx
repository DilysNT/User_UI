import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
            ĐIỀU KHOẢN VÀ CHÍNH SÁCH
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              Chào mừng bạn đến với Hệ thống Website Đặt Tour Du Lịch của chúng tôi!
            </p>
            
            <p className="mb-8">
              Bằng việc truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và chính sách dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ. Các điều khoản này áp dụng cho mọi người dùng, bao gồm Khách du lịch (User), Đại lý du lịch (Agency) và Quản trị viên (Admin).
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 1: Định nghĩa
            </h2>
            
            <ul className="space-y-4 mb-8">
              <li>
                <strong>Hệ thống/Chúng tôi:</strong> Là website đặt tour du lịch trực tuyến, hoạt động như một nền tảng trung gian kết nối Khách du lịch và các Đại lý du lịch đã được xác minh.
              </li>
              <li>
                <strong>Người dùng (User):</strong> Là cá nhân truy cập website để tìm kiếm, đặt, thanh toán và đánh giá các tour du lịch.
              </li>
              <li>
                <strong>Đại lý (Agency):</strong> Là các công ty, tổ chức du lịch đã được xác minh, sử dụng hệ thống để đăng tải, quản lý tour và xử lý các đơn đặt hàng.
              </li>
              <li>
                <strong>Quản trị viên (Admin):</strong> Là người chịu trách nhiệm quản lý, giám sát toàn bộ hoạt động của hệ thống.
              </li>
              <li>
                <strong>Booking:</strong> Là đơn đặt tour được tạo bởi Người dùng trên hệ thống.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 2: Quy định về Tài khoản
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Đăng ký:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Người dùng và Đại lý phải cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
              <li>• Mỗi tài khoản sẽ được yêu cầu xác thực qua email để kích hoạt.</li>
              <li>• Tài khoản Đại lý sau khi đăng ký cần trải qua quy trình xét duyệt của Quản trị viên và chỉ được hoạt động đầy đủ sau khi được phê duyệt. Đại lý cần cung cấp các thông tin như tên công ty, mã số thuế, giấy phép kinh doanh để được xác thực.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Bảo mật:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Người dùng và Đại lý có trách nhiệm tự bảo mật thông tin tài khoản và mật khẩu của mình. Mật khẩu được mã hóa trong cơ sở dữ liệu để đảm bảo an toàn.</li>
              <li>• Chúng tôi sử dụng cơ chế JSON Web Tokens (JWT) để xác thực và bảo vệ các phiên truy cập.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Quản lý bởi Admin:</h3>
            <p className="mb-8">
              Quản trị viên có quyền quản lý tất cả tài khoản, bao gồm việc thay đổi trạng thái hoạt động (tạm ngưng, kích hoạt) đối với tài khoản Đại lý nếu phát hiện vi phạm chính sách.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 3: Chính sách Đặt tour và Hủy tour
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Quy trình Đặt tour:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Người dùng có thể tìm kiếm tour theo nhiều tiêu chí như điểm đến, ngày khởi hành, khoảng giá.</li>
              <li>• Khi đặt tour, Người dùng phải điền đầy đủ và chính xác thông tin cá nhân và thông tin của những người tham gia chuyến đi.</li>
              <li>• Sau khi hoàn tất đặt tour, hệ thống sẽ tạo một booking với trạng thái "Chờ thanh toán" và gửi email xác nhận tạm thời.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Chính sách Hủy tour và Hoàn tiền:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Người dùng có thể yêu cầu hủy tour thông qua mục "Lịch sử đặt tour" trong tài khoản cá nhân.</li>
              <li>• Chính sách hoàn tiền sẽ được áp dụng tự động dựa trên quy định do Đại lý thiết lập khi đăng tour và thời điểm Người dùng yêu cầu hủy. Ví dụ: Hủy trước 7 ngày - hoàn 100%; Hủy trước 3-7 ngày - hoàn 50%; Hủy trong vòng 3 ngày - không hoàn tiền.</li>
              <li>• Hệ thống sẽ tự động xử lý hoàn tiền qua cổng thanh toán đã sử dụng (MoMo, ZaloPay) nếu yêu cầu hủy hợp lệ và nằm trong chính sách tự động.</li>
              <li>• Số chỗ trống của tour sẽ được cập nhật lại sau khi hủy thành công.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Xử lý Khiếu nại:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Trong trường hợp không đồng ý với chính sách hủy hoặc số tiền hoàn lại, Người dùng có thể tạo yêu cầu "Khiếu nại".</li>
              <li>• Hệ thống sẽ tạo một phiếu hỗ trợ (ticket) để Quản trị viên xem xét, đóng vai trò trung gian hòa giải giữa Người dùng và Đại lý.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 4: Chính sách Thanh toán
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Phương thức:</h3>
            <p className="mb-4">
              Hệ thống tích hợp các cổng thanh toán trực tuyến phổ biến như MoMo và ZaloPay để mang lại sự tiện lợi và an toàn. Người dùng cũng có thể chọn hình thức chuyển khoản ngân hàng.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Xác nhận:</h3>
            <ul className="space-y-2 mb-4">
              <li>• Đối với thanh toán trực tuyến, trạng thái booking sẽ được tự động cập nhật thành "Đã thanh toán" ngay sau khi giao dịch thành công.</li>
              <li>• Đối với chuyển khoản, booking sẽ ở trạng thái "Chờ xác nhận thanh toán" cho đến khi Quản trị viên hoặc bộ phận kế toán xác nhận đã nhận được tiền.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Mã giảm giá:</h3>
            <p className="mb-8">
              Người dùng có thể áp dụng các mã giảm giá hợp lệ (do Đại lý hoặc Admin tạo) trong quá trình đặt tour để được hưởng ưu đãi. Hệ thống sẽ tự động kiểm tra và cập nhật lại tổng tiền.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 5: Trách nhiệm của các bên
            </h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-3">Trách nhiệm của Đại lý (Agency):</h3>
            <ul className="space-y-2 mb-4">
              <li>• Cung cấp thông tin tour một cách trung thực, đầy đủ và rõ ràng (lịch trình, dịch vụ bao gồm/không bao gồm, chính sách hủy).</li>
              <li>• Chịu trách nhiệm về chất lượng dịch vụ cung cấp cho Người dùng đúng như mô tả.</li>
              <li>• Phản hồi các đánh giá của Người dùng một cách chuyên nghiệp và có tính xây dựng.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Trách nhiệm của Người dùng (User):</h3>
            <ul className="space-y-2 mb-4">
              <li>• Cung cấp thông tin chính xác khi đăng ký và đặt tour.</li>
              <li>• Tuân thủ các quy định, chính sách của tour mà mình đã đặt.</li>
              <li>• Thực hiện đánh giá, nhận xét một cách khách quan, trung thực và không vi phạm các quy định về nội dung của hệ thống.</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Vai trò của Chúng tôi:</h3>
            <ul className="space-y-2 mb-8">
              <li>• Là nền tảng trung gian, chúng tôi không phải là nhà tổ chức tour. Chúng tôi cung cấp công nghệ để kết nối Người dùng và Đại lý.</li>
              <li>• Chúng tôi có trách nhiệm xác thực thông tin và uy tín của các Đại lý tham gia hệ thống.</li>
              <li>• Quản trị viên có quyền kiểm duyệt nội dung tour và các đánh giá để đảm bảo chất lượng chung trên toàn hệ thống.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 6: Quyền sở hữu trí tuệ
            </h2>
            <ul className="space-y-2 mb-8">
              <li>• Toàn bộ giao diện, thiết kế, và mã nguồn của website thuộc quyền sở hữu của chúng tôi.</li>
              <li>• Nội dung, hình ảnh, thông tin về tour là tài sản của các Đại lý tương ứng và họ chịu trách nhiệm về bản quyền của các nội dung này.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 7: Miễn trừ trách nhiệm
            </h2>
            <ul className="space-y-2 mb-8">
              <li>• Chúng tôi không chịu trách nhiệm cho bất kỳ tranh chấp nào phát sinh trực tiếp giữa Người dùng và Đại lý liên quan đến chất lượng dịch vụ tour, trừ các trường hợp được quy định trong quy trình xử lý khiếu nại của chúng tôi.</li>
              <li>• Chúng tôi nỗ lực đảm bảo hệ thống hoạt động ổn định nhưng không thể đảm bảo không có lỗi kỹ thuật hoặc thời gian gián đoạn ngoài ý muốn.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">
              Điều 8: Thay đổi điều khoản
            </h2>
            <p className="mb-8">
              Chúng tôi có quyền cập nhật, thay đổi các điều khoản và chính sách này vào bất kỳ lúc nào. Phiên bản mới nhất sẽ được đăng tải trên website và có hiệu lực ngay sau khi đăng. Việc bạn tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và chính sách này, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
