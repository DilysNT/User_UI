// User Promo Code Management Utilities

export interface UserPromoCode {
  id: string;
  user_id: string;
  promotion_code: string;
  description: string;
  discount_amount?: number;
  discount_percentage?: number;
  minimum_booking_amount?: number;
  expiry_date: string;
  status: 'active' | 'used' | 'expired';
  created_from_booking?: string;
  created_at: string;
  used_at?: string;
}

/**
 * Generate a unique promo code for user
 */
export const generateUserPromoCode = (userId: string, type: 'completion' | 'birthday' | 'loyalty' | 'referral' = 'completion'): string => {
  const prefixes = {
    completion: 'TOUR',
    birthday: 'BIRTH',
    loyalty: 'LOYAL',
    referral: 'REF'
  };
  
  const prefix = prefixes[type];
  const userSuffix = userId.toString().slice(-2).padStart(2, '0');
  const dateSuffix = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `${prefix}${userSuffix}${dateSuffix}${random}`;
};

/**
 * Create promo code for user after completing tour
 */
export const createCompletionPromoCode = async (userId: string, bookingId: string): Promise<UserPromoCode | null> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;

    const promoCode = generateUserPromoCode(userId, 'completion');
    
    // Tạo mã giảm 10% cho lần đặt tiếp theo, tối đa 500,000₫
    const promoData = {
      user_id: userId,
      promotion_code: promoCode,
      description: 'Mã giảm giá cảm ơn sau khi hoàn thành tour',
      discount_percentage: 10,
      maximum_discount_amount: 500000,
      minimum_booking_amount: 1000000, // Đơn tối thiểu 1 triệu
      expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Hết hạn sau 90 ngày
      created_from_booking: bookingId,
      status: 'active'
    };

    const response = await fetch('http://localhost:5000/api/user-promocodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promoData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Created completion promo code:', result);
      return result.data || result;
    } else {
      console.warn('❌ Failed to create completion promo code:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating completion promo code:', error);
    return null;
  }
};

/**
 * Create birthday promo code for user
 */
export const createBirthdayPromoCode = async (userId: string): Promise<UserPromoCode | null> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;

    const promoCode = generateUserPromoCode(userId, 'birthday');
    
    // Mã giảm sinh nhật: 15% tối đa 1 triệu
    const promoData = {
      user_id: userId,
      promotion_code: promoCode,
      description: 'Mã giảm giá sinh nhật đặc biệt 🎂',
      discount_percentage: 15,
      maximum_discount_amount: 1000000,
      minimum_booking_amount: 2000000, // Đơn tối thiểu 2 triệu
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Hết hạn sau 30 ngày
      status: 'active'
    };

    const response = await fetch('http://localhost:5000/api/user-promocodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promoData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Created birthday promo code:', result);
      return result.data || result;
    } else {
      console.warn('❌ Failed to create birthday promo code:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating birthday promo code:', error);
    return null;
  }
};

/**
 * Create loyalty promo code for frequent customers
 */
export const createLoyaltyPromoCode = async (userId: string, completedToursCount: number): Promise<UserPromoCode | null> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return null;

    const promoCode = generateUserPromoCode(userId, 'loyalty');
    
    // Mã giảm theo độ trung thành: 20% cho khách VIP (>= 5 tours)
    let discountPercentage = 15;
    let maxDiscount = 1500000;
    let description = 'Mã giảm giá khách hàng thân thiết 🌟';
    
    if (completedToursCount >= 10) {
      discountPercentage = 25;
      maxDiscount = 2500000;
      description = 'Mã giảm giá khách hàng VIP Kim Cương 💎';
    } else if (completedToursCount >= 5) {
      discountPercentage = 20;
      maxDiscount = 2000000;
      description = 'Mã giảm giá khách hàng VIP Vàng 🥇';
    }
    
    const promoData = {
      user_id: userId,
      promotion_code: promoCode,
      description,
      discount_percentage: discountPercentage,
      maximum_discount_amount: maxDiscount,
      minimum_booking_amount: 3000000, // Đơn tối thiểu 3 triệu
      expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Hết hạn sau 180 ngày
      status: 'active'
    };

    const response = await fetch('http://localhost:5000/api/user-promocodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(promoData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Created loyalty promo code:', result);
      return result.data || result;
    } else {
      console.warn('❌ Failed to create loyalty promo code:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error creating loyalty promo code:', error);
    return null;
  }
};

/**
 * Check if user has any active promo codes
 */
export const getUserActivePromoCodes = async (userId: string): Promise<UserPromoCode[]> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return [];

    const response = await fetch(`http://localhost:5000/api/user-promocodes?user_id=${userId}&status=active`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
    }
  } catch (error) {
    console.error('Error fetching user promo codes:', error);
  }
  return [];
};

/**
 * Mark promo code as used
 */
export const markPromoCodeAsUsed = async (promoCodeId: string, bookingId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return false;

    const response = await fetch(`http://localhost:5000/api/user-promocodes/${promoCodeId}/use`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        booking_id: bookingId,
        used_at: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error marking promo code as used:', error);
    return false;
  }
};

/**
 * Auto-create promo code after tour completion
 */
export const handleTourCompletionReward = async (userId: string, bookingId: string): Promise<void> => {
  try {
    console.log('🎁 Processing tour completion reward for user:', userId);
    
    // 1. Tạo mã giảm giá cảm ơn
    const completionPromo = await createCompletionPromoCode(userId, bookingId);
    
    if (completionPromo) {
      console.log('✅ Created completion promo code:', completionPromo.promotion_code);
      
      // 2. Kiểm tra số tour đã hoàn thành để tạo mã loyalty nếu đủ điều kiện
      const completedBookings = await fetch(`http://localhost:5000/api/bookings?user_id=${userId}&status=completed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        }
      }).then(res => res.json());
      
      const completedCount = Array.isArray(completedBookings.data) ? completedBookings.data.length : 0;
      
      // Tạo mã loyalty cho khách hàng thân thiết (mỗi 5 tour)
      if (completedCount > 0 && completedCount % 5 === 0) {
        const loyaltyPromo = await createLoyaltyPromoCode(userId, completedCount);
        if (loyaltyPromo) {
          console.log('🌟 Created loyalty promo code:', loyaltyPromo.promotion_code);
        }
      }
      
      // Thông báo cho user
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert(`🎉 Cảm ơn bạn đã hoàn thành tour! Bạn nhận được mã giảm giá: ${completionPromo.promotion_code} (Giảm 10% cho lần đặt tiếp theo)`);
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error processing tour completion reward:', error);
  }
};

/**
 * Format promo code display
 */
export const formatPromoCode = (promoCode: UserPromoCode): string => {
  if (promoCode.discount_amount) {
    return `Giảm ${promoCode.discount_amount.toLocaleString('vi-VN')}₫`;
  } else if (promoCode.discount_percentage) {
    return `Giảm ${promoCode.discount_percentage}%`;
  }
  return 'Mã giảm giá';
};

/**
 * Check if promo code is still valid
 */
export const isPromoCodeValid = (promoCode: UserPromoCode): boolean => {
  if (promoCode.status !== 'active') return false;
  
  const now = new Date();
  const expiryDate = new Date(promoCode.expiry_date);
  
  return now < expiryDate;
};
