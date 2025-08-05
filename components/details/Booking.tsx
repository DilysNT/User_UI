"use client";

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Separator } from "../../components/ui/separator"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Checkbox } from "../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Star, Clock, MapPin, Calendar, ChevronLeft, CheckCircle, X } from "lucide-react"
import Footer from "@/components/home/footer"
import VATInfo from "./VATInfo"
import { 
  calculateCommissionPreview, 
  calculateBookingCommission, 
  saveCommissionTracking, 
  formatVND,
  calculateDiscount,
  validateDiscountCalculation,
  debugPromotionResponse,
  calculateBookingData,
  validatePricingData
} from '@/lib/commissionUtils';

export default function Booking({ params }: { params: { id: string } }) {
  // Đặt tất cả các hook lên đầu function
  const [tourData, setTourData] = useState<any>(null);
  const [departureDates, setDepartureDates] = useState<any[]>([]);
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoDescription, setPromoDescription] = useState("");
  const [promotionId, setPromotionId] = useState<string | null>(null);
  const [originalPrice, setOriginalPrice] = useState<number | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [showPromoSuccess, setShowPromoSuccess] = useState(false);
  const [promoSuccessData, setPromoSuccessData] = useState<{
    code: string;
    original: number;
    discount: number;
    final: number;
  } | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  type FormData = {
    contactInfo: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
    };
    participants: Array<{
      fullName: string;
      phone: string;
      gender: string;
      birthYear: string;
      idNumber: string;
    }>;
    specialRequests: string;
    agreeToTerms: boolean;
  };
  const [formData, setFormData] = useState<FormData>({
    contactInfo: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
    participants: [
      {
        fullName: "",
        phone: "",
        gender: "male",
        birthYear: "1990",
        idNumber: "",
      },
    ],
    specialRequests: "",
    agreeToTerms: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const selectedTour = JSON.parse(localStorage.getItem('selectedTour') || '{}');
        console.log('Selected tour from localStorage:', selectedTour); // Debug log
        setTourData(selectedTour && Object.keys(selectedTour).length > 0 ? selectedTour : {
          id: params.id,
          name: "Tour du lịch",
          price: 0,
          departure_date_id: '',
          departure_date_value: '',
          adults: 1,
          children: 0,
          location: '',
          departure_location: '',
          tour_categories: '',
          duration: '4N3Đ',
          image: '/placeholder.svg',
          agency_id: null,
          referral_code: null,
        });

        // Load saved form data from localStorage
        const savedFormData = localStorage.getItem('bookingFormData');
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData);
            setFormData(parsedFormData);
            setHasSavedData(true);
            console.log('✅ Loaded saved form data');
          } catch (error) {
            console.warn('Failed to parse saved form data:', error);
          }
        }

        // Load saved promo code data
        const savedPromoData = localStorage.getItem('bookingPromoData');
        if (savedPromoData) {
          try {
            const parsedPromoData = JSON.parse(savedPromoData);
            setPromoCode(parsedPromoData.promoCode || '');
            setPromoDescription(parsedPromoData.promoDescription || '');
            setDiscountAmount(parsedPromoData.discountAmount || 0);
            setPromotionId(parsedPromoData.promotionId || null);
            setOriginalPrice(parsedPromoData.originalPrice || null);
            setFinalPrice(parsedPromoData.finalPrice || null);
            setHasSavedData(true);
            console.log('✅ Loaded saved promo data');
          } catch (error) {
            console.warn('Failed to parse saved promo data:', error);
          }
        }

        // Check if user is logged in - Kiểm tra cả 2 tên token có thể có
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        setIsUserLoggedIn(!!authToken);
        console.log('🔐 Auth check:', { 
          hasAuthToken: !!localStorage.getItem('authToken'),
          hasToken: !!localStorage.getItem('token'),
          isUserLoggedIn: !!authToken 
        });

        // Auto-apply promo code from public promo section
        const copiedPromoCode = localStorage.getItem('copiedPromoCode');
        if (copiedPromoCode && !promoCode) {
          console.log('🎫 Auto-applying copied promo code:', copiedPromoCode);
          setPromoCode(copiedPromoCode);
          // Clear the stored promo code to prevent re-applying
          localStorage.removeItem('copiedPromoCode');
          // Auto-apply the promo code
          setTimeout(() => {
            handleApplyPromo(copiedPromoCode);
          }, 1000);
        }

      } catch {
        setTourData({
          id: params.id,
          name: "Tour du lịch",
          price: 0,
          departure_date_id: '',
          departure_date_value: '',
          adults: 1,
          children: 0,
          location: '',
          departure_location: '',
          tour_categories: '',
          duration: '4N3Đ',
          image: '/placeholder.svg',
          agency_id: null,
          referral_code: null,
        });
      }
    }
  }, [params.id]);

  // Theo dõi thay đổi authentication status trong thời gian thực
  useEffect(() => {
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const newLoginStatus = !!authToken;
      
      if (newLoginStatus !== isUserLoggedIn) {
        setIsUserLoggedIn(newLoginStatus);
        console.log('🔄 Auth status changed:', { 
          from: isUserLoggedIn, 
          to: newLoginStatus,
          token: authToken ? 'exists' : 'missing'
        });
      }
    };

    // Kiểm tra ngay lập tức
    checkAuthStatus();

    // Lắng nghe sự kiện storage để phát hiện thay đổi từ tab khác
    window.addEventListener('storage', checkAuthStatus);
    
    // Kiểm tra định kỳ mỗi 2 giây (fallback)
    const interval = setInterval(checkAuthStatus, 2000);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      clearInterval(interval);
    };
  }, [isUserLoggedIn]);

  // Fetch user info khi đã đăng nhập để tự động fill form
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!isUserLoggedIn) {
        setUserInfo(null);
        return;
      }

      setLoadingUserInfo(true);
      try {
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!authToken) return;

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user || data;
          setUserInfo(user);
          
          console.log('✅ Fetched user info:', user);
          
          // Tự động fill thông tin liên hệ từ thông tin tài khoản
          setFormData(prev => ({
            ...prev,
            contactInfo: {
              fullName: user.name || user.username || "",
              email: user.email || "",
              phone: prev.contactInfo.phone, // Giữ nguyên phone nếu đã nhập
              address: prev.contactInfo.address, // Giữ nguyên CCCD nếu đã nhập
            }
          }));
          
        } else {
          console.warn('❌ Failed to fetch user info:', response.status);
          setUserInfo(null);
        }
      } catch (error) {
        console.error('❌ Error fetching user info:', error);
        setUserInfo(null);
      } finally {
        setLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, [isUserLoggedIn]);

  useEffect(() => {
    if (!tourData || !tourData.id) return;
    fetch(`http://localhost:5000/api/departure-dates?tour_id=${tourData.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartureDates(data);
        else if (data && Array.isArray(data.departureDates)) setDepartureDates(data.departureDates);
        else setDepartureDates([]);
      })
      .catch(() => setDepartureDates([]));
  }, [tourData]);

  // Auto-populate participant info when there's only 1 participant
  useEffect(() => {
    if (formData.participants.length === 1 && 
        (formData.contactInfo.fullName || formData.contactInfo.phone)) {
      const participant = formData.participants[0];
      
      // Only auto-populate if participant fields are empty
      if (!participant.fullName || !participant.phone) {
        const updatedParticipants = [...formData.participants];
        updatedParticipants[0] = {
          ...participant,
          fullName: participant.fullName || formData.contactInfo.fullName,
          phone: participant.phone || formData.contactInfo.phone,
        };
        
        const newFormData = {
          ...formData,
          participants: updatedParticipants,
        };
        
        setFormData(newFormData);
        saveFormDataToStorage(newFormData);
      }
    }
  }, [formData.contactInfo.fullName, formData.contactInfo.phone, formData.participants.length]);

  // Auto-save promo data when it changes
  useEffect(() => {
    if (promoCode || discountAmount > 0) {
      savePromoDataToStorage();
    }
  }, [promoCode, promoDescription, discountAmount, promotionId, originalPrice, finalPrice]);

  // Sau khi khai báo hook, mới kiểm tra dữ liệu
  if (!tourData) return null;

  // Helper để tạo UUID (nếu chưa có)
  function generateUUID() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    // Polyfill
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handleInputChange = <T extends keyof FormData>(
    section: T,
    field: T extends "contactInfo" ? keyof FormData["contactInfo"] : never,
    value: string
  ) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...(formData[section] as object),
        [field]: value,
      },
    };
    
    // Auto-populate participant info from contact info when only 1 participant
    if (section === "contactInfo" && formData.participants.length === 1) {
      const updatedParticipants = [...newFormData.participants];
      if (field === "fullName" && value.trim()) {
        updatedParticipants[0] = {
          ...updatedParticipants[0],
          fullName: value,
        };
      } else if (field === "phone" && value.trim()) {
        updatedParticipants[0] = {
          ...updatedParticipants[0],
          phone: value,
        };
      } else if (field === "address" && value.trim()) {
        // Đồng bộ số CCCD sang participant đầu tiên nếu chưa có
        if (!updatedParticipants[0].idNumber) {
          updatedParticipants[0] = {
            ...updatedParticipants[0],
            idNumber: value,
          };
        }
      }
      newFormData.participants = updatedParticipants;
    }
    
    setFormData(newFormData);
    saveFormDataToStorage(newFormData);
  }

  const handleParticipantChange = (index: number, field: string, value: string) => {
    const updatedParticipants = [...formData.participants]
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      [field]: value,
    }
    const newFormData = {
      ...formData,
      participants: updatedParticipants,
    };
    setFormData(newFormData);
    saveFormDataToStorage(newFormData);
  }

  const addParticipant = () => {
    const newFormData = {
      ...formData,
      participants: [
        ...formData.participants,
        {
          fullName: "",
          phone: "",
          gender: "male",
          birthYear: "1990",
          idNumber: "",
        },
      ],
    };
    setFormData(newFormData);
    saveFormDataToStorage(newFormData);
  }

  const removeParticipant = (index: number) => {
    if (formData.participants.length > 1) {
      const updatedParticipants = [...formData.participants]
      updatedParticipants.splice(index, 1)
      
      // Auto-populate the remaining participant with contact info if only 1 left
      if (updatedParticipants.length === 1) {
        updatedParticipants[0] = {
          ...updatedParticipants[0],
          fullName: formData.contactInfo.fullName || updatedParticipants[0].fullName,
          phone: formData.contactInfo.phone || updatedParticipants[0].phone,
        };
      }
      
      const newFormData = {
        ...formData,
        participants: updatedParticipants,
      };
      setFormData(newFormData);
      saveFormDataToStorage(newFormData);
    }
  }

  const clearPromoCode = () => {
    setPromoCode("");
    setPromoError("");
    setPromoDescription("");
    setPromotionId(null);
    setOriginalPrice(null);
    setFinalPrice(null);
    setDiscountAmount(0);
    setShowPromoSuccess(false);
    setPromoSuccessData(null);
    
    // Clear saved promo data
    localStorage.removeItem('bookingPromoData');
    console.log('🧹 Promo code cleared');
  };

  // Save form data to localStorage whenever it changes
  const saveFormDataToStorage = (newFormData: FormData) => {
    try {
      localStorage.setItem('bookingFormData', JSON.stringify(newFormData));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  };

  // Save promo data to localStorage
  const savePromoDataToStorage = () => {
    try {
      const promoData = {
        promoCode,
        promoDescription,
        discountAmount,
        promotionId,
        originalPrice,
        finalPrice
      };
      localStorage.setItem('bookingPromoData', JSON.stringify(promoData));
    } catch (error) {
      console.warn('Failed to save promo data:', error);
    }
  };

  // Clear all saved data
  const clearAllSavedData = () => {
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('bookingPromoData');
    
    // Reset form to initial state
    setFormData({
      contactInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
      },
      participants: [
        {
          fullName: "",
          phone: "",
          gender: "male",
          birthYear: "1990",
          idNumber: "",
        },
      ],
      specialRequests: "",
      agreeToTerms: false,
    });
    
    clearPromoCode();
    setHasSavedData(false);
    console.log('🧹 All saved data cleared');
  };

  const handleApplyPromo = async (codeToApply?: string) => {
    const codeToUse = codeToApply || promoCode;
    setPromoError("");
    setPromoDescription("");
    setPromotionId(null);
    setOriginalPrice(null);
    setFinalPrice(null);
    
    if (!codeToUse.trim()) {
      setPromoError("Vui lòng nhập mã giảm giá.");
      return;
    }
    
    // Kiểm tra đăng nhập trước khi apply mã giảm giá
    if (!isUserLoggedIn) {
      setPromoError("Bạn cần đăng nhập để sử dụng mã giảm giá!");
      return;
    }
    
    try {
      // Tính giá gốc theo logic mới: người lớn full price, trẻ em 50% price
      const adultPrice = tourData.price * tourData.adults;
      const childPrice = tourData.price * 0.5 * tourData.children;
      const price = adultPrice + childPrice;
      
      console.log('🧮 Calculating promo for price:', price.toLocaleString("vi-VN") + '₫');
      console.log('📊 Price breakdown:', {
        tourPrice: tourData.price.toLocaleString("vi-VN") + '₫',
        adults: tourData.adults,
        children: tourData.children,
        adultTotalPrice: adultPrice.toLocaleString("vi-VN") + '₫',
        childTotalPrice: childPrice.toLocaleString("vi-VN") + '₫',
        childPricePerPerson: (tourData.price * 0.5).toLocaleString("vi-VN") + '₫ (50% giảm)',
        totalPrice: price.toLocaleString("vi-VN") + '₫'
      });
      
      const res = await fetch("http://localhost:5000/api/bookings/validate-promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotion_code: codeToUse.trim(), tour_price: price }),
      });
      
      let data: any = null;
      if (!res.ok) {
        // Nếu backend trả về message cụ thể, hiển thị cho user
        data = await res.json().catch(() => ({}));
        if (data && typeof data === 'object' && 'message' in data) {
          setPromoError(data.message);
        } else {
          setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        }
        setDiscountAmount(0);
        setPromotionId(null);
        setOriginalPrice(null);
        setFinalPrice(null);
        return;
      }
      data = await res.json();
      if (!data) {
        setPromoError("Không thể kiểm tra mã giảm giá. Vui lòng thử lại.");
        setDiscountAmount(0);
        setPromotionId(null);
        setOriginalPrice(null);
        setFinalPrice(null);
        return;
      }
      
      // Debug API response chi tiết
      console.group('🔍 Promotion API Response Debug');
      console.log('Full API Response:', data);
      if (data && typeof data === 'object') {
        console.log('Promotion Object:', data.promotion);
        console.log('Pricing Object:', data.pricing);
        console.log('Code:', data.promotion?.code);
        console.log('Fixed Discount Amount:', data.promotion?.discount_amount);
        console.log('Discount Percentage:', data.promotion?.discount_percentage);
      }
      console.groupEnd();
      if (!data || !data.valid) {
        setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        setDiscountAmount(0);
        setPromotionId(null);
        setOriginalPrice(null);
        setFinalPrice(null);
        return;
      }
      let discountAmount = data.pricing && data.pricing.discount_amount ? data.pricing.discount_amount : 0;
      // 🔧 LOGIC MỚI: Ưu tiên discount_amount cố định trước, sau đó mới tính từ percentage
      if (data.promotion) {
        // Kiểm tra xem có phải mã giảm cố định không (như JULY2507)
        const hasFixedDiscount = data.promotion.discount_amount && Number(data.promotion.discount_amount) > 0;
        if (hasFixedDiscount) {
          // Mã giảm cố định như JULY2507
          discountAmount = Number(data.promotion.discount_amount);
          console.log('🎯 Fixed discount applied:', {
            code: data.promotion.code,
            fixedAmount: discountAmount.toLocaleString("vi-VN") + '₫'
          });
        } else if (data.promotion.discount_percentage) {
          // Mã giảm theo phần trăm như SUMMER2025
          const expectedPercent = data.promotion.discount_percentage;
          const expectedDiscount = calculateDiscount(price, expectedPercent);
          console.log('🔍 Percentage Discount Analysis:', {
            apiDiscount: discountAmount,
            expectedPercent: expectedPercent + '%',
            expectedDiscount: expectedDiscount.toLocaleString("vi-VN") + '₫',
            shouldOverride: Math.abs(discountAmount - expectedDiscount) > 100
          });
          // Override nếu chênh lệch quá lớn (> 100₫)
          if (Math.abs(discountAmount - expectedDiscount) > 100) {
            console.warn('⚠️ API discount mismatch, overriding with calculated amount');
            discountAmount = expectedDiscount;
          }
        }
      }
      // Đảm bảo discount amount không vượt quá giá gốc
      discountAmount = Math.min(discountAmount, price);
      setDiscountAmount(discountAmount);
      setPromoDescription(data.promotion && data.promotion.description ? data.promotion.description : "");
      setPromotionId(data.promotion && data.promotion.id ? data.promotion.id : null);
      setOriginalPrice(data.pricing && data.pricing.original_price ? data.pricing.original_price : price);
      // Tính finalPrice theo logic backend mới: original_price - discountAmount
      const calculatedFinalPrice = (data.pricing && data.pricing.original_price ? data.pricing.original_price : price) - discountAmount;
      setFinalPrice(calculatedFinalPrice);
      setPromoError("");
      console.log('✅ Promo applied:', {
        code: promoCode,
        originalPrice: (data.pricing && data.pricing.original_price ? data.pricing.original_price : price).toLocaleString("vi-VN") + '₫',
        discount: discountAmount.toLocaleString("vi-VN") + '₫',
        finalPrice: calculatedFinalPrice.toLocaleString("vi-VN") + '₫'
      });
      // Show success notification
      setPromoSuccessData({
        code: promoCode,
        original: price,
        discount: discountAmount,
        final: calculatedFinalPrice
      });
      setShowPromoSuccess(true);
      // Auto hide after 5 seconds
      setTimeout(() => {
        setShowPromoSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Promo application error:', error);
      setPromoError("Không thể kiểm tra mã giảm giá. Vui lòng thử lại.");
      setDiscountAmount(0);
      setPromotionId(null);
      setOriginalPrice(null);
      setFinalPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourData.departure_date_id) {
      alert("Vui lòng chọn ngày khởi hành ở trang chi tiết tour trước khi đặt!");
      return;
    }

    // Validation cho user đã đăng nhập
    if (isUserLoggedIn && !userInfo) {
      alert("Đang tải thông tin tài khoản. Vui lòng đợi một chút!");
      return;
    }

    if (isUserLoggedIn && userInfo && !userInfo.id) {
      alert("Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      console.group('🚀 Starting Payment-First Booking Process');
      console.log('User Type:', isUserLoggedIn ? 'AUTHENTICATED_USER' : 'GUEST_USER');
      console.log('User Info:', isUserLoggedIn ? userInfo : 'N/A (Guest)');

      // 1. Chuẩn bị contact info - sử dụng userInfo nếu đã đăng nhập
      const contactInfo = isUserLoggedIn && userInfo ? {
        fullName: userInfo.name || userInfo.username || formData.contactInfo.fullName,
        email: userInfo.email,
        phone: formData.contactInfo.phone,
        address: formData.contactInfo.address,
      } : formData.contactInfo;

      console.log('📧 Contact info for booking:', contactInfo);

      // 2. Chuẩn bị guests list
      const guests = [
        {
          name: contactInfo.fullName,
          phone: contactInfo.phone,
          email: contactInfo.email,
          cccd: contactInfo.address,
        }
      ];

      // Thêm participants nếu có
      if (formData.participants && formData.participants.length > 0) {
        formData.participants.forEach((p, idx) => {
          if (idx === 0) return; // Bỏ qua người đại diện đã có
          guests.push({
            name: p.fullName,
            phone: p.phone,
            email: contactInfo.email,
            cccd: p.idNumber,
          });
        });
      }

      // 3. Tính toán giá trực tiếp để đảm bảo chính xác
      const calculatedOriginalPrice = tourData.price * (tourData.adults || 1) + (tourData.price * 0.7 * (tourData.children || 0));
      const calculatedTotalPrice = calculatedOriginalPrice - discountAmount;

      console.log('💰 Booking pricing calculation:', {
        tourPrice: tourData.price,
        adults: tourData.adults,
        children: tourData.children,
        discountAmount: discountAmount,
        calculatedOriginalPrice: calculatedOriginalPrice,
        calculatedTotalPrice: calculatedTotalPrice
      });

      // 4. Lấy user_id từ JWT token (ưu tiên lấy từ token, fallback guest)
      // Luôn ưu tiên lấy user_id từ userInfo nếu đã đăng nhập thành công
      // Nếu không có userInfo thì mới fallback sang JWT hoặc guest
      let bookingUserId = '3ca8bb89-a406-4deb-96a7-dab4d9be3cc1'; // default guest id, chỉ dùng khi không login
      let bookingUserType = 'GUEST_USER';
      if (isUserLoggedIn && userInfo && userInfo.id) {
        if (typeof userInfo.id === 'string' && userInfo.id.length > 10) {
          bookingUserId = userInfo.id;
          bookingUserType = 'AUTHENTICATED_USER';
          console.log('✅ Using user_id from userInfo:', bookingUserId, userInfo);
        } else {
          console.warn('⚠️ userInfo.id không hợp lệ:', userInfo);
        }
      } else {
        // Fallback: lấy từ JWT token nếu có
        let debugToken: string | null = null;
        if (typeof window !== 'undefined') {
          debugToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        }
        if (debugToken) {
          try {
            const payload = JSON.parse(atob(debugToken.split('.')[1]));
            if (payload && payload.id) {
              bookingUserId = payload.id;
              bookingUserType = 'AUTHENTICATED_USER';
              console.log('✅ Using user_id from JWT:', bookingUserId);
            } else {
              console.warn('⚠️ JWT payload has no id, using guest id');
            }
          } catch (err) {
            console.warn('JWT decode failed, fallback to guest id', err);
          }
        } else {
          console.warn('⚠️ No JWT token found, using guest id');
        }
      }

      // 5. Chuẩn bị PENDING booking data (chưa tạo booking record)
      const pendingBookingData = {
        tour_id: tourData.id,
        departure_date_id: tourData.departure_date_id,
        number_of_adults: tourData.adults || 1,
        number_of_children: tourData.children || 0,
        number_of_guests: guests.length,
        guests: guests,
        special_requests: formData.specialRequests || null,
        status: 'pending', // Pending cho đến khi thanh toán thành công
        // Pricing info
        original_price: calculatedOriginalPrice,
        total_price: calculatedTotalPrice,
        discount_amount: discountAmount,
        promotion_id: promotionId,
        // User info
        user_id: bookingUserId,
        user_type: bookingUserType
      };
      console.log('🚩 Booking user_id sent:', bookingUserId, 'user_type:', bookingUserType);

      // 6. Chuẩn bị data cho Payment page (sử dụng lại giá đã tính)
      const paymentData = {
        tour: {
          ...tourData,
          original_price: calculatedOriginalPrice,
          total_price: calculatedTotalPrice,
          discount_amount: discountAmount,
          promotion_id: promotionId,
          promo_description: promoDescription,
          // Đảm bảo có đủ thông tin hiển thị
          price: tourData.price,
          adults: tourData.adults || 1,
          children: tourData.children || 0
        },
        pendingBooking: pendingBookingData,
        isUserLoggedIn,
        userInfo,
        authToken: typeof window !== 'undefined' ? 
          (localStorage.getItem('authToken') || localStorage.getItem('token')) : null
      };

      // 7. Lưu vào localStorage để Payment page sử dụng - LƯU NHIỀU NƠI
      localStorage.setItem("paymentData", JSON.stringify(paymentData));
      localStorage.setItem("pendingPayment", JSON.stringify(paymentData)); // Backup key

      // Lưu riêng pendingBooking để payment-success có thể dùng
      localStorage.setItem("pendingBookingData", JSON.stringify(pendingBookingData));

      // Update selectedTour với thông tin booking để fallback
      const updatedTourData = {
        ...tourData,
        booking_prepared: true,
        booking_timestamp: Date.now(),
        total_calculated_price: calculatedTotalPrice,
        discount_applied: discountAmount
      };
      localStorage.setItem("selectedTour", JSON.stringify(updatedTourData));

      // Clear form data
      localStorage.removeItem('bookingFormData');
      localStorage.removeItem('bookingPromoData');
      console.log('🧹 Saved payment data, cleared form data');

      // 8. Chuyển hướng tới payment TRƯỚC KHI TẠO BOOKING
      router.push(`/tour/${tourData.id}/payment`);

      console.log('🎯 Redirected to payment page - booking will be created after successful payment');
      console.groupEnd();

    } catch (error) {
      console.error('❌ Payment Preparation Error:', error);
      console.groupEnd();

      if (error instanceof Error) {
        alert(`Lỗi chuẩn bị thanh toán: ${error.message}`);
      } else {
        alert('Có lỗi xảy ra! Vui lòng thử lại.');
      }
    }
  }

  // Lấy số ngày và số đêm từ departureDates hoặc tourData
  let number_of_days = tourData.number_of_days;
  let number_of_nights = tourData.number_of_nights;
  if ((!number_of_days || !number_of_nights) && Array.isArray(departureDates) && tourData.departure_date_id) {
    const selectedDate = departureDates.find((d: any) => d.id === tourData.departure_date_id);
    if (selectedDate) {
      number_of_days = selectedDate.number_of_days || number_of_days;
      // Nếu không có number_of_nights, tính bằng number_of_days - 1 nếu hợp lý
      number_of_nights = selectedDate.number_of_nights || (selectedDate.number_of_days ? selectedDate.number_of_days - 1 : number_of_nights);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promo Success Notification */}
      {showPromoSuccess && promoSuccessData && (
        <div className="fixed top-4 right-4 z-50 bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-xl max-w-md animate-slide-in-right">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 mb-2 text-base">
                Áp dụng mã giảm giá thành công!
              </h3>
              <div className="text-sm text-orange-700 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Mã giảm giá:</span>
                  <span className="font-semibold bg-orange-100 px-2 py-0.5 rounded text-orange-800">
                    {promoSuccessData.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giá gốc:</span>
                  <span className="font-medium">{promoSuccessData.original.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá:</span>
                  <span className="font-semibold text-red-600">-{promoSuccessData.discount.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between border-t border-orange-200 pt-2 mt-2">
                  <span className="font-semibold">Thành tiền:</span>
                  <span className="font-bold text-orange-600 text-base">{promoSuccessData.final.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPromoSuccess(false)}
              className="ml-2 text-orange-400 hover:text-orange-600 transition-colors p-1 rounded-full hover:bg-orange-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-orange-100 rounded-full h-1">
            <div className="bg-orange-500 h-1 rounded-full animate-pulse" style={{
              animation: 'shrink 5s linear forwards'
            }}></div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold flex-1">
            Xác nhận đặt tour
            {hasSavedData && (
              <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Đã lưu dữ liệu
              </span>
            )}
            {/* Hiển thị trạng thái user */}
            <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
              isUserLoggedIn 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {isUserLoggedIn ? 'Tài khoản' : 'Khách vãng lai'}
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Đã loại bỏ UI chọn ngày khởi hành, chỉ hiển thị trong Thông tin tour */}
              {/* Thông tin liên hệ */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
                    {isUserLoggedIn && userInfo && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        <span>Tự động từ tài khoản: {userInfo.email}</span>
                      </div>
                    )}
                    {loadingUserInfo && (
                      <div className="text-sm text-gray-500">
                        Đang tải thông tin tài khoản...
                      </div>
                    )}
                  </div>
                  
                  {isUserLoggedIn && userInfo ? (
                    // Hiển thị thông tin đã đăng nhập (read-only)
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                          {userInfo.name || userInfo.username || "Chưa cập nhật"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-gray-700">
                          {userInfo.email}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          placeholder="Nhập số điện thoại"
                          required
                          pattern="[0-9]{10,11}"
                          title="Số điện thoại phải có 10-11 chữ số"
                          minLength={10}
                          maxLength={11}
                          value={formData.contactInfo.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleInputChange("contactInfo", "phone", value);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          Số CCCD <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="address"
                          placeholder="Nhập số CCCD"
                          required
                          pattern="[0-9]{12}"
                          title="Số CCCD phải có 12 chữ số"
                          minLength={12}
                          maxLength={12}
                          value={formData.contactInfo.address}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                            handleInputChange("contactInfo", "address", value);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    // Form nhập thông tin cho khách vãng lai
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Nhập họ và tên"
                          required
                          minLength={2}
                          maxLength={50}
                          title="Họ tên phải có từ 2-50 ký tự"
                          value={formData.contactInfo.fullName}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
                            handleInputChange("contactInfo", "fullName", value);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          required
                          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                          title="Vui lòng nhập email hợp lệ"
                          value={formData.contactInfo.email}
                          onChange={(e) => handleInputChange("contactInfo", "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          placeholder="0912345678"
                          required
                          pattern="[0-9]{10,11}"
                          title="Số điện thoại phải có 10-11 chữ số"
                          minLength={10}
                          maxLength={11}
                          value={formData.contactInfo.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            handleInputChange("contactInfo", "phone", value);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          Số CCCD <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="address"
                          placeholder="Nhập số CCCD"
                          required
                          pattern="[0-9]{12}"
                          title="Số CCCD phải có 12 chữ số"
                          minLength={12}
                          maxLength={12}
                          value={formData.contactInfo.address}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                            handleInputChange("contactInfo", "address", value);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thông tin người tham gia */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Thông tin người tham gia</h2>
                    <Button type="button" variant="outline" onClick={addParticipant}>
                      Thêm người
                    </Button>
                  </div>

                  {formData.participants.map((participant, index) => {
                    const isAdult = index < tourData.adults;
                    return (
                      <div key={index} className="mb-6 last:mb-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">
                            {isAdult ? `Người lớn ${index + 1}` : `Trẻ em ${index + 1 - tourData.adults}`}
                          </h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeParticipant(index)}
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                        {isAdult && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`participant-${index}-name`}>
                                Họ và tên <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`participant-${index}-name`}
                                placeholder="Nhập họ và tên"
                                required
                                value={participant.fullName}
                                onChange={(e) => handleParticipantChange(index, "fullName", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`participant-${index}-phone`}>
                                Số điện thoại <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id={`participant-${index}-phone`}
                                placeholder="Nhập số điện thoại"
                                required
                                value={participant.phone}
                                onChange={(e) => handleParticipantChange(index, "phone", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`participant-${index}-birthYear`}>Năm sinh</Label>
                              <Select
                                value={participant.birthYear}
                                onValueChange={(value) => handleParticipantChange(index, "birthYear", value)}
                              >
                                <SelectTrigger id={`participant-${index}-birthYear`}>
                                  <SelectValue placeholder="Chọn năm sinh" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 80 }, (_, i) => 2025 - i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`participant-${index}-idNumber`}>Số CMND/CCCD</Label>
                              <Input
                                id={`participant-${index}-idNumber`}
                                placeholder="Nhập số CMND/CCCD"
                                value={participant.idNumber}
                                onChange={(e) => handleParticipantChange(index, "idNumber", e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        {!isAdult && (
                          <div className="text-gray-500 italic">Không cần nhập thông tin cho trẻ em.</div>
                        )}
                        {index < formData.participants.length - 1 && <Separator className="mt-6" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Yêu cầu đặc biệt */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Yêu cầu đặc biệt</h2>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Ghi chú</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Nhập yêu cầu đặc biệt của bạn (nếu có)"
                      className="min-h-[100px]"
                      value={formData.specialRequests}
                      onChange={(e) => {
                        const newFormData = { ...formData, specialRequests: e.target.value };
                        setFormData(newFormData);
                        saveFormDataToStorage(newFormData);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Thông tin quy trình booking */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Quy trình đặt tour</h2>
                  {isUserLoggedIn ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">A</span>
                        </div>
                        <h3 className="font-semibold text-blue-800">Đặt tour với tài khoản</h3>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-2 list-disc pl-5">
                        <li>Booking sẽ được lưu vào tài khoản của bạn</li>
                        <li>Có thể xem lịch sử booking trong "Quản lý đặt tour"</li>
                        <li>Nhận thông báo qua email đã đăng ký</li>
                        <li>Hỗ trợ tốt hơn khi có vấn đề</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-600 font-semibold">G</span>
                        </div>
                        <h3 className="font-semibold text-orange-800">Đặt tour khách vãng lai</h3>
                      </div>
                      <ul className="text-sm text-orange-700 space-y-2 list-disc pl-5">
                        <li>Thông tin booking sẽ được gửi qua email người đại diện</li>
                        <li>Vui lòng lưu giữ email xác nhận để tra cứu</li>
                        <li>Có thể tra cứu booking bằng email và mã booking</li>
                        <li className="font-medium">Khuyến nghị: Đăng ký tài khoản để quản lý booking tốt hơn!</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Điều khoản và điều kiện */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      required
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        const newFormData = { ...formData, agreeToTerms: checked as boolean };
                        setFormData(newFormData);
                        saveFormDataToStorage(newFormData);
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Tôi đồng ý với các điều khoản và điều kiện
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Bằng cách đánh dấu vào ô này, bạn đồng ý với{" "}
                        <a href="#" className="text-primary underline">
                          điều khoản dịch vụ
                        </a>{" "}
                        và{" "}
                        <a href="#" className="text-primary underline">
                          chính sách bảo mật
                        </a>{" "}
                        của chúng tôi.
                      </p>
                      <ul className="text-xs text-gray-500 mt-2 list-disc pl-5">
                        <li>Khách hàng cần thanh toán đủ 100% giá trị tour trước ngày khởi hành.</li>
                        <li>Thanh toán có thể thực hiện qua chuyển khoản ngân hàng hoặc tại văn phòng công ty.</li>
                        <li>Vui lòng giữ lại biên lai/chứng từ thanh toán để đối chiếu khi cần thiết.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ô nhập mã giảm giá */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Mã giảm giá</h2>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Nhập mã giảm giá"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" onClick={() => handleApplyPromo()}>Áp dụng</Button>
                    {(discountAmount > 0 || promoCode) && (
                      <Button type="button" variant="outline" onClick={clearPromoCode}>Xóa</Button>
                    )}
                  </div>
                  {promoError && <div className="text-red-500 mt-2">{promoError}</div>}
                  {promoDescription && <div className="text-green-600 mt-2">{promoDescription}</div>}
                  {discountAmount > 0 && (
                    <div className="text-green-700 mt-2 font-semibold">
                      Đã áp dụng giảm {discountAmount.toLocaleString("vi-VN")}₫
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white px-8">
                  {isUserLoggedIn ? 'Tiếp tục thanh toán' : 'Đặt tour (Guest)'}
                </Button>
              </div>
            </form>
          </div>

          {/* Tour Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* VAT Info cho Agency */}
              {tourData.agency_id && (
                <VATInfo 
                  tourPrice={tourData.price * (tourData.adults + tourData.children) - discountAmount}
                  agencyId={tourData.agency_id}
                  referralCode={tourData.referral_code}
                />
              )}
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Thông tin tour</h2>

                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={tourData.image || "/placeholder.svg"}
                        alt={tourData.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{tourData.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Không có tên tour'}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{tourData.location || 'Đà Lạt'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{(() => {
                          // Ưu tiên lấy từ dữ liệu
                          if (number_of_days && typeof number_of_nights === 'number') {
                            return `${number_of_days} ngày ${number_of_nights} đêm`;
                          }
                          // Nếu thiếu, parse từ tên tour
                          const name = tourData.name || '';
                          const match = name.match(/(\d+)N(\d+)Đ/i);
                          if (match) {
                            const days = match[1];
                            const nights = match[2];
                            return `${days} ngày ${nights} đêm`;
                          }
                          // Nếu vẫn không có, fallback như cũ
                          return 'Không có';
                        })()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Ngày khởi hành:</span>
                      </div>
                      <span className="font-medium">
                        {tourData.departure_date_value
                          ? new Date(tourData.departure_date_value).toLocaleDateString("vi-VN")
                          : '5/9/2025'}
                      </span>
                    </div>
                    
                    {tourData.departure_location && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span>Điểm khởi hành:</span>
                        </div>
                        <span className="font-medium text-right flex-1 ml-4">
                          {tourData.departure_location}
                        </span>
                      </div>
                    )}
                    
                    {tourData.tour_categories && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Star className="w-4 h-4 mr-2 text-gray-500" />
                          <span>Loại tour:</span>
                        </div>
                        <span className="font-medium">
                          {tourData.tour_categories}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Người lớn:</span>
                      <div className="flex items-center">
                        <span className="font-medium">{tourData.adults} x</span>
                        <span className="ml-1">{tourData.price.toLocaleString("vi-VN")}₫</span>
                      </div>
                    </div>
                    {tourData.children > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trẻ em:</span>
                        <div className="flex items-center">
                          <span className="font-medium">{tourData.children} x</span>
                          <span className="ml-1">{(tourData.price * 0.5).toLocaleString("vi-VN")}₫</span>
                          <span className="text-xs text-green-600 ml-1">(50% giảm)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-xl text-red-500">
                      {(() => {
                        // Logic mới: người lớn full price, trẻ em 50% price
                        const adultPrice = tourData.price * tourData.adults;
                        const childPrice = tourData.price * 0.5 * tourData.children;
                        const basePrice = adultPrice + childPrice;
                        const total = finalPrice !== null ? finalPrice : basePrice - discountAmount;
                        
                        // Debug log
                        console.log('💰 Total calculation:', {
                          basePrice: basePrice.toLocaleString("vi-VN") + '₫',
                          discount: discountAmount.toLocaleString("vi-VN") + '₫',
                          finalPrice: finalPrice !== null ? finalPrice.toLocaleString("vi-VN") + '₫' : 'null',
                          calculatedTotal: total.toLocaleString("vi-VN") + '₫'
                        });
                        
                        return total.toLocaleString("vi-VN");
                      })()}₫
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
