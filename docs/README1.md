# User_UI - Travel Tour Booking Frontend

## 🎯 Project Status: Frontend Complete ✅

Frontend development hoàn tất và sẵn sàng cho backend integration.

### ✅ Completed Features
- **Complete booking flow** - Guest và authenticated users
- **Payment integration** - VNPay, MoMo, Bank transfer
- **Booking confirmation** - Với QR code và chi tiết đầy đủ
- **Responsive UI** - Mobile-first design với Tailwind CSS
- **Auto-detection approach** - Backend tự động phát hiện user type

### ⏳ Waiting for Backend
- Backend cần implement auto-detection logic cho guest bookings
- Chi tiết xem `docs/backend-requirements.md`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
User_UI/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking flow pages
│   ├── payment-success/   # Success confirmation
│   └── ...
├── components/            # React components
│   ├── details/           # Booking flow components
│   ├── home/              # Homepage components
│   └── ui/                # Reusable UI components
├── docs/                  # Documentation
├── tests/                 # Test files
└── services/              # API integration
```

## 🧪 Testing

```bash
# Test booking API endpoints
node tests/guest-booking-test.js

# Test payment success page UI
# Open tests/payment-success-test.html in browser
```

## 📚 Documentation

- `docs/project-status.md` - Current status và next steps
- `docs/backend-requirements.md` - Required backend changes
- `tests/` - Test files và examples

## 🛠️ Key Components

### Booking Flow
1. **Tour Selection** → `components/details/TourDetail.tsx`
2. **Booking Form** → `components/details/Booking.tsx` 
3. **Payment** → `components/details/Payment.tsx`
4. **Confirmation** → `components/details/Confirmation.tsx`

### Auto-Detection Logic
```javascript
// Guest booking - Không có user_id
const guestBooking = {
  tour_id: "...",
  guests: [...],
  // ❌ No user_id field
};

// Auth booking - Có user_id  
const authBooking = {
  ...guestBooking,
  user_id: "uuid-from-token" // ✅ Has user_id
};
```

## 🚨 Known Issues

1. **Backend auto-detection chưa implement**
   - Error: "user_id cannot be null"
   - Solution: Backend cần xử lý guest bookings

2. **Payment gateway sandbox mode**
   - Currently using test/sandbox endpoints
   - Production keys cần update khi deploy

## 🏆 Ready for Production

Frontend code đã sẵn sàng cho production deployment sau khi backend hoàn tất auto-detection logic.

---

**Contact**: Frontend team available for backend integration support
