"use client"

import { Button } from "../../components/ui/button"
import { Heart, Share2, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { format } from "date-fns";

type Tour = {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  description: string
  image: string
  price: string
}

type WildlifeSectionProps = {
  onTourClick?: (tourId?: string) => void
}

// WildlifeSection component has been removed as requested.