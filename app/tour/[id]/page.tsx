"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Import động để chắc chắn chỉ render ở client
const TourDetail = dynamic(() => import("@/components/details/TourDetail"), { ssr: false });

export default function TourDetailPage() {
  const params = useParams();
  let tourId = "";
  if (params?.id) {
    tourId = Array.isArray(params.id) ? params.id[0] : params.id;
  }
  return <TourDetail tourId={tourId} />;
}
