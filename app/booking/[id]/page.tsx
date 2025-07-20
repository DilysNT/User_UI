"use client";
import Booking from "../../../components/details/Booking";
import { use } from "react";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <Booking params={resolvedParams} />;
}