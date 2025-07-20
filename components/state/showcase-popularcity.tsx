"use client";

import { useState } from "react";
import PopularCities from "../home/popular-cities";
import DaNangShowcase from "../home/alaska-showcase";

const TourShowcaseContainer = () => {
  const [selectedCity, setSelectedCity] = useState<string>("Đà Nẵng");

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const handleTourClick = (tourId?: string) => {
    console.log("Tour clicked:", tourId);
  };

  return (
    <div>
      <PopularCities
        selectedCity={selectedCity}
        onCityChange={handleCityChange}
      />
      <DaNangShowcase 
        selectedCity={selectedCity}
        onTourClick={handleTourClick}
      />
    </div>
  );
};

export default TourShowcaseContainer;