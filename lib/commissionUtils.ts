// Commission tracking utilities

export interface CommissionData {
  bookingId: string;
  agencyId: string;
  tourPrice: number;
  commissionRate: number;
  commissionAmount: number;
  calculatedAt: string;
}

export interface CommissionPreview {
  commission_rate: number;
  admin_commission: number;
  agency_amount: number;
  original_price: number;
}

/**
 * Tính toán preview phí VAT trước khi booking
 */
export const calculateCommissionPreview = async (
  agencyId: string, 
  tourPrice: number
): Promise<CommissionPreview | null> => {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/commissions/preview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` 
      },
      body: JSON.stringify({
        agency_id: agencyId,
        tour_price: tourPrice
      })
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to calculate commission preview:', error);
  }
  return null;
};

/**
 * Tính toán phí VAT sau khi booking thành công
 */
export const calculateBookingCommission = async (bookingId: string): Promise<CommissionData | null> => {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/commissions/calculate/${bookingId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` 
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      return {
        bookingId,
        agencyId: result.agency_id,
        tourPrice: result.original_price,
        commissionRate: result.commission_rate,
        commissionAmount: result.agency_amount,
        calculatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.warn('Failed to calculate commission:', error);
  }
  return null;
};

/**
 * Lấy thông tin agency từ referral code
 */
export const getAgencyFromReferralCode = async (referralCode: string): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:5000/api/agencies/by-referral/${referralCode}`, {
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` 
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to get agency from referral code:', error);
  }
  return null;
};

/**
 * Lưu commission tracking vào localStorage
 */
export const saveCommissionTracking = (commissionData: CommissionData): void => {
  try {
    const existingData = JSON.parse(localStorage.getItem('commission_tracking') || '[]');
    existingData.push(commissionData);
    localStorage.setItem('commission_tracking', JSON.stringify(existingData));
  } catch (error) {
    console.warn('Failed to save commission tracking:', error);
  }
};

/**
 * Lấy commission tracking từ localStorage
 */
export const getCommissionTracking = (): CommissionData[] => {
  try {
    return JSON.parse(localStorage.getItem('commission_tracking') || '[]');
  } catch (error) {
    console.warn('Failed to get commission tracking:', error);
    return [];
  }
};

/**
 * Format số tiền VND
 */
export const formatVND = (amount: number): string => {
  return amount.toLocaleString("vi-VN") + '₫';
};

/**
 * Format phần trăm
 */
export const formatPercent = (rate: number): string => {
  return rate.toFixed(1) + '%';
};

/**
 * Tính toán giảm giá chính xác
 */
export const calculateDiscount = (originalPrice: number, discountPercent: number): number => {
  // Đảm bảo discountPercent là phần trăm (0-100), không phải decimal (0-1)
  const normalizedPercent = discountPercent > 1 ? discountPercent : discountPercent * 100;
  const discountAmount = (originalPrice * normalizedPercent) / 100;
  return Math.round(discountAmount); // Làm tròn để tránh số lẻ
};

/**
 * Validate và fix discount calculation
 */
export const validateDiscountCalculation = (
  originalPrice: number, 
  discountAmount: number, 
  expectedPercent: number
): { isValid: boolean; correctedAmount: number; actualPercent: number } => {
  const actualPercent = (discountAmount / originalPrice) * 100;
  const correctedAmount = calculateDiscount(originalPrice, expectedPercent);
  
  console.log('Discount validation:', {
    originalPrice,
    discountAmount,
    expectedPercent,
    actualPercent: actualPercent.toFixed(2) + '%',
    correctedAmount,
    isValid: Math.abs(actualPercent - expectedPercent) < 0.01 // Tolerance của 0.01%
  });
  
  return {
    isValid: Math.abs(actualPercent - expectedPercent) < 0.01,
    correctedAmount,
    actualPercent
  };
};

/**
 * Debug promotion response từ API
 */
export const debugPromotionResponse = (response: any, originalPrice: number): void => {
  console.group('🔍 Promotion Debug');
  console.log('API Response:', response);
  console.log('Original Price:', formatVND(originalPrice));
  
  if (response.pricing) {
    console.log('Pricing Data:', response.pricing);
    console.log('Discount Amount from API:', formatVND(response.pricing.discount_amount || 0));
    console.log('Final Price from API:', formatVND(response.pricing.final_price || 0));
    
    const discountAmount = response.pricing.discount_amount || 0;
    const actualPercent = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
    console.log('Calculated Percent:', actualPercent.toFixed(2) + '%');
    
    // Kiểm tra nếu có vấn đề với tính toán
    if (discountAmount < 100 && originalPrice > 1000000) {
      console.warn('⚠️ Potential calculation error detected!');
      console.warn('Discount amount seems too small for large price');
    }
  }
  
  if (response.promotion) {
    console.log('Promotion Data:', response.promotion);
  }
  
  console.groupEnd();
};

/**
 * Tính toán booking data theo logic backend mới
 */
export const calculateBookingData = (
  tourPrice: number, 
  adults: number, 
  children: number,
  finalPrice?: number | null,
  discountAmount?: number
) => {
  // Backend logic: original_price = tour.price * (adults + children)
  const original_price = tourPrice * (adults + children);
  
  // Nếu có finalPrice thì dùng, không thì dùng original_price - discountAmount
  const total_price = finalPrice !== null && finalPrice !== undefined 
    ? finalPrice 
    : original_price - (discountAmount || 0);
  
  // Backend sẽ tự tính: discount_amount = original_price - total_price
  const calculated_discount = original_price - total_price;
  
  console.group('📊 Booking Calculation');
  console.log('Input params:', {
    tourPrice: formatVND(tourPrice),
    adults,
    children,
    totalPeople: adults + children,
    finalPrice: finalPrice !== null ? formatVND(finalPrice || 0) : 'null',
    discountAmount: formatVND(discountAmount || 0)
  });
  console.log('Calculated values:', {
    original_price: formatVND(original_price),
    total_price: formatVND(total_price),
    calculated_discount: formatVND(calculated_discount),
    discount_percentage: original_price > 0 ? ((calculated_discount / original_price) * 100).toFixed(2) + '%' : '0%'
  });
  console.groupEnd();
  
  return {
    original_price,
    total_price,
    calculated_discount
  };
};

/**
 * Validate pricing data trước khi gửi backend
 */
export const validatePricingData = (
  original_price: number,
  total_price: number,
  expected_discount?: number
) => {
  const calculated_discount = original_price - total_price;
  const issues: string[] = [];
  
  if (total_price > original_price) {
    issues.push('Total price cannot be greater than original price');
  }
  
  if (total_price < 0) {
    issues.push('Total price cannot be negative');
  }
  
  if (expected_discount && Math.abs(calculated_discount - expected_discount) > 1) {
    issues.push(`Discount mismatch: expected ${formatVND(expected_discount)}, got ${formatVND(calculated_discount)}`);
  }
  
  const isValid = issues.length === 0;
  
  if (!isValid) {
    console.warn('❌ Pricing validation failed:', issues);
  } else {
    console.log('✅ Pricing validation passed');
  }
  
  return {
    isValid,
    issues,
    calculated_discount,
    discount_percentage: original_price > 0 ? (calculated_discount / original_price) * 100 : 0
  };
};
