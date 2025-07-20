import BookingHistory from "./BookingHistory";
import { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import { useToast } from "../ui/use-toast";

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
        // Lấy tất cả tour_id duy nhất
        const tourIds = [...new Set(bookingsArr.map((b: any) => b.tour_id))];
        // Fetch chi tiết tour cho từng tour_id
        const tourMap: { [key: string]: any } = {};
        await Promise.all(tourIds.map(async (tourId: any) => {
          try {
            const res = await fetch(`http://localhost:5000/api/tours/${tourId}`);
            if (res.ok) {
              const tour = await res.json();
              tourMap[String(tourId)] = tour;
            }
          } catch {}
        }));
        // Fetch tất cả review của user cho các tour đã đặt
        const reviewPromises = tourIds.map(tourId =>
          fetch(`http://localhost:5000/api/reviews/tour/${tourId}`).then(res => res.json())
        );
        const reviewResults = await Promise.all(reviewPromises);
        const allReviews = reviewResults.flatMap(r => r.data || []);
        // Map review và thông tin tour vào từng booking
        const mapped = bookingsArr.map((b: any) => {
          const review = allReviews.find(
            (r: any) => r.booking_id === b.id && r.user_id === user.id
          );
          const tour = tourMap[b.tour_id] || {};
          return {
            id: b.id,
            tour_name: tour.name || "",
            departure_date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("vi-VN") : "",
            status: b.status || "",
            review: review || null,
            tour_id: b.tour_id
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
      alert("Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi!");
      return;
    }
    
    // Validate new password if provided
    if (form.newPassword && form.newPassword.trim() !== "" && form.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
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
        alert("Mật khẩu hiện tại không đúng!");
        setLoading(false);
        return;
      }

      if (res.status === 400) {
        alert(data.message || "Dữ liệu không hợp lệ!");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        alert(data.message || "Cập nhật thất bại!");
        setLoading(false);
        return;
      }

      // Update user data in localStorage
      const updatedUser = data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Show success message based on what was updated
      if (form.newPassword && form.newPassword.trim() !== "") {
        alert("Cập nhật thông tin và mật khẩu thành công!");
      } else {
        alert("Cập nhật thông tin thành công!");
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
      alert("Lỗi kết nối máy chủ!");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
    window.location.reload();
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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center min-h-screen z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto flex items-center justify-center">
          <span>Đang tải thông tin người dùng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center min-h-screen z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] relative flex flex-col">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 pr-0 md:pr-6 border-b md:border-b-0 md:border-r mb-4 md:mb-0 flex flex-col items-center">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow bg-gray-100 flex items-center justify-center">
                <img src={user.avatar ? user.avatar : "/user.png"} alt={user.username || "User"} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold mt-2 text-center w-full truncate" title={user.name || getNameFromEmail(user.email)}>
                {user.name || getNameFromEmail(user.email)}
              </div>
              <div className="text-gray-500 text-sm text-center w-full truncate" title={user.email}>{user.email}</div>
            </div>
            <div className="flex flex-row md:flex-col gap-2 w-full justify-center md:justify-start">
              <button className={`text-center px-4 py-2 rounded font-semibold transition-colors duration-150 w-full ${tab === "profile" ? "bg-teal-500 text-white" : "bg-white text-teal-700 hover:bg-teal-100"}`} onClick={() => setTab("profile")}>Thông tin cá nhân</button>
              <button className={`text-center px-4 py-2 rounded font-semibold transition-colors duration-150 w-full ${tab === "history" ? "bg-teal-500 text-white" : "bg-white text-teal-700 hover:bg-teal-100"}`} onClick={() => setTab("history")}>Lịch sử đặt tour</button>
            </div>
          </div>
          {/* Main content */}
          <div className="w-full md:w-2/3 md:pl-6 min-h-[28rem] overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {tab === "profile" && user && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tên đăng nhập:</label>
                    {editMode ? (
                      <input name="name" className="w-full border rounded px-3 py-4 text-base text-black break-all" value={form.name} onChange={handleChange} style={{minHeight: '48px'}} />
                    ) : (
                      <div className="px-3 py-2 border rounded bg-gray-50 text-black">{user.name || getNameFromEmail(user.email)}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email:</label>
                    {editMode ? (
                      <textarea name="email" rows={2} className="w-full border rounded px-3 py-4 text-base text-black break-all resize-none" value={form.email} onChange={e => handleChange({ target: { name: 'email', value: e.target.value } } as any)} style={{minHeight: '48px'}} />
                    ) : (
                      <div className="px-3 py-2 border rounded bg-gray-50 text-black break-all whitespace-pre-line">{user.email}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Mật khẩu mới:
                      <span className="text-gray-400 font-normal"> (để trống nếu không thay đổi)</span>
                    </label>
                    {editMode ? (
                      <input 
                        name="newPassword" 
                        type="password" 
                        className="w-full border rounded px-3 py-4 text-base text-black break-all" 
                        value={form.newPassword} 
                        onChange={handleChange} 
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" 
                        style={{minHeight: '48px'}}
                        minLength={6}
                      />
                    ) : (
                      <div className="px-3 py-2 border rounded bg-gray-50 italic text-gray-400">••••••••</div>
                    )}
                  </div>
                  {editMode && (
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                        <span className="text-gray-400 font-normal"> (bắt buộc để xác nhận thay đổi)</span>
                      </label>
                      <input 
                        name="currentPassword" 
                        type="password" 
                        className="w-full border rounded px-3 py-4 text-base text-black break-all" 
                        value={form.currentPassword} 
                        onChange={handleChange} 
                        placeholder="Nhập mật khẩu hiện tại để xác nhận" 
                        required 
                        style={{minHeight: '48px'}} 
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-start md:justify-start lg:justify-start flex-wrap">
                  {editMode ? (
                    <>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded transition-colors duration-150"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded transition-colors duration-150"
                        onClick={() => { setEditMode(false); setForm({ name: user.name || "", email: user.email || "", newPassword: "", currentPassword: "" }); }}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-6 py-2 rounded transition-colors duration-150 ml-auto"
                        onClick={handleLogout}
                        type="button"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2 rounded transition-colors duration-150"
                        onClick={() => setEditMode(true)}
                      >
                        Sửa
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-6 py-2 rounded transition-colors duration-150 ml-2"
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
              <BookingHistory bookings={bookings} onReview={handleReview} />
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
              alert(data.message || "Gửi đánh giá thất bại!");
            } else {
              alert("Đánh giá thành công! Cảm ơn bạn đã đánh giá tour.");
            }
            // Reload bookings
            if (user?.id) {
              fetch(`http://localhost:5000/api/bookings?user_id=${user.id}`)
                .then(res => res.json())
                .then(async data => {
                  const bookingsArr = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
                  const tourIds = [...new Set(bookingsArr.map((b: any) => b.tour_id))];
                  const tourMap: { [key: string]: any } = {};
                  await Promise.all(tourIds.map(async (tourId: any) => {
                    try {
                      const res = await fetch(`http://localhost:5000/api/tours/${tourId}`);
                      if (res.ok) {
                        const tour = await res.json();
                        tourMap[String(tourId)] = tour;
                      }
                    } catch {}
                  }));
                  const reviewPromises = tourIds.map(tourId =>
                    fetch(`http://localhost:5000/api/reviews/tour/${tourId}`).then(res => res.json())
                  );
                  const reviewResults = await Promise.all(reviewPromises);
                  const allReviews = reviewResults.flatMap(r => r.data || []);
                  const mapped = bookingsArr.map((b: any) => {
                    const review = allReviews.find(
                      (r: any) => r.booking_id === b.id && r.user_id === user.id
                    );
                    const tour = tourMap[b.tour_id] || {};
                    return {
                      id: b.id,
                      tour_name: tour.name || "",
                      departure_date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("vi-VN") : "",
                      status: b.status || "",
                      review: review || null,
                      tour_id: b.tour_id
                    };
                  });
                  setBookings(mapped);
                });
            }
          } catch (e) {
            alert("Gửi đánh giá thất bại!");
          }
          setReviewModalOpen(false);
        }}
        booking={selectedBooking}
        initialReview={initialReview}
      />
    </div>
  );
} 