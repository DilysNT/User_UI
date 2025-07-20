// Guest Booking Test - Updated for current backend status
// Run: node tests/guest-booking-test.js

const testGuestBooking = async () => {
  console.log('🧪 Testing Guest Booking Auto-Detection');
  
  const guestPayload = {
    tour_id: "test-tour-id",
    departure_date_id: "test-departure-id", 
    number_of_adults: 2,
    number_of_children: 0,
    total_price: 2900000,
    guests: [
      {
        name: "Nguyễn Văn Test",
        email: "test@guest.com",
        phone: "0123456789",
        cccd: "123456789012"
      }
    ]
    // ❌ No user_id field - Backend should auto-detect
  };

  console.log('📦 Guest Payload:', JSON.stringify(guestPayload, null, 2));

  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // ❌ No Authorization header - Guest booking
      },
      body: JSON.stringify(guestPayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS - Guest booking worked!');
      console.log('Result:', result);
      return true;
    } else {
      console.log('❌ FAILED - Backend error:');
      console.log('Status:', response.status);
      console.log('Error:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    return false;
  }
};

const testAuthenticatedBooking = async () => {
  console.log('\n🧪 Testing Authenticated Booking');
  
  const authPayload = {
    tour_id: "test-tour-id",
    departure_date_id: "test-departure-id",
    user_id: "test-user-uuid",
    number_of_adults: 2,
    number_of_children: 0,
    total_price: 2900000,
    guests: [
      {
        name: "Nguyễn Văn Auth",
        email: "auth@user.com", 
        phone: "0987654321",
        cccd: "987654321098"
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-test-token'
      },
      body: JSON.stringify(authPayload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS - Auth booking worked!');
      return true;
    } else {
      console.log('❌ FAILED - Auth booking error:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🔍 BOOKING API TESTS');
  console.log('====================');
  
  const guestResult = await testGuestBooking();
  const authResult = await testAuthenticatedBooking();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Guest Booking: ${guestResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth Booking:  ${authResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!guestResult) {
    console.log('\n💡 Guest booking failed - Backend needs auto-detection implementation');
  }
};

runTests();
