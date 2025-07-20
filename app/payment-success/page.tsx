"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmationPage from "@/components/details/Confirmation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  
  // Lấy booking ID từ URL params hoặc localStorage
  const bookingId = searchParams.get("bookingId") || searchParams.get("orderId") || "";
  
  return <BookingConfirmationPage params={{ id: bookingId }} />;
} 