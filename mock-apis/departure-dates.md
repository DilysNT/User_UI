# Departure Dates API Structure

Để hiển thị thông tin có ý nghĩa thay vì ID trong confirmation page, bạn cần tạo API endpoint:

## GET /api/departure-dates/{departure_date_id}

### Response Format:
```json
{
  "id": "1fa4df30-815b-4fd6-bacf-97dfb10d8c8b",
  "tour_id": "2231a82b-6b08-4835-8a33-b7e6e031b430",
  "departure_date": "2025-08-15",
  "return_date": "2025-08-18",
  "number_of_days": 4,
  "number_of_nights": 3,
  "price": 5220000,
  "max_participants": 20,
  "current_bookings": 5,
  "status": "available",
  "created_at": "2025-07-17T09:00:00.000Z",
  "updated_at": "2025-07-17T09:00:00.000Z"
}
```

### Ví dụ implementation (Node.js/Express):
```javascript
app.get('/api/departure-dates/:id', async (req, res) => {
  try {
    const departureDate = await DepartureDate.findById(req.params.id);
    if (!departureDate) {
      return res.status(404).json({ error: 'Departure date not found' });
    }
    res.json(departureDate);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## GET /api/tours/{tour_id}

### Response Format:
```json
{
  "id": "2231a82b-6b08-4835-8a33-b7e6e031b430",
  "name": "Tour du lịch Đà Lạt 4N3Đ - Trải nghiệm ngàn hoa",
  "description": "Tour khám phá thành phố ngàn hoa...",
  "location": "Đà Lạt",
  "duration": "4 ngày 3 đêm",
  "price": 5220000,
  "images": [
    {
      "id": "img1",
      "image_url": "https://example.com/dalat1.jpg",
      "is_main": true
    },
    {
      "id": "img2", 
      "image_url": "https://example.com/dalat2.jpg",
      "is_main": false
    }
  ],
  "itinerary": [...],
  "created_at": "2025-07-17T09:00:00.000Z",
  "updated_at": "2025-07-17T09:00:00.000Z"
}
```

## Lợi ích của việc này:

1. **User Experience tốt hơn**: Người dùng thấy "Khởi hành: 15/08/2025" thay vì "Departure ID: 1fa4df30-815b..."

2. **Thông tin đầy đủ**: Hiển thị thời gian tour, giá cả, ngày khởi hành rõ ràng

3. **Professional**: Trang confirmation trông chuyên nghiệp hơn với thông tin có ý nghĩa

4. **Debugging dễ hơn**: Vẫn có thể log các ID ở console để debug

## Triển khai:

1. Tạo các API endpoints trên
2. Update confirmation page sẽ tự động call các API này
3. Hiển thị thông tin text có ý nghĩa cho user
4. Vẫn giữ các ID ở background cho mục đích kỹ thuật
