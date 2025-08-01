"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/home/header";
import HeroSection from "@/components/home/hero-section";
import PopularCities from "@/components/home/popular-cities";
import AlaskaShowcase from "@/components/home/alaska-showcase";
import FeaturedDestinations from "@/components/home/featured-destinations";
import Gallery from "@/components/home/gallery";
import LatestStories from "@/components/home/latest-stories";
import Footer from "@/components/home/footer";
import Image from "next/image";
import CityState from "@/components/home/CityState";
import PublicPromoCodes from "@/components/home/public-promo-codes";

// Dữ liệu ảo cho demo
const fakeTour = {
  id: "1",
  title: "Quảng Ninh - Vịnh Hạ Long",
  description: "Khám phá vẻ đẹp kỳ diệu của Vịnh Hạ Long với tour du lịch trọn gói, bao gồm tham quan các hòn đảo, hang động và thưởng thức ẩm thực địa phương.",
  duration: "2 ngày 1 đêm",
  transport: "Xe khách",
  plan: "Tour gia đình",
  category: "adventure",
  tags: ["Vịnh Hạ Long", "Du lịch Việt Nam", "Tour gia đình"],
  highlights: [
    "Tham quan các hòn đảo đá vôi",
    "Khám phá hang động kỳ thú",
    "Thưởng thức hải sản tươi ngon",
    "Trải nghiệm chèo kayak trên vịnh",
    "Ngắm hoàng hôn trên vịnh Hạ Long",
  ],
  itinerary: [
    {
      day: 1,
      activities: [
        "Khởi hành từ Hà Nội đi Hạ Long",
        "Tham quan Đảo Ti Tốp và bơi lội",
        "Thưởng thức bữa tối trên du thuyền",
        "Ngắm hoàng hôn trên vịnh",
      ],
    },
    {
      day: 2,
      activities: [
        "Tham quan Hang Sửng Sốt",
        "Chèo kayak tại Vịnh Hạ Long",
        "Thưởng thức bữa trưa trên du thuyền",
        "Trở về Hà Nội",
      ],
    },
  ],
  inclusions: [
    "Xe đưa đón từ Hà Nội",
    "Lưu trú trên du thuyền",
    "Các bữa ăn theo chương trình",
    "Hướng dẫn viên chuyên nghiệp",
    "Bảo hiểm du lịch",
  ],
  exclusions: [
    "Chi phí cá nhân",
    "Đồ uống trong các bữa ăn",
    "Phí tham quan ngoài chương trình",
  ],
  cancellationPolicy: "Hủy tour trước 7 ngày sẽ được hoàn tiền 100%. Hủy trong vòng 3-6 ngày sẽ được hoàn tiền 50%. Không hoàn tiền nếu hủy trong vòng 2 ngày trước ngày khởi hành.",
  termsAndConditions: "Tour có thể thay đổi lịch trình tùy theo thời tiết và tình hình thực tế. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.",
  location: "Quảng Ninh, Việt Nam",
  rating: 4.5,
  reviews: 128,
  price: 1890000,
  image: "/VinhHaLongBG.jpeg",
  // ...bổ sung các trường khác nếu cần
};

export default function Home() {
  const router = useRouter();

  // Hàm xử lý khi click vào 1 tour
  const handleTourClick = (tourId?: string) => {
    if (tourId) {
      router.push(`/details?id=${tourId}`);
    }
  };

  return (
    <>
      <div className="relative h-[90vh]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/home.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video.
        </video>
        <div className="absolute inset-0 z-10">
          <Header />
          <HeroSection />
        </div>
      </div>
      <PublicPromoCodes />
      <CityState />
      
      <FeaturedDestinations />
      <Gallery />
      <LatestStories />
      <Footer />
    </>
  );
}