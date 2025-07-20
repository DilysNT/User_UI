"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DestinationListPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:5000/api/locations")
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto pt-[120px] px-4">
      <button
        className="flex items-center gap-2 mb-8 text-gray-700 hover:text-teal-600 font-medium"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </button>
      <h1 className="text-3xl font-bold mb-8 text-center">Danh sách điểm đến</h1>
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {locations.map(loc => (
            <div
              key={loc.id}
              className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group border border-transparent hover:border-blue-400 transition-all duration-200"
              onClick={() => router.push(`/destination/${loc.id}`)}
              style={{ minHeight: 280 }}
            >
              {/* Ảnh nền */}
              <div className="absolute inset-0 w-full h-full">
                {loc.image_url ? (
                  <img src={loc.image_url} alt={loc.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-5xl font-bold text-gray-400">?</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
              </div>
              {/* Overlay text */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
                <div className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg tracking-wide flex items-center gap-2">
                  {loc.name}
            
                </div>
                <div className="text-lg font-semibold text-white/90 drop-shadow mb-1">
                  {loc.destinations?.length || 0} địa danh
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 