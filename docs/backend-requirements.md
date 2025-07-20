# Backend Requirements - Guest Booking Auto-Detection

## Current Status
❌ **Backend chưa implement auto-detection logic**

Frontend đã sẵn sàng, nhưng backend vẫn đang expect `user_id` field trong booking payload.

## Required Backend Changes

### 1. API Endpoint: `POST /api/bookings`

**Current Behavior:**
- Requires `user_id` field trong request body
- Throws error: "notNull Violation: Booking.user_id cannot be null"

**Required Behavior:**
```javascript
// Detect user type từ request headers và payload
if (req.headers.authorization) {
  // Authenticated user - extract user_id từ JWT token
  const user_id = extractUserFromToken(req.headers.authorization);
  // Use user_id từ token hoặc payload
} else {
  // Guest user - auto-create guest user
  const guestUser = await createGuestUser(guests[0]);
  user_id = guestUser.id;
}
```

### 2. Guest User Creation Logic

Khi không có Authorization header:
1. Lấy thông tin từ `guests[0]` (người đặt tour)
2. Tạo guest user record:
```sql
INSERT INTO users (id, name, email, user_type, created_at) 
VALUES (uuid(), guests[0].name, guests[0].email, 'guest', NOW())
```

### 3. Booking Creation

Luôn luôn có `user_id` cho mọi booking:
```sql
INSERT INTO bookings (id, tour_id, user_id, ...) 
VALUES (uuid(), tour_id, user_id, ...)
```

## Implementation Example

```javascript
// Backend controller: POST /api/bookings
const createBooking = async (req, res) => {
  let user_id;
  
  if (req.headers.authorization) {
    // Authenticated booking
    user_id = getUserIdFromToken(req.headers.authorization);
    console.log('Authenticated booking for user:', user_id);
  } else {
    // Guest booking - auto-create guest user
    const guestInfo = req.body.guests[0];
    const guestUser = await User.create({
      id: uuid(),
      name: guestInfo.name,
      email: guestInfo.email,
      user_type: 'guest'
    });
    user_id = guestUser.id;
    console.log('Guest booking - created user:', user_id);
  }
  
  // Create booking với user_id
  const booking = await Booking.create({
    ...req.body,
    user_id: user_id
  });
  
  res.json({ success: true, data: booking });
};
```

## Frontend is Ready ✅

Frontend đã implement đúng auto-detection approach:
- Guest bookings: Không gửi `user_id`, không có Authorization header
- Auth bookings: Gửi `user_id`, có Authorization header

## Next Steps
1. Backend team implement auto-detection logic
2. Test với frontend booking flow
3. Verify guest user creation works correctly
