import { useState } from "react";
import PopularCities from "./popular-cities";
import DaNangShowcase from "./alaska-showcase";

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Đà Nẵng");

  return (
    <>
      <PopularCities
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />
      <DaNangShowcase
        selectedCity={selectedCity}
      />
    </>
  );
}