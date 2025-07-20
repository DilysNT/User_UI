"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Star, MapPin, Users, Clock } from "lucide-react";
import Footer from "@/components/home/footer";

export default function LocationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [destinationTours, setDestinationTours] = useState<any[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/api/locations")
      .then(res => res.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find((l: any) => l.id === id) : null;
        setLocation(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDestinationClick = async (dest: any) => {
    setSelectedDestination(dest);
    setLoadingTours(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tours/destination/${dest.id}`);
      const data = await res.json();
      setDestinationTours(data); // Sửa ở đây: API trả về mảng
    } catch {
      setDestinationTours([]);
    }
    setLoadingTours(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const handleBookTour = (tour: any) => {
    // Lưu đúng dữ liệu tour vào localStorage
    localStorage.setItem("selectedTour", JSON.stringify(tour));
    // Chuyển hướng đúng id tour
    if (tour && tour.id) {
      router.push(`/tour/${tour.id}`);
    } else if (tour && tour._id) {
      router.push(`/tour/${tour._id}`);
    } else {
      alert("Không tìm thấy thông tin tour hợp lệ!");
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;
  if (!location) return <div className="text-center py-20 text-red-500">Không tìm thấy điểm đến!</div>;

  return (
    <div className="pt-[120px]">
      <div className="container mx-auto px-4">
        <button
          className="flex items-center gap-2 mb-8 text-gray-700 hover:text-teal-600 font-medium"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        <div className="w-full md:w-1/2 h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          {location.image_url ? (
            <img src={location.image_url} alt={location.name} className="object-cover w-full h-full" />
          ) : (
            <span className="text-gray-400">Không có ảnh</span>
          )}
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{location.name}</h1>
          <div className="text-gray-600 mb-2">Tổng số địa danh: {location.destinations?.length || 0}</div>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Các địa danh nổi bật</h2>
      {!selectedDestination ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {location.destinations?.map((dest: any) => (
              <div
                key={dest.id}
                className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group border border-transparent hover:border-blue-400 transition-all duration-200 min-h-[220px] flex items-end"
                onClick={() => handleDestinationClick(dest)}
                style={{ minHeight: 220 }}
              >
                {/* Ảnh nền hoặc nền xám */}
                <div className="absolute inset-0 w-full h-full">
                {((dest.image && dest.image !== "null") || (dest.image_url && dest.image_url !== "null")) ? (
                  <img
                    src={dest.image && dest.image !== "null" ? dest.image : dest.image_url}
                    alt={dest.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-7xl font-extrabold text-gray-400">{dest.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                </div>
                {/* Overlay text và nút */}
                <div className="relative z-10 flex flex-col items-start justify-end h-full p-6 w-full">
                  <div className="text-2xl font-extrabold text-white mb-3 drop-shadow-lg tracking-wide">
                    {dest.name}
                  </div>
                  <button
                    className="px-5 py-2 rounded-full border border-white text-white bg-black/30 hover:bg-white hover:text-black font-semibold transition-all mt-2"
                    onClick={e => { e.stopPropagation(); handleDestinationClick(dest); }}
                  >
                    Xem các tour
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Khi đã chọn, hiển thị destination card ở trên và tour list ở dưới
          <div className="space-y-8">
            {/* Card overlay cho địa danh đã chọn */}
            <div className="flex justify-center">
              <div
                className="relative rounded-xl overflow-hidden shadow-lg w-full max-w-2xl min-h-[280px] flex items-end group border border-blue-400"
                style={{ minHeight: 280 }}
              >
                {/* Ảnh nền hoặc nền xám */}
                <div className="absolute inset-0 w-full h-full">
                  {((selectedDestination.image && selectedDestination.image !== "null") || (selectedDestination.image_url && selectedDestination.image_url !== "null")) ? (
                    <img
                      src={selectedDestination.image && selectedDestination.image !== "null" ? selectedDestination.image : selectedDestination.image_url}
                      alt={selectedDestination.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-8xl font-extrabold text-gray-400">{selectedDestination.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                </div>
                {/* Overlay text và nút */}
                <div className="relative z-10 flex flex-col items-start justify-end h-full p-8 w-full">
                  <div className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg tracking-wide">
                    {selectedDestination.name}
                  </div>
                  <button
                    className="px-6 py-3 rounded-full border border-white text-white bg-black/30 hover:bg-white hover:text-black font-semibold transition-all"
                    onClick={e => { e.stopPropagation(); setSelectedDestination(null); }}
                  >
                    Quay lại danh sách
                  </button>
                </div>
              </div>
            </div>
            
            {/* Danh sách tour */}
            <div
              key={selectedDestination?.id}
              className="transition-all duration-500 ease-in-out opacity-100 translate-y-0"
            >
              <h3 className="text-2xl font-bold mb-6 text-center">
                Các tour tại {selectedDestination.name}
              </h3>
              {loadingTours ? (
                <div className="text-center py-8 text-gray-500">Đang tải tour...</div>
              ) : destinationTours.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có tour nào cho địa danh này.</div>
              ) : (
                <div className="space-y-6">
                  {destinationTours.map(tour => (
                    <div
                      key={tour.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-80 h-48 md:h-40 relative flex-shrink-0">
                          <Image 
                            src={tour.images?.[0]?.image_url || "/placeholder.svg"} 
                            alt={tour.name} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 p-6 flex flex-col md:flex-row justify-between">
                          <div className="flex-1 md:pr-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3 line-clamp-2">{tour.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có'}</h3>
                            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1" title="Thời gian">
                                <Clock className="w-4 h-4" />
                                {tour.departureDates?.[0]?.number_of_days} ngày {tour.departureDates?.[0]?.number_of_nights} đêm
                              </span>
                              <span className="flex items-center gap-1" title="Số người">
                                <Users className="w-4 h-4" />
                                {tour.max_participants} khách
                              </span>
                              <span className="flex items-center gap-1" title="Điểm đến">
                                <MapPin className="w-4 h-4" />
                                {tour.destination}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tour.description}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">{renderStars(tour.rating || 4.5)}</div>
                              <span className="text-sm font-medium text-gray-700">{tour.rating || 4.5}</span>
                              <span className="text-sm text-gray-500">({tour.reviews || 0} đánh giá)</span>
                            </div>
                          </div>
                          <div className="flex flex-row md:flex-col justify-between md:justify-end items-end md:items-end mt-4 md:mt-0 md:text-right">
                            <div>
                              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                                {tour.price != null ? tour.price.toLocaleString("vi-VN") : "--"}₫
                              </div>
                              <div className="text-sm text-gray-500">mỗi người</div>
                            </div>
                            <button
                              onClick={() => handleBookTour(tour)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 ml-4 md:ml-0 md:mt-4"
                            >
                              Đặt ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      )}
      </div>
      <Footer />
    </div>
  );
} 