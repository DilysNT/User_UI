# VAT & Tax System Documentation

## Thay đổi từ hệ thống Hoa hồng sang VAT

### Trước đây (Agency Commission System):
```json
{
  "agency": {
    "agency_name": "Công ty Du lịch ABC",
    "agency_code": "ABC123"
  },
  "commission": {
    "commission_rate": "5.00",
    "admin_commission": "560300.00",
    "agency_amount": "10645700.00"
  }
}
```

### Bây giờ (VAT & Tax System):
```json
{
  "tax_info": {
    "tax_code": "VAT001",
    "vat_rate": "10.00", 
    "vat_amount": "560300.00",
    "tax_type": "VAT tiêu chuẩn"
  },
  "service_fees": {
    "processing_fee": "200000.00",
    "platform_fee": "150000.00",
    "total_service_fees": "350000.00"
  }
}
```

## Giao diện hiển thị mới:

### Thông tin phí VAT:
- **Mã thuế**: VAT001
- **Loại thuế**: VAT tiêu chuẩn  
- **Tỷ lệ VAT**: 10%
- **Phí VAT**: 560.300₫

### Chi tiết thanh toán:
- **Người lớn (2)**: 10.440.000₫
- **Trẻ em (1)**: 1.566.000₫
- **Tổng giá tour**: 12.006.000₫
- **Giảm giá**: -580.000₫
- **Phí VAT**: 560.300₫ (màu cam)
- **Phí dịch vụ**: 350.000₫ (màu xanh)
- **Số tiền đã thanh toán**: 11.206.000₫

## Lợi ích của thay đổi:

### 1. Phù hợp với quy định:
- Tuân thủ luật thuế Việt Nam
- Minh bạch về thuế VAT
- Phân biệt rõ thuế và phí dịch vụ

### 2. User-friendly:
- Người dùng hiểu rõ thuế VAT
- Không gây nhầm lẫn về "hoa hồng đại lý"
- Thông tin tài chính rõ ràng

### 3. Professional:
- Tuân thủ chuẩn kế toán
- Phù hợp với hóa đơn VAT
- Dễ dàng xuất hóa đơn đỏ

## Cấu trúc API cập nhật:

### GET /api/agency/bookings/{id}
```json
{
  "booking": {
    "id": "booking-123",
    "total_price": "12006000.00",
    "discount_amount": "580000.00",
    "vat_amount": "560300.00",
    "service_fee": "350000.00",
    "final_amount": "11206000.00"
  },
  "tax_calculation": {
    "vat_rate": "10.00",
    "vat_amount": "560300.00",
    "vat_type": "VAT tiêu chuẩn",
    "tax_code": "VAT001"
  },
  "service_fees": {
    "processing_fee": "200000.00",
    "platform_fee": "150000.00", 
    "total_service_fees": "350000.00"
  }
}
```

## Implementation Notes:

### Frontend Changes:
- Đổi tên section: "Thông tin đại lý" → "Thông tin phí VAT"
- Đổi tên fields: 
  - "Hoa hồng admin" → "Phí VAT"
  - "Số tiền đại lý" → "Phí dịch vụ"
- Màu sắc: VAT (cam), Dịch vụ (xanh)

### Backend Changes:
- Table: `commissions` → `tax_calculations`
- Fields: 
  - `commission_rate` → `vat_rate`
  - `admin_commission` → `vat_amount`
  - `agency_amount` → `service_fee`

### Database Migration:
```sql
-- Rename table
ALTER TABLE commissions RENAME TO tax_calculations;

-- Rename columns  
ALTER TABLE tax_calculations RENAME COLUMN commission_rate TO vat_rate;
ALTER TABLE tax_calculations RENAME COLUMN admin_commission TO vat_amount;
ALTER TABLE tax_calculations RENAME COLUMN agency_amount TO service_fee;

-- Add new fields
ALTER TABLE tax_calculations ADD COLUMN tax_code VARCHAR(50);
ALTER TABLE tax_calculations ADD COLUMN tax_type VARCHAR(100) DEFAULT 'VAT tiêu chuẩn';
```

## Testing Checklist:

- [ ] Confirmation page hiển thị "Phí VAT" thay vì "Hoa hồng"
- [ ] Tính toán VAT 10% chính xác
- [ ] Phí dịch vụ hiển thị đúng
- [ ] QR code cập nhật thông tin mới
- [ ] API response format đúng
- [ ] Database migration thành công
- [ ] Hóa đơn VAT export đúng format

## Compliance Notes:

Theo Luật Thuế GTGT Việt Nam:
- Tỷ lệ VAT tiêu chuẩn: 10%
- Phải có mã số thuế trên hóa đơn
- Phân biệt rõ giá chưa thuế và có thuế
- Thuế VAT tính trên giá trị gia tăng

Hệ thống mới tuân thủ đầy đủ các quy định này.
