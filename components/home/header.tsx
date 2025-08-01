import Link from "next/link";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import ProfileModal from "../profile/ProfileModal";

// Thêm dòng này nếu dùng Next.js 13+
// import { Audiowide } from 'next/font/google';
// const audiowide = Audiowide({ subsets: ['latin'], weight: '400' });

type HeaderProps = {
  textColor?: "white" | "silver" | "black";
};

export default function Header({ textColor = "white" }: HeaderProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setAtTop(currentScrollY === 0);
      if (currentScrollY === 0) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Cuộn xuống
        setShowHeader(false);
      } else {
        // Cuộn lên
        setShowHeader(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.log('Header: token in localStorage:', !!token ? 'exists' : 'null');
      if (!token) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          console.log('Header: /api/auth/me status:', res.status);
          if (res.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            console.log('Header: Token expired or invalid, clearing auth data');
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
          }
          if (!res.ok) throw new Error('Fetch user failed');
          return res.json();
        })
        .then(data => {
          if (data) {
            // Nếu data.user không có, thử setUser(data)
            const userObj = data.user || data;
            console.log('Header: fetched user successfully');
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        })
        .catch((err) => {
          console.error('Header: user fetch error:', err.message);
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        });
    }
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        } ${
          textColor === "black"
            ? "bg-white text-black shadow"
            : atTop
            ? "bg-transparent text-white"
            : "bg-white shadow text-black"
        }`}
        style={{ 
          willChange: "transform",
          zIndex: 9999,
          position: "fixed"
        }}
      >
        <div className="w-full px-8 py-5 flex items-center relative">
          {/* Logo bên trái */}
          <div className="flex-1 flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}> 
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${atTop ? "bg-white/80" : "bg-white"}`}>
              <span className="text-blue-500 font-bold text-sm">✈︎</span>
            </div>
            <span
              className="text-2xl font-bold tracking-widest"
              style={{ fontFamily: "'Nico Moji', Arial, sans-serif" }}
            >
              TRAVEL TOUR
            </span>
          </div>

          {/* Nav ở giữa */}
          <nav className="hidden md:flex items-center space-x-8 justify-center">
            <Link href="/" className={textColor === "black" ? "hover:text-cyan-700 transition-colors" : "hover:text-cyan-200 transition-colors"}>
              Trang chủ
            </Link>
            <Link href="/destination" className={textColor === "black" ? "hover:text-cyan-700 transition-colors" : "hover:text-cyan-200 transition-colors"}>
              Điểm đến
            </Link>
            <Link href="/blog" className={textColor === "black" ? "hover:text-cyan-700 transition-colors" : "hover:text-cyan-200 transition-colors"}>
              Blog
            </Link>
          </nav>

          {/* User/Profile bên phải */}
          <div className="flex-1 flex justify-end items-center">
            {/* Nút đăng nhập hoặc thông tin user */}
            {user ? (
              <div className="flex items-center space-x-2 cursor-pointer relative" ref={dropdownRef}>
                <div
                  className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold"
                  onClick={() => { 
                    console.log('Header: User icon clicked');
                    setShowProfile(true); 
                    setShowDropdown(false); 
                  }}
                >
                  {user.username ? user.username.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                </div>
                {/* Dropdown menu */}
                {showDropdown && (
                  <div 
                    className="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-4 min-w-[220px] animate-fade-in"
                    style={{ zIndex: 10000 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-lg font-bold text-black">
                        {user.username ? user.username.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U")}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.username || "Chưa đặt tên"}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <button
                      className="w-full text-left px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition"
                      onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        setUser(null);
                        setShowDropdown(false);
                        router.push('/');
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
                <ProfileModal open={showProfile} onClose={() => {
                  console.log('Header: ProfileModal onClose called');
                  setShowProfile(false);
                }} />
              </div>
            ) : (
              <Button
                className={`font-semibold ${textColor === "black" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : atTop ? "bg-yellow-400 hover:bg-yellow-500 text-black" : "bg-yellow-400 hover:bg-yellow-500 text-black"}`}
                onClick={() => router.push("/auth")}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Modal lựa chọn loại tài khoản */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center"
          style={{ zIndex: 10001 }}
        >
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-center">Chọn loại tài khoản</h3>
            <button
              className="w-full py-2 mb-3 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
              onClick={() => router.push("/register")}
            >
              Tạo tài khoản khách hàng
            </button>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => router.push("/register-agency")}
            >
              Tạo tài khoản Doanh nghiệp
            </button>
            <button
              className="w-full mt-4 text-gray-500 hover:underline text-sm"
              onClick={() => setShowModal(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </>
  );
}