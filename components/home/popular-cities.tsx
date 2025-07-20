"use client";

import { Button } from "../../components/ui/button"
import { useState, useEffect } from "react";

type PopularCitiesProps = {
  onCityChange: (city: string) => void;
  selectedCity?: string;
  onTourClick?: (tourId?: string) => void;
};

const PopularCities = ({ onCityChange, selectedCity = "Đà Nẵng" }: PopularCitiesProps) => {
  const [locations, setLocations] = useState<Array<{ id: string; name: string; image_url?: string }>>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/search/top")
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations || []);
      })
      .catch(() => setLocations([]));
  }, []);

  const handleCityClick = (city: string) => {
    onCityChange(city);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Các Thành Phố Phổ Biến</h2>
          <p className="text-gray-600 max-w-1xl mx-auto">
            Khám phá những điểm đến tuyệt vời với các tour được tuyển chọn kỹ lưỡng của chúng tôi.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {locations.map((loc) => (
            <Button
              key={loc.id}
              onClick={() => handleCityClick(loc.name)}
              className={`rounded-full px-6 py-2 border text-sm font-medium transition flex items-center gap-2
                ${
                  selectedCity === loc.name
                    ? "bg-[#7BBCB0] text-white shadow-md"
                    : "bg-white text-black border-[#7BBCB0] hover:bg-[#7BBCB0]/10"
                }`}
              variant="ghost"
            >
              {loc.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularCities;