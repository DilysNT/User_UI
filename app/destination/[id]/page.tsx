"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
          // Khi đã chọn, chia 2 cột: trái là card overlay, phải là tour
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card overlay cho địa danh đã chọn */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="relative rounded-xl overflow-hidden shadow-lg w-full min-h-[220px] flex items-end group border border-blue-400"
                style={{ minHeight: 220, maxWidth: 500 }}
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
                      <span className="text-7xl font-extrabold text-gray-400">{selectedDestination.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                </div>
                {/* Overlay text và nút */}
                <div className="relative z-10 flex flex-col items-start justify-end h-full p-6 w-full">
                  <div className="text-2xl font-extrabold text-white mb-3 drop-shadow-lg tracking-wide">
                    {selectedDestination.name}
                  </div>
                  <button
                    className="px-5 py-2 rounded-full border border-white text-white bg-black/30 hover:bg-white hover:text-black font-semibold transition-all mt-2"
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
              <div className="h-[120px]"></div>
            <h3 className="text-xl font-bold mb-4">
              Các tour tại {selectedDestination.name}
            </h3>
            {loadingTours ? (
              <div>Đang tải tour...</div>
            ) : destinationTours.length === 0 ? (
              <div>Không có tour nào cho địa danh này.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {destinationTours.map(tour => (
                  <div
                    key={tour.id}
                    className="bg-gray-50 rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition"
                    onClick={() => router.push(`/tour/${tour.id}`)}
                  >
                    <div className="font-semibold text-lg mb-2">{tour.name}</div>
                    <div className="text-gray-600 mb-1">{tour.description}</div>
                    <div className="text-sm text-gray-500">Giá: {tour.price?.toLocaleString("vi-VN")}₫</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 