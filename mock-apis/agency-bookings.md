# Agency Bookings API Structure

## GET /api/agency/bookings/{booking_id}

Endpoint này trả về toàn bộ thông tin chi tiết của một booking, bao gồm tất cả thông tin liên quan.

### Expected Response Format:

```json
{
  "id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
  "user_id": "3ca8bb89-a406-4deb-96a7-dab4d9be3cc1",
  "tour_id": "2231a82b-6b08-4835-8a33-b7e6e031b430",
  "departure_date_id": "1fa4df30-815b-4fd6-bacf-97dfb10d8c8b",
  "promotion_id": null,
  "booking_code": "TT345678",
  "booking_date": "2025-07-17T09:41:20.000Z",
  "status": "confirmed",
  "adult_count": 2,
  "child_count": 1,
  "adult_price": "5220000.00",
  "child_price": "1566000.00",
  "original_price": "11786000.00",
  "discount_amount": "580000.00",
  "total_price": "11206000.00",
  "commission_rate": "5.00",
  "admin_commission": "560300.00",
  "agency_amount": "10645700.00",
  "commission_calculated_at": "2025-07-17T09:41:39.000Z",
  "created_at": "2025-07-18T16:15:30.000Z",
  "updated_at": "2025-07-18T16:31:00.000Z",

  // Thông tin khách hàng (người đặt tour)
  "user": {
    "id": "3ca8bb89-a406-4deb-96a7-dab4d9be3cc1",
    "full_name": "Nguyễn Thị B",
    "email": "booker@gmail.com",
    "phone": "0987654321",
    "cccd": "089303002900",
    "address": "456 Đường DEF, Quận 2, TP.HCM",
    "date_of_birth": "1985-05-20",
    "gender": "female"
  },

  // Thông tin khách tham gia tour (guests)
  "guests": [
    {
      "id": "guest-1",
      "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
      "full_name": "Nguyễn Văn A",
      "email": "nhom2@gmail.com",
      "phone": "0123456789",
      "cccd": "089303002985",
      "date_of_birth": "1990-01-15",
      "gender": "male",
      "relationship": "Khách chính",
      "guest_type": "adult",
      "special_requirements": null,
      "created_at": "2025-07-17T09:41:20.000Z"
    },
    {
      "id": "guest-2",
      "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
      "full_name": "Trần Thị C",
      "email": "guest2@gmail.com",
      "phone": "0123456780",
      "cccd": "089303002986",
      "date_of_birth": "1992-03-10",
      "gender": "female",
      "relationship": "Vợ/chồng",
      "guest_type": "adult",
      "special_requirements": "Ăn chay",
      "created_at": "2025-07-17T09:41:20.000Z"
    },
    {
      "id": "guest-3",
      "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
      "full_name": "Nguyễn Văn D",
      "email": null,
      "phone": null,
      "cccd": null,
      "date_of_birth": "2015-08-20",
      "gender": "male",
      "relationship": "Con",
      "guest_type": "child",
      "special_requirements": null,
      "created_at": "2025-07-17T09:41:20.000Z"
    }
  ],

  // Thông tin tour đầy đủ
  "tour": {
    "id": "2231a82b-6b08-4835-8a33-b7e6e031b430",
    "name": "Tour du lịch Đà Lạt 4N3Đ - Trải nghiệm ngàn hoa",
    "description": "Khám phá thành phố ngàn hoa với những trải nghiệm tuyệt vời...",
    "location": "Đà Lạt",
    "duration": "4 ngày 3 đêm",
    "price": "5220000.00",
    "max_participants": 20,
    "images": [
      {
        "id": "img1",
        "image_url": "https://example.com/dalat1.jpg",
        "is_main": true
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "title": "Ngày 1: Khởi hành - Tham quan",
        "description": "...",
        "activities": [...]
      }
    ],
    "services_included": ["Xe du lịch", "Khách sạn 4*", "Ăn sáng"],
    "services_excluded": ["Vé máy bay", "Chi phí cá nhân"]
  },

  // Thông tin ngày khởi hành
  "departure_date": {
    "id": "1fa4df30-815b-4fd6-bacf-97dfb10d8c8b",
    "tour_id": "2231a82b-6b08-4835-8a33-b7e6e031b430",
    "departure_date": "2025-08-15",
    "return_date": "2025-08-18",
    "number_of_days": 4,
    "number_of_nights": 3,
    "price": "5220000.00",
    "max_participants": 20,
    "current_bookings": 8,
    "status": "available"
  },

  // Thông tin thanh toán
  "payment": {
    "id": "0292bcdd-c7d2-4cc2-86ec-8c258caace30",
    "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
    "order_id": "MOMO1752745294006",
    "amount": "11206000.00",
    "payment_date": "2025-07-17T09:41:39.000Z",
    "payment_method": "MoMo",
    "status": "success",
    "transaction_id": "MOMO1752745294006",
    "gateway_response": {...}
  },

  // Thông tin thuế VAT
  "tax_info": {
    "tax_code": "VAT001",
    "vat_rate": "10.00",
    "vat_amount": "560300.00",
    "tax_type": "VAT tiêu chuẩn",
    "tax_status": "calculated"
  },

  // Phí dịch vụ hệ thống  
  "service_fees": {
    "processing_fee": "200000.00",
    "platform_fee": "150000.00", 
    "total_service_fees": "350000.00"
  },

  // Thông tin tính thuế và phí
  "tax_calculation": {
    "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
    "vat_rate": "10.00",
    "vat_amount": "560300.00", 
    "service_fee": "10645700.00",
    "calculation_status": "calculated",
    "calculated_at": "2025-07-17T09:41:39.000Z"
  },

  // Thông tin hoàn tiền (nếu có)
  "refund": {
    "id": "refund-123",
    "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
    "refund_amount": "8000000.00",
    "refund_reason": "Khách hàng yêu cầu hủy do việc cá nhân",
    "refund_status": "processed",
    "refund_date": "2025-07-20T10:00:00.000Z",
    "processing_fee": "1000000.00"
  },

  // Thông tin hủy booking (nếu có)
  "cancellation": {
    "id": "cancel-123",
    "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
    "cancellation_reason": "Khách hàng thay đổi kế hoạch",
    "cancellation_date": "2025-07-19T15:30:00.000Z",
    "cancellation_fee": "1000000.00",
    "cancelled_by": "customer"
  },

  // Lịch sử trạng thái
  "status_history": [
    {
      "id": "status-1",
      "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
      "status": "pending",
      "changed_at": "2025-07-17T09:41:20.000Z",
      "changed_by": "system",
      "notes": "Booking created"
    },
    {
      "id": "status-2",
      "booking_id": "0022a4b6-ac42-4d5b-a16b-94c6b43db826",
      "status": "confirmed",
      "changed_at": "2025-07-17T09:41:39.000Z",
      "changed_by": "system",
      "notes": "Payment successful"
    }
  ],

  // Các khoản phí không hoàn lại
  "non_refundable_fees": [
    {
      "fee_type": "booking_fee",
      "fee_name": "Phí đặt tour",
      "amount": "200000.00",
      "description": "Phí xử lý đặt tour không được hoàn lại"
    },
    {
      "fee_type": "service_fee", 
      "fee_name": "Phí dịch vụ",
      "amount": "150000.00",
      "description": "Phí dịch vụ hệ thống"
    }
  ]
}
```

### Lợi ích của endpoint này:

1. **Thông tin đầy đủ**: Tất cả thông tin liên quan đến booking trong một API call
2. **Hiệu suất cao**: Không cần gọi nhiều API riêng biệt
3. **Thông tin real-time**: Dữ liệu luôn được cập nhật từ database
4. **Quản lý trạng thái**: Theo dõi được lịch sử thay đổi trạng thái
5. **Tích hợp đại lý**: Hiển thị đầy đủ thông tin hoa hồng và đại lý

### Cách sử dụng:

```javascript
// Gọi API với booking ID hoặc payment order ID
GET /api/agency/bookings/0022a4b6-ac42-4d5b-a16b-94c6b43db826
GET /api/agency/bookings/MOMO1752745294006

// Response sẽ chứa tất cả thông tin cần thiết cho confirmation page
```

### Error Handling:

```json
// 404 - Booking not found
{
  "error": "Booking not found",
  "message": "No booking found with the provided ID",
  "code": "BOOKING_NOT_FOUND"
}

// 403 - Access denied
{
  "error": "Access denied", 
  "message": "You don't have permission to view this booking",
  "code": "ACCESS_DENIED"
}
```
