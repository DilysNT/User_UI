import { Card, CardContent } from "../../components/ui/card"
import { Star, MapPin, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import Image from "next/image"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/api/search/top-destinations")
      .then(res => res.json())
      .then(data => setDestinations(Array.isArray(data?.destinations) ? data.destinations : []))
      .catch(() => setDestinations([]));
  }, []);

  const selectedDestination = selectedIdx !== null ? destinations[selectedIdx] : null;

  return (
    <section className="pt-[120px] pb-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Điểm đến nổi bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Khám phá những nơi tuyệt vời</p>
        </div>
        {/* Destination Cards Slider */}
        {destinations.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-xl">Không có điểm đến nổi bật</div>
        ) : (
          <div className="flex flex-row gap-6 justify-center items-end overflow-x-auto pb-6 no-scrollbar">
            {destinations.map((destination, idx) => (
              <div
                key={destination.id || destination._id || idx}
                className={`relative flex-shrink-0 rounded-3xl bg-white shadow-lg cursor-pointer transition-all duration-300 ${selectedIdx === idx ? 'scale-105 z-10' : 'scale-95 opacity-70'} min-w-[260px] max-w-xs w-[260px] h-[360px] flex flex-col items-center justify-end group`}
                style={{ boxShadow: selectedIdx === idx ? '0 8px 32px rgba(0,0,0,0.18)' : '' }}
                onClick={() => setSelectedIdx(idx)}
              >
                {/* Ảnh nền */}
                <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden">
                  {destination.image_url ? (
                    <img src={destination.image_url} alt={destination.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                {/* Overlay text */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6">
                  <div className="text-3xl font-bold text-white text-center mb-2 drop-shadow-lg">{destination.name}</div>
                  <div className="text-base text-white/90 text-center drop-shadow mb-2">{destination.tourCount || destination.tours?.length || 0} tour</div>
                  <span className="text-white/80 text-sm font-semibold mt-1">Xem tất cả</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Tour list for selected destination */}
        {selectedDestination && (
          <div>
            <div id="tour-list-scroll-anchor" className="h-[120px]"></div>
            <div>
              <h3 className="text-2xl font-bold text-teal-700 mb-6 text-center">Các tour tại {selectedDestination.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedDestination.tours || []).map((tour: any) => (
                  <div
                    key={tour.id}
                    className="relative rounded-2xl overflow-hidden shadow-lg bg-white group cursor-pointer min-h-[340px] flex items-end justify-center hover:shadow-2xl transition-all"
                    onClick={() => router.push(`/tour/${tour.id}`)}
                  >
                    {/* Ảnh nền */}
                    <div className="absolute inset-0 w-full h-full">
                      {tour.images && tour.images.length > 0 ? (
                        <img src={tour.images.find((img: any) => img.is_main)?.image_url || tour.images[0].image_url} alt={tour.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-100" />
                      )}
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                    {/* Overlay text */}
                    <div className="relative z-10 p-6 w-full flex flex-col justify-end h-full">
                      <div className="text-2xl font-bold text-white mb-2 flex items-center">
                        {tour.name?.replace(/\s*-\s*ADMIN UPDATED/gi, '') || 'Tên tour không có'}
                        <span className="text-sky-400 text-3xl ml-2">.</span>
                      </div>
                      <div className="text-white/90 text-base mb-2 line-clamp-2">{tour.description}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xl font-extrabold text-red-600">{tour.price ? tour.price.toLocaleString('vi-VN') + '₫' : 'Liên hệ'}</span>
                        <span className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-5 h-5 ${tour.rating && i <= Math.round(tour.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-white font-semibold ml-1">{tour.rating || ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}