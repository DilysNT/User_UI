# 🎫 COMPLETE USER PROMO CODE SYSTEM

## 📋 Overview
Hệ thống mã giảm giá tự động cho user được thiết kế để tăng retention, loyalty và engagement. User nhận mã tự động sau các hành động tích cực.

## 🎯 Các cách User nhận mã giảm giá

### 1. 📝 Hoàn thành tour + Viết đánh giá
- **Tự động**: Sau khi tour có trạng thái "completed" và user viết review
- **Giảm giá**: 10% (tối đa 500,000 VNĐ)
- **Điều kiện**: Đơn từ 1,000,000 VNĐ
- **Hết hạn**: 90 ngày
- **Mã format**: `TOUR{userID}{date}{random}`

### 2. 🎂 Sinh nhật
- **Tự động**: Tạo 1 tuần trước sinh nhật
- **Giảm giá**: 15% (tối đa 1,000,000 VNĐ)
- **Điều kiện**: Đơn từ 2,000,000 VNĐ  
- **Hết hạn**: 30 ngày
- **Mã format**: `BIRTH{userID}{date}{random}`

### 3. 🌟 Khách hàng thân thiết
- **5+ tours**: VIP Vàng - 20% (tối đa 2,000,000 VNĐ)
- **10+ tours**: VIP Kim Cương - 25% (tối đa 2,500,000 VNĐ)
- **Điều kiện**: Đơn từ 3,000,000 VNĐ
- **Hết hạn**: 180 ngày
- **Mã format**: `LOYAL{userID}{date}{random}`

### 4. 👥 Giới thiệu bạn bè
- **Kích hoạt**: Khi bạn bè book tour thành công qua link giới thiệu
- **Giảm giá**: Cả 2 bên đều được mã 12%
- **Mã format**: `REF{userID}{date}{random}`

## 🔄 Quy trình tự động

```
User hoàn thành tour (status: completed)
         ↓
User viết đánh giá và submit thành công  
         ↓
Trigger: handleTourCompletionReward()
         ↓
Tạo mã completion (luôn luôn)
         ↓
Kiểm tra số tour đã hoàn thành
         ↓
Tạo mã loyalty nếu đủ điều kiện (mỗi 5 tours)
         ↓
Hiển thị PromoCodeNotification
         ↓
Cập nhật tab "Mã giảm giá" trong Profile
```

## 📁 Files đã tạo/cập nhật

### Core Utilities
- **`lib/promoCodeUtils.ts`**: Logic tạo và quản lý mã giảm giá
- **`lib/commissionUtils.ts`**: Updated với children pricing (50%)

### UI Components  
- **`components/profile/PromoCodeNotification.tsx`**: Thông báo nhận mã mới
- **`components/profile/ProfileModal.tsx`**: Thêm tab "Mã giảm giá"
- **`components/details/Booking.tsx`**: Updated hiển thị giá trẻ em

### Testing Files
- **`test-promo-system.html`**: Demo UI hệ thống mã giảm giá
- **`test-promo-api.html`**: Test API endpoints và mock data

## 🛠️ Backend API cần implement

### 1. GET /api/user-promocodes
```javascript
// Lấy danh sách mã của user
Query: ?userId=12
Response: {
  promoCodes: [
    {
      id: 1,
      code: "TOUR12250721ABC",
      type: "completion",
      discountPercent: 10,
      maxDiscount: 500000,
      minOrderValue: 1000000,
      status: "active", // active | used | expired
      expiresAt: "2025-04-15T00:00:00Z",
      source: "Tour 105",
      createdAt: "2025-01-21T10:30:00Z"
    }
  ]
}
```

### 2. POST /api/user-promocodes
```javascript
// Tạo mã mới
Body: {
  type: "completion", // completion | birthday | loyalty | referral
  userId: 12,
  data: {
    tourId: 105,
    tourName: "Tour Hạ Long",
    reviewRating: 5
  }
}
Response: {
  success: true,
  promoCode: "TOUR12250721ABC",
  discountPercent: 10,
  maxDiscount: 500000,
  expiresAt: "2025-04-15T00:00:00Z",
  message: "Chúc mừng! Bạn đã nhận được mã giảm giá 10%"
}
```

