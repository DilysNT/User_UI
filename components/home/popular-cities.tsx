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
}

export default PopularCities;