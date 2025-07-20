import Link from "next/link"
import { Facebook, Twitter, Youtube, Linkedin, Plane } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#151622] text-white py-0">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-0">
          {/* Top section */}
          <div className="flex flex-row items-center justify-between py-8 w-full">
            {/* Logo & Social left */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-500" />
                </span>
                <span className="font-bold text-2xl tracking-wide ml-2">TRAVEL TOUR</span>
              </div>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-white text-gray-400"><Facebook className="w-6 h-6" /></Link>
                <Link href="#" className="hover:text-white text-gray-400"><Twitter className="w-6 h-6" /></Link>
                <Link href="#" className="hover:text-white text-gray-400"><Youtube className="w-6 h-6" /></Link>
                <Link href="#" className="hover:text-white text-gray-400"><Linkedin className="w-6 h-6" /></Link>
              </div>
            </div>
            {/* Menu center */}
            <div className="flex flex-row items-center justify-center gap-10 flex-1">
              <span className="text-gray-300 text-base font-medium">Về chúng tôi</span>
              <span className="text-gray-300 text-base font-medium">Dịch vụ</span>
              <span className="text-gray-300 text-base font-medium">Hỗ trợ</span>
              <span className="text-gray-300 text-base font-medium">Liên hệ</span>
              <span className="text-gray-300 text-base font-medium">Điều khoản</span>
            </div>
            {/* Email subscribe right */}
            <div className="flex flex-col items-end min-w-[260px]">
              <span className="font-medium mb-2">Đăng ký nhận thông tin mới</span>
              <div className="flex gap-2">
                <input type="email" placeholder="Nhập email của bạn" className="px-3 py-2 rounded border border-gray-700 bg-transparent text-white placeholder-gray-400" />
                <button className="bg-white text-black px-4 py-2 rounded">Gửi</button>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom copyright */}
        <div className="bg-[#181929] py-4 text-center text-gray-300 text-sm">
          © 2025 TRAVEL TOUR. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  )
}
