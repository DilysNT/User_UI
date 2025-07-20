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

  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoDescription("");
    setPromotionId(null);
    setOriginalPrice(null);
    setFinalPrice(null);
    if (!promoCode.trim()) {
      setPromoError("Vui lòng nhập mã giảm giá.");
      return;
    }
    try {
      // Tính giá gốc theo logic backend: tour.price * (adults + children)
      const price = tourData.price * (tourData.adults + tourData.children);
      console.log('🧮 Calculating promo for price:', price.toLocaleString("vi-VN") + '₫');
      console.log('📊 Price breakdown:', {
        tourPrice: tourData.price.toLocaleString("vi-VN") + '₫',
        adults: tourData.adults,
        children: tourData.children,
        totalPeople: tourData.adults + tourData.children,
        calculatedPrice: price.toLocaleString("vi-VN") + '₫'
      });
      
      const res = await fetch("http://localhost:5000/api/bookings/validate-promotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotion_code: promoCode.trim(), tour_price: price }),
      });
      
      if (!res.ok) {
        setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        setDiscountAmount(0);
        setPromotionId(null);
        setOriginalPrice(null);
        setFinalPrice(null);
        return;
      }
      
      const data = await res.json();
      
      // Debug API response chi tiết
      console.group('🔍 Promotion API Response Debug');
      console.log('Full API Response:', data);
      console.log('Promotion Object:', data.promotion);
      console.log('Pricing Object:', data.pricing);
      console.log('Code:', data.promotion?.code);
      console.log('Fixed Discount Amount:', data.promotion?.discount_amount);
      console.log('Discount Percentage:', data.promotion?.discount_percentage);
      console.groupEnd();
      
      if (!data.valid) {
        setPromoError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        setDiscountAmount(0);
        setPromotionId(null);
        setOriginalPrice(null);
        setFinalPrice(null);
        return;
      }
      
      let discountAmount = data.pricing.discount_amount || 0;
      
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
      setPromoDescription(data.promotion.description || "");
      setPromotionId(data.promotion.id || null);
      setOriginalPrice(data.pricing.original_price || price);
      
      // Tính finalPrice theo logic backend mới: original_price - discountAmount
      const calculatedFinalPrice = (data.pricing.original_price || price) - discountAmount;
      setFinalPrice(calculatedFinalPrice);
      setPromoError("");
      
      console.log('✅ Promo applied:', {
        code: promoCode,
        originalPrice: (data.pricing.original_price || price).toLocaleString("vi-VN") + '₫',
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
    // 1. Tạo booking object đúng format
    // Nếu có user đăng nhập, lấy user_id từ localStorage/session, nếu không thì không gửi user_id
    // Tạo mảng guests, luôn có ít nhất 1 khách đại diện
    const guests = [
      {
        name: formData.contactInfo.fullName,
        phone: formData.contactInfo.phone,
        email: formData.contactInfo.email,
        cccd: formData.contactInfo.address,
      }
    ];
    // Nếu có thêm người tham gia, bổ sung vào guests
    if (formData.participants && formData.participants.length > 0) {
      formData.participants.forEach((p, idx) => {
        // Bỏ qua người đại diện đã có ở đầu mảng
        if (idx === 0) return;
        guests.push({
          name: p.fullName,
          phone: p.phone,
          email: formData.contactInfo.email,
          cccd: p.idNumber,
        });
      });
    }
    
    let bookingPayload: any = {
      tour_id: tourData.id,
      departure_date_id: tourData.departure_date_id,
      number_of_adults: tourData.adults,
      number_of_children: tourData.children,
      status: 'pending',
      guests,
      // Thông tin agency để tính phí VAT
      agency_id: tourData.agency_id || null,
      referral_code: tourData.referral_code || null,
    };

    // Tính toán pricing theo logic backend mới
    const pricingData = calculateBookingData(
      tourData.price,
      tourData.adults,
      tourData.children,
      finalPrice,
      discountAmount
    );

    // Validate pricing data trước khi gửi
    const validation = validatePricingData(
      pricingData.original_price,
      pricingData.total_price,
      discountAmount
    );

    if (!validation.isValid) {
      alert('Có lỗi trong tính toán giá. Vui lòng thử lại.');
      return;
    }

    // Backend sẽ tự tính original_price và discount_amount
    // Frontend chỉ cần gửi total_price và promotion_id
    bookingPayload.total_price = pricingData.total_price;
    
    // Thêm promotion_id nếu có discount
    if (promotionId) {
      bookingPayload.promotion_id = promotionId;
    }
    
    // Nếu có user đăng nhập thì thêm user_id
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (userId) {
      bookingPayload.user_id = userId;
    } else {
      bookingPayload.user_id = "3ca8bb89-a406-4deb-96a7-dab4d9be3cc1"; // id của guest3
    }
    
    if (promotionId) {
      bookingPayload.promotion_id = promotionId;
      bookingPayload.promo_code = promoCode;
    }
    
    // 2. Gửi 1 request duy nhất
    const bookingRes = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    
    if (!bookingRes.ok) {
      alert('Đặt tour thất bại!');
      return;
    }
    
    // Lưu thông tin booking vào localStorage để dùng cho Payment
    const bookingResult = await bookingRes.json();
    
    // 3. Tự động tính phí VAT nếu có agency_id
    if (tourData.agency_id && bookingResult.id) {
      try {
        const commissionResult = await calculateBookingCommission(bookingResult.id);
        if (commissionResult) {
          saveCommissionTracking(commissionResult);
          console.log('✅ VAT calculated and saved:', commissionResult);
          
          // Hiển thị thông báo thành công (tùy chọn)
          // alert(`🎉 Phí VAT ${commissionResult.commissionAmount.toLocaleString("vi-VN")}₫ đã được tính cho booking này`);
        }
      } catch (error) {
        console.warn('❌ Failed to calculate VAT:', error);
        // Không block user experience nếu tính phí VAT thất bại
      }
    }
    
    // Chuẩn bị data cho Payment.tsx với pricing đã tính toán
    const paymentData = {
      tour: {
        ...tourData,
        // Thêm thông tin pricing đã tính toán
        original_price: pricingData.original_price,
        total_price: pricingData.total_price,
        discount_amount: pricingData.calculated_discount,
        promotion_id: promotionId,
        promo_description: promoDescription
      },
      booking: bookingResult
    };
    
    localStorage.setItem("bookingData", JSON.stringify(paymentData));
    
    // Clear saved form data after successful booking
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('bookingPromoData');
    console.log('🧹 Cleared saved booking data after successful submission');
    
    // Chuyển hướng sang trang payment với bookingId vừa tạo
    router.push(`/tour/${bookingResult.id}/payment`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Promo Success Notification */}
      {showPromoSuccess && promoSuccessData && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-xl max-w-md animate-slide-in-right">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2 text-base">
                🎉 Áp dụng mã giảm giá thành công!
              </h3>
              <div className="text-sm text-green-700 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Mã giảm giá:</span>
                  <span className="font-semibold bg-green-100 px-2 py-0.5 rounded text-green-800">
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
                <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                  <span className="font-semibold">Thành tiền:</span>
                  <span className="font-bold text-green-600 text-base">{promoSuccessData.final.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPromoSuccess(false)}
              className="ml-2 text-green-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-green-100 rounded-full h-1">
            <div className="bg-green-500 h-1 rounded-full animate-pulse" style={{
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
                  <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Họ và tên <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Nhập họ và tên"
                        required
                        value={formData.contactInfo.fullName}
                        onChange={(e) => handleInputChange("contactInfo", "fullName", e.target.value)}
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
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleInputChange("contactInfo", "phone", e.target.value)}
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
                        value={formData.contactInfo.address}
                        onChange={(e) => handleInputChange("contactInfo", "address", e.target.value)}
                      />
                    </div>
                  </div>
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
                    <Button type="button" onClick={handleApplyPromo}>Áp dụng</Button>
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
                  Tiếp tục thanh toán
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
                      <h3 className="font-semibold text-base">{tourData.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{tourData.location || 'Đà Lạt'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{tourData.duration || 'Không có'}</span>
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
                          <span className="ml-1">{tourData.price.toLocaleString("vi-VN")}₫</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-xl text-red-500">
                      {(() => {
                        // Backend logic: original_price = tour.price * (adults + children)
                        const basePrice = tourData.price * (tourData.adults + tourData.children);
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

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 Travel Tour. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
