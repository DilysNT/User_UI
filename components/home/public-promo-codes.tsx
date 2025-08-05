
"use client";
import { useState, useEffect } from "react";
import { Copy, Gift, Sparkles, Clock, Tag } from "lucide-react";

interface ApiPromoCode {
  id: string;
  code: string;
  description: string;
  discount_amount: string;
  start_date: string;
  end_date: string;
  agency_id?: string;
  agency_name?: string;
  created_at: string;
  updated_at: string;
}

interface PublicPromoCode {
  id: string;
  code: string;
  description: string;
  discountAmount: number;
  isPercentage: boolean;
  expiresAt: string;
  isActive: boolean;
  agencyName?: string;
}

const PublicPromoCodes = () => {
  // Ánh xạ agency_id sang agency_name
  const agencyMap: Record<string, string> = {
    "855ff6be-bed7-497c-84e0-4230faa2c61a": "Công ty Du lịch Sông Hồng",
    "3425c5bc-b776-481d-8cce-ece626adb6fd": "Công ty Du lịch Test Agency",
    "d3a463c7-fa0f-486c-8b89-8429c5640186": "Công ty Du lịch Cúc Cu",
    "a1b2c3d4-e5f6-7890-1234-567890abcdef": "Du Lịch Việt"
  };
  const [promoCodes, setPromoCodes] = useState<PublicPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      setIsUserLoggedIn(!!authToken);
    };
    
    checkAuthStatus();
    
    // Lắng nghe sự kiện storage để phát hiện thay đổi đăng nhập
    window.addEventListener('storage', checkAuthStatus);
    
    const fetchPromoCodes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/promotions/active");
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data: ApiPromoCode[] = await response.json();
        const transformedPromoCodes: PublicPromoCode[] = data.map((promo) => {
          const discountAmount = parseFloat(promo.discount_amount);
          const isPercentage = discountAmount <= 100;
          // Luôn lấy tên agency từ ánh xạ nếu có agency_id
          let agencyName = "";
          if (promo.agency_id && agencyMap[promo.agency_id]) {
            agencyName = agencyMap[promo.agency_id];
          } else if (promo.agency_name) {
            agencyName = promo.agency_name;
          } else if (promo.agency_id) {
            agencyName = promo.agency_id;
          }
          return {
            id: promo.id,
            code: promo.code,
            description: promo.description,
            discountAmount: discountAmount,
            isPercentage: isPercentage,
            expiresAt: promo.end_date,
            isActive: new Date(promo.end_date) > new Date(),
            agencyName: agencyName
          };
        });
        setPromoCodes(transformedPromoCodes.filter((promo) => promo.isActive));
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchPromoCodes();
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const copyToClipboard = async (code: string) => {
    // Kiểm tra đăng nhập trước khi copy
    if (!isUserLoggedIn) {
      alert("Bạn cần đăng nhập để sử dụng mã giảm giá này!");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      localStorage.setItem("copiedPromoCode", code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {}
  };

  const formatDiscount = (amount: number, isPercentage: boolean) => {
    return isPercentage ? `${amount}%` : `${amount.toLocaleString("vi-VN")}₫`;
  };

  return (
    <section className="w-full flex flex-col items-center py-8 bg-white">
      <div className="w-full max-w-5xl px-2">
        <div className="flex items-center gap-2 mb-6">
          <Gift className="w-7 h-7 text-[#0057B8]" />
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366]">Mã Ưu Đãi Tặng Bạn Mới</h2>
        </div>
        <div className="flex flex-row gap-6 overflow-x-auto pb-2">
          {loading ? (
            <div className="w-full text-center py-8 text-gray-500">Đang tải mã giảm giá...</div>
          ) : promoCodes.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">Hiện tại chưa có mã giảm giá nào khả dụng.</div>
          ) : (
            promoCodes.map((promo, idx) => (
              <div
                key={promo.id}
                className="min-w-[320px] max-w-xs bg-white rounded-xl shadow-md border border-gray-200 flex flex-col justify-between px-6 py-5 relative"
                style={{ boxShadow: "0 2px 12px rgba(0,87,184,0.08)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EAF6FF]">
                    <Gift className="w-5 h-5 text-[#0057B8]" />
                  </span>
                  <span className="font-semibold text-[#003366] text-base">
                    {promo.isPercentage ? `${promo.discountAmount}% giảm giá` : `Giảm ngay ${promo.discountAmount.toLocaleString("vi-VN")}`}
                  </span>
                </div>
                <div className="font-bold text-[#003366] text-lg mb-1">
                  {promo.description}
                </div>
                {/* Agency name hiển thị ở đây */}
                {promo.agencyName && (
                  <div className="text-[#0057B8] text-sm font-medium mb-1">Đại lý áp dụng: {promo.agencyName}</div>
                )}
                
                {/* Thông báo yêu cầu đăng nhập */}
                <div className="text-gray-500 text-xs mb-2">
                  <span className="text-red-500 font-semibold">*Mã giảm giá chỉ dùng cho các tour do đại lý này quản lý.</span>
                </div>
                
                {/* Thông báo yêu cầu đăng nhập */}
                {!isUserLoggedIn && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-600 text-xs">⚠️</span>
                      <span className="text-yellow-700 text-xs font-medium">
                        Cần đăng nhập để sử dụng mã giảm giá
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-[#F4F8FB] rounded-lg px-3 py-2 flex items-center">
                    <span className="font-mono text-[#0057B8] text-base font-semibold tracking-wider">
                      {promo.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(promo.code)}
                    disabled={!isUserLoggedIn}
                    className={`ml-2 px-4 py-2 rounded-lg font-medium text-sm border transition ${
                      isUserLoggedIn 
                        ? 'bg-[#EAF6FF] text-[#0057B8] border-[#B3D8F6] hover:bg-[#D0E8FF] cursor-pointer'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    title={!isUserLoggedIn ? "Cần đăng nhập để sử dụng mã giảm giá" : ""}
                  >
                    {copiedCode === promo.code ? "✓" : isUserLoggedIn ? "Copy" : "🔒"}
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="inline-block w-5 h-5 rounded-full bg-[#F4F8FB] border border-[#B3D8F6] text-center text-xs font-bold text-[#0057B8]">
                    {promo.isPercentage ? "%" : "₫"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicPromoCodes;