### 3. PUT /api/user-promocodes/:code/use
```javascript
// Sử dụng mã giảm giá
Body: {
  userId: 12,
  orderValue: 2000000
}
Response: {
  success: true,
  discountAmount: 200000,
  finalAmount: 1800000,
  usedAt: "2025-01-21T10:30:00Z"
}
```

## 🎨 UI Features trong ProfileModal

### Tab "Mã giảm giá"
- ✅ Danh sách tất cả mã của user
- ✅ Badge trạng thái: Có thể dùng / Đã dùng / Hết hạn  
- ✅ Thông tin chi tiết: % giảm, max giảm, điều kiện
- ✅ Button copy mã
- ✅ Nguồn gốc mã (từ tour nào, sự kiện gì)
- ✅ Ngày tạo và hết hạn
- ✅ Tự động refresh khi có mã mới

### PromoCodeNotification
- ✅ Animation slide-in từ phải
- ✅ Gradient background đẹp
- ✅ Copy to clipboard
- ✅ Auto dismiss sau 5s
- ✅ Close button manual

## 💡 Business Benefits

### 📈 Retention & Engagement
- **Khuyến khích viết review**: User biết sẽ có mã sau review
- **Tăng repeat booking**: Mã giảm giá tạo động lực book lại
- **Tính loyalty**: Hệ thống VIP thưởng khách hàng thân thiết

### 💰 Revenue Optimization  
- **Tăng AOV**: Điều kiện minimum order value
- **Tối ưu margin**: Max discount limit
- **Word-of-mouth**: Referral program

### 📊 Data & Analytics
- **Track user behavior**: Nguồn mã, tỷ lệ sử dụng
- **Segment customers**: Dựa trên tier loyalty
- **Optimize campaigns**: A/B test các loại mã

## 🧪 Testing Guide

### 1. Manual Testing
1. Mở `test-promo-system.html` để xem demo UI
2. Mở `test-promo-api.html` để test API calls
3. Trigger PromoCodeNotification trong ProfileModal
4. Kiểm tra tab "Mã giảm giá" hiển thị đúng

### 2. Flow Testing
1. Book tour → Complete → Write review
2. Check notification xuất hiện
3. Check tab "Mã giảm giá" có mã mới
4. Test áp dụng mã trong booking
5. Verify mã status thành "used"

## 🚀 Deployment Checklist

### Frontend
- [x] PromoCodeUtils implemented
- [x] ProfileModal updated with promo tab
- [x] PromoCodeNotification component
- [x] Booking.tsx updated with children pricing
- [x] CommissionUtils updated

### Backend (Need to implement)
- [ ] `/api/user-promocodes` endpoints
- [ ] Database schema for user_promocodes table
- [ ] Cron job for birthday promos
- [ ] Integration with review submission
- [ ] Integration with booking completion

### Integration
- [ ] Connect frontend calls with real backend
- [ ] Error handling for API failures  
- [ ] Loading states for promo operations
- [ ] Toast notifications for success/error

## 📝 Future Enhancements

### Phase 2
- 🎯 **Flash sales**: Limited time promo codes
- 🎁 **Seasonal events**: Tết, summer vacation promos  
- 📱 **Push notifications**: Alert when new promo available
- 🏆 **Leaderboard**: Top reviewers get special codes

### Phase 3
- 🤖 **AI personalization**: Custom discount based on behavior
- 🔄 **Auto-renew**: Extend expiry for active users
- 💳 **Tiered discounts**: Progressive discounts by spend
- 📧 **Email campaigns**: Promo code newsletters

## 🎉 Success Metrics

### User Engagement
- **Review rate**: % users viết review sau tour
- **Return rate**: % users book lại trong 6 tháng
- **Promo usage**: % mã được sử dụng vs expired

### Business Impact  
- **Revenue per user**: Trung bình doanh thu/user
- **Customer lifetime value**: Tổng value của repeat customers
- **Acquisition cost**: Giảm cost nhờ referral program

---

**Status**: ✅ Core system implemented và ready for testing
**Next**: Backend API implementation và integration testing
