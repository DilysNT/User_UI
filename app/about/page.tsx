import Link from "next/link"
import { ArrowLeft, Users, Globe, Award, Heart } from "lucide-react"

export default function AboutPage() {
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Về chúng tôi</h1>
          <p className="text-xl opacity-90">
            Hành trình khởi tạo những chuyến du lịch đáng nhớ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Company Story */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              <strong>TRAVEL TOUR</strong> ra đời từ niềm đam mê khám phá thế giới và mong muốn mang đến cho mọi người những trải nghiệm du lịch tuyệt vời nhất. Chúng tôi hiểu rằng mỗi chuyến đi không chỉ là một kỳ nghỉ, mà còn là cơ hội để tạo ra những kỷ niệm đáng nhớ, khám phá văn hóa mới và kết nối với những con người thú vị.
            </p>
            
            <p className="mb-6">
              Được thành lập với sứ mệnh trở thành cầu nối tin cậy giữa du khách và các đại lý du lịch chất lượng, chúng tôi đã không ngừng phát triển để mang đến một nền tảng đặt tour trực tuyến hiện đại, an toàn và tiện lợi nhất.
            </p>

            <p className="mb-8">
              Với đội ngũ chuyên gia giàu kinh nghiệm trong lĩnh vực công nghệ và du lịch, chúng tôi cam kết mang đến cho bạn những dịch vụ tốt nhất, từ việc tìm kiếm tour phù hợp đến hỗ trợ khách hàng 24/7.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sứ mệnh</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Kết nối du khách với những trải nghiệm du lịch chất lượng, an toàn và đáng nhớ thông qua nền tảng công nghệ hiện đại. Chúng tôi cam kết mang đến sự tiện lợi, minh bạch và tin cậy trong mọi giao dịch.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Tầm nhìn</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Trở thành nền tảng đặt tour du lịch hàng đầu Việt Nam, nơi mọi người có thể dễ dàng khám phá thế giới với sự yên tâm và hài lòng tuyệt đối về chất lượng dịch vụ.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Giá trị cốt lõi</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Khách hàng là trung tâm</h4>
              <p className="text-sm text-gray-600">
                Mọi quyết định của chúng tôi đều hướng đến lợi ích và sự hài lòng của khách hàng.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Chất lượng</h4>
              <p className="text-sm text-gray-600">
                Cam kết cung cấp những tour du lịch và dịch vụ có chất lượng cao nhất.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Tận tâm</h4>
              <p className="text-sm text-gray-600">
                Phục vụ khách hàng với sự nhiệt tình, chu đáo và chuyên nghiệp.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Đổi mới</h4>
              <p className="text-sm text-gray-600">
                Không ngừng cải tiến công nghệ và dịch vụ để mang đến trải nghiệm tốt nhất.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Đội ngũ của chúng tôi</h2>
          
          <div className="text-center mb-8">
            <p className="text-lg text-gray-700">
              Đội ngũ TRAVEL TOUR bao gồm những chuyên gia giàu kinh nghiệm trong các lĩnh vực:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Công nghệ thông tin</h4>
              <p className="text-sm text-gray-600">
                Phát triển và duy trì nền tảng với công nghệ tiên tiến nhất
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Du lịch & Dịch vụ</h4>
              <p className="text-sm text-gray-600">
                Kinh nghiệm sâu rộng trong ngành du lịch và chăm sóc khách hàng
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Kinh doanh & Marketing</h4>
              <p className="text-sm text-gray-600">
                Hiểu biết thị trường và xu hướng du lịch hiện đại
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Hãy cùng chúng tôi khám phá thế giới!</h2>
          <p className="text-lg opacity-90 mb-6">
            Bắt đầu hành trình du lịch tuyệt vời của bạn ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/search" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Tìm kiếm tour
            </Link>
            <Link 
              href="/support" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
