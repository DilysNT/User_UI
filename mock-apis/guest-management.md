# Guest Management System

## Cấu trúc Guests trong API Response

### 1. User vs Guests
- **User**: Người đặt và thanh toán tour (có thể không tham gia)
- **Guests**: Những người thực sự tham gia tour

### 2. Guest Information Structure
```json
{
  "guests": [
    {
      "id": "guest-1",
      "booking_id": "booking-id",
      "full_name": "Nguyễn Văn A",
      "email": "guest@gmail.com",
      "phone": "0123456789", 
      "cccd": "089303002985",
      "date_of_birth": "1990-01-15",
      "gender": "male",
      "relationship": "Khách chính", // Khách chính, Vợ/chồng, Con, Cha/mẹ, Anh/chị/em, Bạn bè
      "guest_type": "adult", // adult, child, infant
      "special_requirements": "Ăn chay", // Yêu cầu đặc biệt
      "emergency_contact": {
        "name": "Nguyễn Thị B",
        "phone": "0987654321",
        "relationship": "Vợ"
      },
      "created_at": "2025-07-17T09:41:20.000Z"
    }
  ]
}
```

### 3. Guest Types
- **adult**: Người lớn (12+ tuổi)
- **child**: Trẻ em (2-11 tuổi) 
- **infant**: Em bé (0-23 tháng)

### 4. Relationship Types
- **Khách chính**: Guest chính, thường là người liên hệ
- **Vợ/chồng**: Vợ hoặc chồng
- **Con**: Con cái
- **Cha/mẹ**: Cha hoặc mẹ
- **Anh/chị/em**: Anh chị em ruột
- **Bạn bè**: Bạn bè
- **Đồng nghiệp**: Đồng nghiệp
- **Khác**: Mối quan hệ khác

### 5. Required Fields
- `full_name`: Bắt buộc
- `guest_type`: Bắt buộc  
- `relationship`: Bắt buộc
- `date_of_birth`: Bắt buộc để xác định guest_type
- `cccd`: Bắt buộc cho adult (18+)
- `phone`: Bắt buộc cho khách chính
- `email`: Tùy chọn

### 6. Business Rules
- Phải có ít nhất 1 guest với relationship="Khách chính"
- Guest chính phải có đầy đủ thông tin liên hệ
- Trẻ em dưới 18 tuổi không bắt buộc CCCD
- Em bé thường đi kèm với cha/mẹ

### 7. Display Logic in Confirmation Page
```typescript
// 1. Hiển thị thông tin guest chính làm contact info
const mainGuest = guests.find(g => g.relationship === "Khách chính") || guests[0];

// 2. Phân biệt người đặt tour vs khách tham gia  
const isBookerJoining = guests.some(g => g.email === user.email);

// 3. Hiển thị danh sách tất cả guests nếu > 1
if (guests.length > 1) {
  // Show guest list
}

// 4. Tính toán giá theo guest type
const adultCount = guests.filter(g => g.guest_type === 'adult').length;
const childCount = guests.filter(g => g.guest_type === 'child').length; 
const infantCount = guests.filter(g => g.guest_type === 'infant').length;
```

### 8. QR Code Content
```typescript
const qrContent = [
  `Mã booking: ${bookingCode}`,
  `Tour: ${tour.name}`,
  `Khách chính: ${mainGuest.full_name}`,
  `SĐT: ${mainGuest.phone}`,
  `Số người: ${guests.length}`,
  `Khởi hành: ${departureDate}`,
  `Tổng tiền: ${totalAmount}₫`
].join('\n');
```

### 9. Email Notification
- Gửi email xác nhận cho guest chính (nếu có email)
- CC cho người đặt tour (nếu khác guest chính)
- Bao gồm thông tin tất cả guests trong email

### 10. Validation Rules
```javascript
// Validate guest data
function validateGuests(guests) {
  // Must have at least 1 guest
  if (!guests || guests.length === 0) return false;
  
  // Must have main guest
  const mainGuest = guests.find(g => g.relationship === "Khách chính");
  if (!mainGuest) return false;
  
  // Main guest must have contact info
  if (!mainGuest.phone || !mainGuest.full_name) return false;
  
  // Adults must have CCCD
  const adults = guests.filter(g => g.guest_type === 'adult');
  const adultsWithoutCCCD = adults.filter(g => !g.cccd);
  if (adultsWithoutCCCD.length > 0) return false;
  
  return true;
}
```
