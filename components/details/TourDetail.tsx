"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Clock, Users, MapPin, Calendar, Heart, Share2, ChevronLeft, ChevronRight, Navigation, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/home/header";
import Footer from "@/components/home/footer";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface TourDetailPageProps {
  tourId?: string;
}

export default function TourDetailPage({ tourId: propTourId }: TourDetailPageProps) {
  const router = useRouter();
  // Lấy tourId từ props nếu có, nếu không thì lấy từ URL params
  let tourId = propTourId;
  // Nếu không có propTourId, lấy từ URL (Next.js App Router)
  if (!tourId && typeof window !== "undefined") {
    // URL dạng /tour/[id]
    const match = window.location.pathname.match(/\/tour\/(.+)$/);
    if (match && match[1]) {
      tourId = match[1];
    }
  }
  // Không dùng useTourDetail nữa, chỉ dùng state 'tour' lấy từ endpoint /complete
  const [tour, setTour] = useState<any>(null);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [includedServices, setIncludedServices] = useState<any[]>([]);
  const [excludedServices, setExcludedServices] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [currentImg, setCurrentImg] = useState(0);
  const [selectedDepartureDateId, setSelectedDepartureDateId] = useState("");
  const [selectedDepartureDateValue, setSelectedDepartureDateValue] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [departureDates, setDepartureDates] = useState<any[]>([]);

  // Fetch tất cả thông tin tour khi có tourId
  useEffect(() => {
    if (!tourId) return;
    fetch(`http://localhost:5000/api/tours/${tourId}/complete`)
      .then(res => res.json())
      .then(data => {
        console.log('Tour data from API:', data); // Debug log
        setTour(data); // ĐÚNG: data là object tour
        setItineraries(data.itineraries || []);
        setIncludedServices(data.includedServices || []);
        setExcludedServices(data.excludedServices || []);
        setHotels(data.hotels || []);
        setTourCategories(data.tourCategories || []);
        // Có thể set thêm các trường khác nếu cần
      })
      .catch(() => {
        setTour(null);
        setItineraries([]);
        setIncludedServices([]);
        setExcludedServices([]);
        setHotels([]);
        setTourCategories([]);
      });
  }, [tourId]);

  // Fetch ngày khởi hành riêng nếu cần
  useEffect(() => {
    if (!tourId) return;
    fetch(`http://localhost:5000/api/departure-dates/by-tour/${tourId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDepartureDates(data);
        else if (data && Array.isArray(data.departureDates)) setDepartureDates(data.departureDates);
        else setDepartureDates([]);
      })
      .catch(() => setDepartureDates([]));
  }, [tourId]);

  const handleChangeAdults = (delta: number) => {
    setAdults((prev) => {
      const newValue = prev + delta;
      // Validation: min 1, max theo tour.max_participants
      if (newValue < 1) return 1;
      if (tour.max_participants && newValue > tour.max_participants) {
        alert(`Số lượng người lớn không được vượt quá ${tour.max_participants} người`);
        return prev;
      }
      return newValue;
    });
  };
  
  const handleChangeChildren = (delta: number) => {
    setChildren((prev) => {
      const newValue = prev + delta;
      // Validation: min 0, max theo tour.max_participants (tổng với adults)
      if (newValue < 0) return 0;
      if (tour.max_participants && (adults + newValue) > tour.max_participants) {
        alert(`Tổng số người không được vượt quá ${tour.max_participants} người`);
        return prev;
      }
      return newValue;
    });
  };

  const totalPrice = tour && tour.price
    ? adults * tour.price + children * tour.price * 0.5
    : 0;

  // Khi user bấm Đặt tour:
  const handleBookTour = () => {
    // Lấy ảnh chính để lưu vào localStorage
    let mainImage = "/placeholder.svg";
    if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
      const mainImg = tour.images.find(img => img.is_main);
      if (mainImg) {
        mainImage = mainImg.image_url;
      } else {
        mainImage = tour.images[0].image_url;
      }
    }

    // Lấy location từ tour data, ưu tiên location trước (địa điểm chính), sau đó destination
    const location = tour.location || tour.destination || tour.city || tour.place || 'Việt Nam';
    
    // Lấy thông tin đầy đủ để truyền sang booking
    const departureLocation = tour.departure_location || 'Không xác định';
    
    // Lấy tour categories từ mảng tourCategories
    const tourCategoryNames = tourCategories.length > 0 
      ? tourCategories.map(cat => cat.name || cat.category_name).join(', ') 
      : (tour.tour_type || 'Không xác định');

    // Tính duration từ itinerary hoặc tour data
    const duration = tour.duration || 
      (tour.itinerary && Array.isArray(tour.itinerary) ? 
        `${tour.itinerary.length} ngày ${tour.itinerary.length - 1} đêm` : 
        '4N3Đ');

    // Lấy thông tin agency từ user hiện tại (nếu có)
    const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
    const agencyId = currentUser?.agency_id || null;
    const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referral_code') || null : null;

    // Lưu thông tin tour + các state đã chọn vào localStorage
    localStorage.setItem('selectedTour', JSON.stringify({
      ...tour,
      adults,
      children,
      departure_date_id: selectedDepartureDateId,
      departure_date_value: selectedDepartureDateValue,
      image: mainImage, // Thêm ảnh chính
      location: location, // Địa điểm đến
      departure_location: departureLocation, // Điểm khởi hành
      tour_categories: tourCategoryNames, // Nhóm tour/category từ DB
      duration: duration, // Thời gian tour
      tourCategories: tourCategories, // Lưu cả mảng categories gốc
      agency_id: agencyId, // ID agency để tính phí VAT
      referral_code: referralCode, // Mã giới thiệu để tracking
    }));
    
    console.log('Saved tour data with commission info:', { 
      ...tour, 
      location, 
      departure_location: departureLocation,
      tour_categories: tourCategoryNames,
      duration: duration,
      tourCategories: tourCategories,
      image: mainImage,
      agency_id: agencyId,
      referral_code: referralCode 
    }); // Debug log
    
    // Chuyển sang trang booking với tourId
    router.push(`/booking/${tour.id}`);
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin tour.</p>
        </div>
      </div>
    );
  }

  // Xử lý gallery ảnh từ tour.images nếu có
  const defaultGalleryImages = [
    "/VinhHaLongBG.jpeg",
    "/VinhHaLong.jpeg",
    "/halong.jpeg",
    "/hoian.jpeg",
    "/cauvan.jpeg",
    "/phongnha.jpeg",
  ];
  

  let galleryImages: string[] = defaultGalleryImages;
  if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
    // Đưa ảnh chính (is_main) lên đầu, sau đó các ảnh còn lại
    const mainImg = tour.images.find(img => img.is_main);
    const otherImgs = tour.images.filter(img => !img.is_main);
    galleryImages = [
      ...(mainImg ? [mainImg.image_url] : []),
      ...otherImgs.map(img => img.image_url)
    ];
  }

  return (
    <div className="min-h-screen bg-white">
      <Header textColor="black" />

      <div className="container mx-auto px-4 py-8 pt-[120px]">
        <button
          className="flex items-center gap-2 mb-6 text-gray-700 hover:text-teal-600 font-medium"
          onClick={() => router.back()}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Quay lại
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tour Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có'}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">4.5</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{tour.location || 'Việt Nam'}</span>
                </div>
              </div>
            </div>

            {/* Main Image and Gallery */}
            <div className="mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden mb-4">
                <Image
                  src={galleryImages[currentImg] || "/placeholder.svg"}
                  alt={tour.name}
                  fill
                  className="object-cover"
                />
                {/* Nút mũi tên trái */}
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white z-10"
                  onClick={() => setCurrentImg((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                {/* Nút mũi tên phải */}
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white z-10"
                  onClick={() => setCurrentImg((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={`relative h-16 rounded overflow-hidden cursor-pointer hover:opacity-80 border ${currentImg === i ? "border-teal-500" : "border-transparent"}`}
                    onClick={() => setCurrentImg(i)}
                  >
                    <Image src={img} alt={`Ảnh ${tour.name} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Tag className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="font-medium">Loại tour</div>
                <div className="text-sm text-gray-600">
                  {tourCategories.length > 0 
                    ? tourCategories.map(cat => cat.name || cat.category_name).join(', ')
                    : (tour.tour_type || 'Không xác định')
                  }
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="font-medium">Số người</div>
                <div className="text-sm text-gray-600">{tour.min_participants}-{tour.max_participants}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="font-medium">Điểm đến</div>
                <div className="text-sm text-gray-600">{tour.location || 'Không xác định'}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Navigation className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="font-medium">Khởi hành từ</div>
                <div className="text-sm text-gray-600">{tour.departure_location}</div>
              </div>
            </div>

            {/* Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">{tour.description}</p>
              </div>
            </section>

            {/* Lịch trình */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Lịch trình</h2>
              <Accordion type="multiple">
                {itineraries.length === 0 && <div className="text-gray-500">Chưa có lịch trình.</div>}
                {itineraries.map((item, idx) => (
                  <AccordionItem key={item.id || idx} value={String(idx)}>
                    <AccordionTrigger>
                      Ngày {idx + 1}: {item.title || item.day_title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-gray-700 whitespace-pre-line">
                        {item.description || item.content}
                      </div>
                      {/* Hiển thị thêm các thông tin khác nếu có */}
                      {item.time && <div className="mt-2"><b>Thời gian:</b> {item.time}</div>}
                      {item.location && <div className="mt-2"><b>Địa điểm:</b> {item.location}</div>}
                      {item.note && <div className="mt-2"><b>Ghi chú:</b> {item.note}</div>}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Những thông tin cần lưu ý */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                Lưu ý
              </h2>
              <Accordion type="multiple">
                <AccordionItem value="included">
                  <AccordionTrigger>Dịch vụ bao gồm</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {includedServices.length === 0 && <li className="text-gray-500">Chưa có dữ liệu.</li>}
                      {includedServices.map((s, i) => (
                        <li key={s.id || i}>{s.name || s.service_name}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="excluded">
                  <AccordionTrigger>Dịch vụ không bao gồm</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {excludedServices.length === 0 && <li className="text-gray-500">Chưa có dữ liệu.</li>}
                      {excludedServices.map((s, i) => (
                        <li key={s.id || i}>{s.name || s.service_name}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="hotels">
                  <AccordionTrigger>Khách sạn dự kiến</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {hotels.length === 0 && <li className="text-gray-500">Chưa có dữ liệu.</li>}
                      {hotels.map((h, i) => (
                        <li key={h.id_hotel || h.id || i}>
                          <span className="font-medium">{h.ten_khach_san || h.name || h.hotel_name}</span>
                          {h.ten_phong && <span className="text-gray-600"> - {h.ten_phong}</span>}
                          {h.star_rating && (
                            <span className="text-yellow-500 ml-2">
                              {Array.from({length: h.star_rating}, (_, i) => '⭐').join('')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="policy">
                  <AccordionTrigger>Chính sách</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      <li>Chính sách hoàn/hủy: Vui lòng liên hệ để biết thêm chi tiết.</li>
                      <li>Khách phải mang theo giấy tờ tùy thân hợp lệ khi đi tour.</li>
                      <li>Thời gian và điểm đón có thể thay đổi tùy tình hình thực tế.</li>
                      <li>Chính sách trẻ em: Trẻ em dưới 12 tuổi tính 50% giá vé người lớn.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

  
            {/* <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Địa điểm tập trung</h2>
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">{tour.departure_location}</span>
              </div>
            </section> */}

            {/* Reviews */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Đánh giá khách hàng</h2>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-1">4.5</div>
                    <div className="flex justify-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= Math.round(4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">128 đánh giá</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Đặt Tour</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngày khởi hành</label>
                  <Select
                    value={selectedDepartureDateId}
                    onValueChange={id => {
                      setSelectedDepartureDateId(id);
                      const dateObj = departureDates.find((d: any) => d.id === id || d.departureDates_id === id);
                      setSelectedDepartureDateValue(dateObj?.departure_date || "");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngày khởi hành" />
                    </SelectTrigger>
                    <SelectContent>
                      {departureDates
                        .filter((dateObj: any) => {
                          if (!dateObj.departure_date) return false;
                          const departureDate = new Date(dateObj.departure_date);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Reset time to start of day
                          return departureDate >= today; // Chỉ hiển thị ngày từ hôm nay trở đi
                        })
                        .map((dateObj: any) => (
                        <SelectItem key={dateObj.id || dateObj.departureDates_id} value={dateObj.id || dateObj.departureDates_id}>
                          {dateObj.departure_date ? new Date(dateObj.departure_date).toLocaleDateString("vi-VN") : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guest Counter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Số lượng</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Người lớn</label>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-200" 
                          onClick={() => handleChangeAdults(-1)} 
                          disabled={adults <= 1}
                        >
                          -
                        </Button>
                        <span className="font-medium">{adults}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-200" 
                          onClick={() => handleChangeAdults(1)}
                          disabled={tour.max_participants && adults >= tour.max_participants}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Trẻ em</label>
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-200" 
                          onClick={() => handleChangeChildren(-1)} 
                          disabled={children <= 0}
                        >
                          -
                        </Button>
                        <span className="font-medium">{children}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-200" 
                          onClick={() => handleChangeChildren(1)}
                          disabled={tour.max_participants && (adults + children) >= tour.max_participants}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tổng tiền:</span>
                    <span className="text-lg font-bold text-red-500">
                      {totalPrice ? totalPrice.toLocaleString("vi-VN") : "Liên hệ"}₫
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {selectedDepartureDateId === "" && (
                    <div className="text-red-500 text-sm mb-2">Vui lòng chọn ngày khởi hành trước khi đặt tour.</div>
                  )}
                  {tour.min_participants && (adults + children) < tour.min_participants && (
                    <div className="text-red-500 text-sm mb-2">
                      Số lượng người tối thiểu là {tour.min_participants} người.
                    </div>
                  )}
                  {tour.max_participants && (adults + children) > tour.max_participants && (
                    <div className="text-red-500 text-sm mb-2">
                      Số lượng người không được vượt quá {tour.max_participants} người.
                    </div>
                  )}
                  <Button
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 font-medium"
                    onClick={() => {
                      if (!selectedDepartureDateId) {
                        alert('Vui lòng chọn ngày khởi hành');
                        return;
                      }
                      if (tour.min_participants && (adults + children) < tour.min_participants) {
                        alert(`Số lượng người tối thiểu là ${tour.min_participants} người`);
                        return;
                      }
                      if (tour.max_participants && (adults + children) > tour.max_participants) {
                        alert(`Số lượng người không được vượt quá ${tour.max_participants} người`);
                        return;
                      }
                      handleBookTour();
                    }}
                    disabled={!selectedDepartureDateId || 
                             (tour.min_participants && (adults + children) < tour.min_participants) ||
                             (tour.max_participants && (adults + children) > tour.max_participants)}
                  >
                    Xác nhận đặt tour
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
