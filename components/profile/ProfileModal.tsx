import BookingHistory from "./BookingHistory";
import { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import { useToast } from "../ui/use-toast";
import NotificationDialog from "../ui/NotificationDialog";
import { useNotificationDialog } from "../../hooks/useNotificationDialog";

interface BookingItem {
  id: string;
  tour_name: string;
  departure_date: string;
  status: string;
  review: any;
}

// Thêm hàm lấy tên từ email
function getNameFromEmail(email: string) {
  if (!email) return "Chưa đặt tên";
  const namePart = email.split("@")[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export default function ProfileModal({ open, onClose }) {
  console.log('ProfileModal render, open:', open);
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", newPassword: "", currentPassword: "" });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [initialReview, setInitialReview] = useState<any>(null);
  const { toast } = useToast();
  const {
    notification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
  } = useNotificationDialog();

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("token");
    console.log('ProfileModal: token', token);
    if (!token) return;
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log('ProfileModal: fetched user', data.user || data);
        setUser(data.user || data);
      })
      .catch(() => setUser(null));
  }, [open]);

  useEffect(() => {
    if (!open || !user?.id) return;
    fetch(`http://localhost:5000/api/bookings?user_id=${user.id}`)
      .then(res => res.json())
      .then(async data => {
        // Lấy đúng mảng bookings từ API
        const bookingsArr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        
        // Lấy tất cả tour_id cần fetch (chỉ những cái chưa có tour object và tour_id không null)
        const tourIdsToFetch = [...new Set(bookingsArr
          .filter((b: any) => b.tour_id !== null && !b.tour)
          .map((b: any) => b.tour_id)
        )];
        
        // Fetch chi tiết tour cho từng tour_id cần thiết
        const tourMap: { [key: string]: any } = {};
        await Promise.all(tourIdsToFetch.map(async (tourId: any) => {
          try {
            const res = await fetch(`http://localhost:5000/api/tours/${tourId}`);
            if (res.ok) {
              const tour = await res.json();
              tourMap[String(tourId)] = tour;
            }
          } catch {}
        }));
        
        // Lấy tất cả tour_id (bao gồm cả những cái đã có tour object)
        const allTourIds = [...new Set(bookingsArr
          .filter((b: any) => b.tour_id !== null)
          .map((b: any) => b.tour_id)
        )];
        
        // Fetch tất cả review của user cho các tour đã đặt
        const reviewPromises = allTourIds.map(tourId =>
          fetch(`http://localhost:5000/api/reviews/tour/${tourId}`).then(res => res.json())
        );
        const reviewResults = await Promise.all(reviewPromises);
        const allReviews = reviewResults.flatMap(r => r.data || []);
        
        // Map review và thông tin tour vào từng booking
        const mapped = bookingsArr.map((b: any) => {
          const review = allReviews.find(
            (r: any) => r.booking_id === b.id && r.user_id === user.id
          );
          
          // Ưu tiên tour object có sẵn, nếu không thì lấy từ tourMap đã fetch
          const tour = b.tour || tourMap[b.tour_id] || {};
          
          return {
            id: b.id,
            tour_name: tour.name || "Thông tin tour không có sẵn",
            departure_date: b.departureDate?.departure_date || 
                           (b.booking_date ? new Date(b.booking_date).toLocaleDateString("vi-VN") : "Chưa xác định"),
            status: b.status || "",
            review: review || null,
            tour_id: b.tour_id,
            // Thêm các thông tin chi tiết
            booking_date: b.booking_date,
            original_price: b.original_price,
            discount_amount: b.discount_amount,
            total_price: b.total_price,
            number_of_adults: b.number_of_adults,
            number_of_children: b.number_of_children,
            commission_rate: b.commission_rate,
            admin_commission: b.admin_commission,
            agency_amount: b.agency_amount,
            departureDate: b.departureDate,
            promotion: b.promotion
          };
        });
        setBookings(mapped);
      })
      .catch(() => setBookings([]));
  }, [open, user]);

  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        newPassword: "",
        currentPassword: ""
      });
    }
  }, [open, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.currentPassword) {
      showError("Lỗi xác thực", "Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi!");
      return;
    }
    
    // Validate new password if provided
    if (form.newPassword && form.newPassword.trim() !== "" && form.newPassword.length < 6) {
      showError("Lỗi mật khẩu", "Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem("token");
    const payload: any = {
      name: form.name,
      email: form.email,
      currentPassword: form.currentPassword
    };
    
    // Add newPassword only if user wants to change password
    if (form.newPassword && form.newPassword.trim() !== "") {
      payload.newPassword = form.newPassword;
    }
    
    console.log("Sending payload:", payload); // Debug log
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Response data:", data); // Debug log
      
      if (res.status === 401) {
        showError("Lỗi xác thực", "Mật khẩu hiện tại không đúng!");
        setLoading(false);
        return;
      }

      if (res.status === 400) {
        showError("Lỗi dữ liệu", data.message || "Dữ liệu không hợp lệ!");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        showError("Lỗi cập nhật", data.message || "Cập nhật thất bại!");
        setLoading(false);
        return;
      }

      // Update user data in localStorage
      const updatedUser = data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Show success message based on what was updated
      if (form.newPassword && form.newPassword.trim() !== "") {
        showSuccess("Thành công", "Cập nhật thông tin và mật khẩu thành công!");
      } else {
        showSuccess("Thành công", "Cập nhật thông tin thành công!");
      }
      
      setLoading(false);
      setEditMode(false);
      
      // Reset form
      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        newPassword: "",
        currentPassword: ""
      });
      
    } catch (error) {
      console.error("Update error:", error);
      showError("Lỗi kết nối", "Lỗi kết nối máy chủ!");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    window.location.reload();
  };

  const handleCancelBooking = async (booking: any) => {
    showConfirmation(
      "Xác nhận hủy tour",
      `Bạn có chắc chắn muốn hủy tour "${booking.tour_name}"?\n\nLưu ý: Việc hủy tour có thể phát sinh phí hủy theo chính sách của chúng tôi.`,
      async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}/cancel`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
      
          if (response.ok) {
            showSuccess("Hủy tour thành công", "Tour của bạn đã được hủy. Chúng tôi sẽ liên hệ với bạn về việc hoàn tiền.");
            // Reload bookings list
            window.location.reload();
          } else {
            showError("Hủy tour thất bại", data.message || "Không thể hủy tour. Vui lòng thử lại sau.");
          }
        } catch (error) {
          console.error('Cancel booking error:', error);
          showError("Lỗi hệ thống", "Không thể hủy tour. Vui lòng thử lại sau.");
        }
      },
      "Hủy tour",
      "Quay lại"
    );
  };

  const handleCancelClick = (booking: any) => {
    // Mở trang hủy tour trong tab mới
    window.open(`/cancel-tour/${booking.id}`, '_blank');
  };

  const handleViewDetails = (booking: any) => {
    console.log('📋 Opening booking details for:', booking);
    
    // Chuyển hướng đến trang confirmation với thông tin booking
    const params = new URLSearchParams({
      bookingId: booking.id,
      orderId: booking.id, // Sử dụng booking.id làm orderId
      method: 'BookingReview', // Đánh dấu đây là xem lại từ history
      fromHistory: 'true', // Flag để biết đây là từ history
      amount: booking.total_price || '0'
    });
    
    console.log('🔗 Confirmation URL:', `/confirmation?${params.toString()}`);
    
    // Mở trang confirmation trong tab mới
    window.open(`/confirmation?${params.toString()}`, '_blank');
  };

  const handleReview = (action: string, booking: any) => {
    if (action === "new" || action === "edit") {
      setSelectedBooking(booking);
      setInitialReview(booking.review || null);
      setReviewModalOpen(true);
    }
    // Có thể xử lý xóa review ở đây nếu cần
  };

  if (!open) return null;
  if (!user) {
    console.log('ProfileModal: user is null, loading...');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center min-h-screen z-[10000]">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto flex items-center justify-center">
          <span>Đang tải thông tin người dùng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center min-h-screen z-[10000] p-4">
      <div className="bg-white rounded-2xl p-10 w-full max-w-6xl max-h-[95vh] relative flex flex-col shadow-2xl">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" onClick={onClose}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-8 flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                <img src={user.avatar ? user.avatar : "/user.png"} alt={user.username || "User"} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-lg mt-4 text-center w-full truncate" title={user.name || getNameFromEmail(user.email)}>
                {user.name || getNameFromEmail(user.email)}
              </div>
              <div className="text-gray-500 text-base text-center w-full truncate" title={user.email}>{user.email}</div>
            </div>
            <div className="flex flex-row lg:flex-col gap-3 w-full justify-center lg:justify-start">
              <button className={`text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 w-full text-base ${tab === "profile" ? "bg-teal-500 text-white shadow-md" : "bg-white text-teal-700 hover:bg-teal-50 border border-teal-200"}`} onClick={() => setTab("profile")}>
                Thông tin cá nhân
              </button>
              <button className={`text-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 w-full text-base ${tab === "history" ? "bg-teal-500 text-white shadow-md" : "bg-white text-teal-700 hover:bg-teal-50 border border-teal-200"}`} onClick={() => setTab("history")}>
                Lịch sử đặt tour
              </button>
            </div>
          </div>
          {/* Main content */}
          <div className="w-full lg:w-2/3 min-h-[32rem] overflow-y-auto" style={{ maxHeight: "70vh" }}>
            {tab === "profile" && user && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập:</label>
                    {editMode ? (
                      <input name="name" className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-black focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200" value={form.name} onChange={handleChange} style={{minHeight: '52px'}} />
                    ) : (
                      <div className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-black text-base" style={{minHeight: '52px'}}>{user.name || getNameFromEmail(user.email)}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
                    {editMode ? (
                      <textarea name="email" rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-black resize-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200" value={form.email} onChange={e => handleChange({ target: { name: 'email', value: e.target.value } } as any)} style={{minHeight: '52px'}} />
                    ) : (
                      <div className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-black text-base whitespace-pre-line" style={{minHeight: '52px'}}>{user.email}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới:
                      <span className="text-gray-400 font-normal"> (để trống nếu không thay đổi)</span>
                    </label>
                    {editMode ? (
                      <input 
                        name="newPassword" 
                        type="password" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-black focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200" 
                        value={form.newPassword} 
                        onChange={handleChange} 
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" 
                        style={{minHeight: '52px'}}
                        minLength={6}
                      />
                    ) : (
                      <div className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50 italic text-gray-400 text-base" style={{minHeight: '52px'}}>••••••••</div>
                    )}
                  </div>
                  {editMode && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                        <span className="text-gray-400 font-normal"> (bắt buộc để xác nhận thay đổi)</span>
                      </label>
                      <input 
                        name="currentPassword" 
                        type="password" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-base text-black focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200" 
                        value={form.currentPassword} 
                        onChange={handleChange} 
                        placeholder="Nhập mật khẩu hiện tại để xác nhận" 
                        required 
                        style={{minHeight: '52px'}} 
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-start flex-wrap">
                  {editMode ? (
                    <>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md"
                        onClick={() => { setEditMode(false); setForm({ name: user.name || "", email: user.email || "", newPassword: "", currentPassword: "" }); }}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md ml-auto"
                        onClick={handleLogout}
                        type="button"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                        onClick={() => setEditMode(true)}
                      >
                        Sửa
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md ml-4"
                        onClick={handleLogout}
                        type="button"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            {tab === "history" && (
              <BookingHistory 
                bookings={bookings} 
                onReview={handleReview} 
                onViewDetails={handleViewDetails} 
                onCancelBooking={handleCancelBooking}
                onCancelClick={handleCancelClick}
              />
            )}
          </div>
        </div>
      </div>
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={async (review) => {
          if (!selectedBooking) return;
          const token = localStorage.getItem("token");
          try {
            const res = await fetch("http://localhost:5000/api/reviews", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                booking_id: selectedBooking.id,
                tour_id: selectedBooking.tour_id,
                rating: review.rating,
                comment: review.comment
              })
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
              showError("Gửi đánh giá thất bại", data.message || "Có lỗi xảy ra khi gửi đánh giá!");
            } else {
              showSuccess("Đánh giá thành công", "Cảm ơn bạn đã đánh giá tour!");
            }
            // Reload bookings
            if (user?.id) {
              fetch(`http://localhost:5000/api/bookings?user_id=${user.id}`)
                .then(res => res.json())
                .then(async data => {
                  const bookingsArr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                  
                  // Lấy tất cả tour_id cần fetch (chỉ những cái chưa có tour object và tour_id không null)
                  const tourIdsToFetch = [...new Set(bookingsArr
                    .filter((b: any) => b.tour_id !== null && !b.tour)
                    .map((b: any) => b.tour_id)
                  )];
                  
                  const tourMap: { [key: string]: any } = {};
                  await Promise.all(tourIdsToFetch.map(async (tourId: any) => {
                    try {
                      const res = await fetch(`http://localhost:5000/api/tours/${tourId}`);
                      if (res.ok) {
                        const tour = await res.json();
                        tourMap[String(tourId)] = tour;
                      }
                    } catch {}
                  }));
                  
                  // Lấy tất cả tour_id (bao gồm cả những cái đã có tour object)
                  const allTourIds = [...new Set(bookingsArr
                    .filter((b: any) => b.tour_id !== null)
                    .map((b: any) => b.tour_id)
                  )];
                  
                  const reviewPromises = allTourIds.map(tourId =>
                    fetch(`http://localhost:5000/api/reviews/tour/${tourId}`).then(res => res.json())
                  );
                  const reviewResults = await Promise.all(reviewPromises);
                  const allReviews = reviewResults.flatMap(r => r.data || []);
                  const mapped = bookingsArr.map((b: any) => {
                    const review = allReviews.find(
                      (r: any) => r.booking_id === b.id && r.user_id === user.id
                    );
                    // Ưu tiên tour object có sẵn, nếu không thì lấy từ tourMap đã fetch
                    const tour = b.tour || tourMap[b.tour_id] || {};
                    return {
                      id: b.id,
                      tour_name: tour.name || "Thông tin tour không có sẵn",
                      departure_date: b.departureDate?.departure_date || 
                                     (b.booking_date ? new Date(b.booking_date).toLocaleDateString("vi-VN") : "Chưa xác định"),
                      status: b.status || "",
                      review: review || null,
                      tour_id: b.tour_id,
                      // Thêm các thông tin chi tiết
                      booking_date: b.booking_date,
                      original_price: b.original_price,
                      discount_amount: b.discount_amount,
                      total_price: b.total_price,
                      number_of_adults: b.number_of_adults,
                      number_of_children: b.number_of_children,
                      commission_rate: b.commission_rate,
                      admin_commission: b.admin_commission,
                      agency_amount: b.agency_amount,
                      departureDate: b.departureDate,
                      promotion: b.promotion
                    };
                  });
                  setBookings(mapped);
                });
            }
          } catch (e) {
            showError("Gửi đánh giá thất bại", "Có lỗi xảy ra khi gửi đánh giá!");
          }
          setReviewModalOpen(false);
        }}
        booking={selectedBooking}
        initialReview={initialReview}
      />
      
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        showCancel={notification.showCancel}
      />
    </div>
  );
} 