import React from "react";

// Một container đơn giản để hiển thị thông báo lỗi dạng toast
export default function ErrorToastContainer() {
  // Bạn có thể tích hợp thư viện như react-toastify hoặc tự custom
  // Ở đây chỉ là placeholder, có thể nâng cấp sau
  return (
    <div id="error-toast-container" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {/* Thông báo lỗi sẽ được render ở đây bằng context hoặc props */}
    </div>
  );
}
